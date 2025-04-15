from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import base64
import torch
import numpy as np
import os
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from io import BytesIO
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# Device Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running on device: {device}")

# Load Face Detector and Recognition Model
mtcnn = MTCNN(keep_all=True, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)


UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "processed"
REFERENCE_DIR = "reference_faces"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(REFERENCE_DIR, exist_ok=True)

# Load reference embeddings from images
def load_reference_embeddings():
    embeddings = []
    for filename in os.listdir(REFERENCE_DIR):
        path = os.path.join(REFERENCE_DIR, filename)
        try:
            img = Image.open(path).convert("RGB")
            face = mtcnn(img)

            if face is not None:
                if face.dim() == 3:
                    # Unbatched face (C, H, W) -> (1, C, H, W)
                    face = face.unsqueeze(0)
                elif face.dim() == 4:
                    # Already batched, no need to change
                    pass
                else:
                    print(f"⚠️ Unexpected face dimensions from {filename}: {face.shape}")
                    continue

                face = face.to(device)
                embedding = resnet(face).detach().cpu().numpy()[0]
                embeddings.append((os.path.splitext(filename)[0], embedding))
            else:
                print(f"⚠️ No face detected in {filename}")
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
    return embeddings
# Load on app start
reference_embeddings = load_reference_embeddings()
print(f"✅ Loaded {len(reference_embeddings)} reference embeddings")



@app.route("/detect_faces", methods=["POST"])
def detect_faces():
    if "image" not in request.files or "video" not in request.files:
        return jsonify({"error": "Missing image or video file"}), 400

    image_file = request.files["image"]
    video_file = request.files["video"]

    image_path = os.path.join(UPLOAD_FOLDER, "person.jpeg")
    video_path = os.path.join(UPLOAD_FOLDER, "video.mp4")
    output_video_path = os.path.join(OUTPUT_FOLDER, "tracked_video.mp4")

    image_file.save(image_path)
    video_file.save(video_path)

    # Load and Process Reference Image
    ref_img = Image.open(image_path).convert("RGB")
    ref_face = mtcnn(ref_img)

    if ref_face is None:
        return jsonify({"error": "No face detected in reference image"}), 400

    ref_face = ref_face.squeeze(0) if ref_face.dim() == 4 else ref_face
    ref_face = torch.nn.functional.interpolate(ref_face.unsqueeze(0), size=(160, 160), mode='bilinear', align_corners=False)
    ref_embedding = resnet(ref_face.to(device)).detach().cpu().numpy()

    # Open Video for Processing
    cap = cv2.VideoCapture(video_path)
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    fps = max(1, int(cap.get(cv2.CAP_PROP_FPS)))  # Ensure FPS is at least 1
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video_path, fourcc, float(fps), (frame_width, frame_height))

    timestamps = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_pil = Image.fromarray(rgb_frame)

        # Detect faces in the frame
        boxes, _ = mtcnn.detect(frame_pil)

        if boxes is not None:
            face_tensors = []
            face_coords = []

            for box in boxes:
                x1, y1, x2, y2 = map(int, box)
                face_crop = frame_pil.crop((x1, y1, x2, y2))

                # Convert to tensor and resize
                face_tensor = torch.tensor(np.array(face_crop)).permute(2, 0, 1).float() / 255.0
                face_tensor = torch.nn.functional.interpolate(face_tensor.unsqueeze(0), size=(160, 160), mode='bilinear', align_corners=False)

                face_tensors.append(face_tensor)
                face_coords.append((x1, y1, x2, y2))

            # Batch process face embeddings
            if face_tensors:
                face_tensors = torch.cat(face_tensors).to(device)
                face_embeddings = resnet(face_tensors).detach().cpu().numpy()

                # Compare all detected faces with reference face
                for i, face_embedding in enumerate(face_embeddings):
                    distance = np.linalg.norm(face_embedding - ref_embedding)
                    if distance < 0.7:  # Matching threshold
                        timestamp = frame_count / fps
                        timestamps.append(timestamp)

                        x1, y1, x2, y2 = face_coords[i]
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, f"Match {timestamp:.2f}s", (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        out.write(frame)

    cap.release()
    out.release()

    return jsonify({
        "timestamps": timestamps,
        "video_url": "/get_video"
    })
    
    
'''
# Optional: Send email on match
def send_email_alert(name):
    sender_email = "your.email@example.com"
    receiver_email = "receiver@example.com"
    password = "your_app_password"  # Use App Password for Gmail

    message = MIMEMultipart("alternative")
    message["Subject"] = f"⚠️ Match Found: {name}"
    message["From"] = sender_email
    message["To"] = receiver_email

    text = f"A match for '{name}' has been detected in the live camera feed."
    message.attach(MIMEText(text, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print(f"✅ Email sent for match: {name}")
    except Exception as e:
        print("❌ Failed to send email:", e)
'''

# Main endpoint for face recognition
@app.route("/api/face-recognition", methods=["POST"])
def live_face_recognition():
    data = request.json
    image_data = data.get("image")
    
    if not image_data:
        return jsonify({"error": "No image data provided"}), 400

    try:
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        img = Image.open(BytesIO(image_bytes)).convert("RGB")

        # Detect face boxes
        boxes, _ = mtcnn.detect(img)

        if boxes is not None:
            for box in boxes:
                x1, y1, x2, y2 = map(int, box)
                face_crop = img.crop((x1, y1, x2, y2))

                # Convert to tensor and preprocess
                face_tensor = torch.tensor(np.array(face_crop)).permute(2, 0, 1).float() / 255.0
                face_tensor = face_tensor.unsqueeze(0).to(device)

                # Resize if necessary
                if face_tensor.shape[-2:] != (160, 160):
                    face_tensor = torch.nn.functional.interpolate(
                        face_tensor,
                        size=(160, 160),
                        mode='bilinear',
                        align_corners=False
                    )

                # Generate embedding
                face_embedding = resnet(face_tensor).detach().cpu().numpy()[0]

                # Compare with reference embeddings
                for name, ref_embedding in reference_embeddings:
                    distance = np.linalg.norm(face_embedding - ref_embedding)
                    print(f"Distance to {name}: {distance:.3f}")  # Optional logging

                    if distance < 0.7:
                        # Match found
                        # send_email_alert(name)  # Uncomment when ready
                        return jsonify({"match": True, "person": name})

        # No match found
        return jsonify({"match": False})

    except Exception as e:
        print("❌ Error during recognition:", e)
        return jsonify({"error": "Processing error"}), 500
    
    
# Endpoint to reload reference images without restarting server
@app.route("/reload_references", methods=["POST"])
def reload_references():
    global reference_embeddings
    reference_embeddings = load_reference_embeddings()
    return jsonify({"message": "Reference faces reloaded", "count": len(reference_embeddings)})


@app.route("/get_video", methods=["GET"])
def get_video():
    video_path = os.path.join(os.getcwd(), OUTPUT_FOLDER, "tracked_video.mp4")    
    print(f"Looking for video at: {os.path.abspath(video_path)}")
    if os.path.exists(video_path):
        return send_file(video_path, mimetype="video/mp4", as_attachment=False)
    else:
        return jsonify({"error": "Video file not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
