from flask import Flask, request, jsonify, send_from_directory
from flask import send_file
from flask_cors import CORS
import cv2
import torch
import numpy as np
import os
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Device Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running on device: {device}")

# Load Face Detector and Recognition Model
mtcnn = MTCNN(keep_all=True, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

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

    # Load Reference Image
    ref_img = Image.open(image_path).convert("RGB")
    ref_face = mtcnn(ref_img)

    if ref_face is None:
        return jsonify({"error": "No face detected in reference image"}), 400

    ref_face = ref_face.squeeze(0) if ref_face.dim() == 4 else ref_face
    ref_face = torch.nn.functional.interpolate(ref_face.unsqueeze(0), size=(160, 160), mode='bilinear', align_corners=False)
    ref_embedding = resnet(ref_face.to(device)).detach().cpu().numpy()

    # Process Video
    cap = cv2.VideoCapture(video_path)
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    out = cv2.VideoWriter(output_video_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

    timestamps = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_pil = Image.fromarray(rgb_frame)

        boxes, _ = mtcnn.detect(frame_pil)
        if boxes is not None:
            for box in boxes:
                x1, y1, x2, y2 = map(int, box)
                face_crop = frame_pil.crop((x1, y1, x2, y2))

                face_tensor = torch.tensor(np.array(face_crop)).permute(2, 0, 1).float() / 255.0
                face_tensor = torch.nn.functional.interpolate(face_tensor.unsqueeze(0), size=(160, 160), mode='bilinear', align_corners=False)

                face_embedding = resnet(face_tensor.to(device)).detach().cpu().numpy()
                distance = np.linalg.norm(face_embedding - ref_embedding)

                if distance < 0.7:  # Matching threshold
                    timestamp = frame_count / fps
                    timestamps.append(timestamp)

                    # Draw bounding box on frame
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, f"Match {timestamp:.2f}s", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        out.write(frame)

    cap.release()
    out.release()

    return jsonify({
        "timestamps": timestamps,
        "video_url": f"/get_video"
    })

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
