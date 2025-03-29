import cv2
import torch
import numpy as np
import os
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image

# Device Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running on device: {device}")

# Load Face Detector and Recognition Model
mtcnn = MTCNN(keep_all=True, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Load Reference Image
ref_img_path = "person.jpeg"  # Replace with your image file
ref_img = Image.open(ref_img_path).convert("RGB")
ref_face = mtcnn(ref_img)

if ref_face is None:
    raise ValueError("No face detected in the reference image.")

# Fix input shape issue
ref_face = ref_face.squeeze(0) if ref_face.dim() == 4 else ref_face
ref_face = torch.nn.functional.interpolate(ref_face.unsqueeze(0), size=(160, 160), mode='bilinear', align_corners=False)
ref_embedding = resnet(ref_face.to(device)).detach().cpu().numpy()

# Create Output Folder
output_folder = "detected_faces"
os.makedirs(output_folder, exist_ok=True)

# Process Video
video_path = "video.mp4"  # Replace with your video file
cap = cv2.VideoCapture(video_path)
frame_width = int(cap.get(3))
frame_height = int(cap.get(4))
fps = int(cap.get(cv2.CAP_PROP_FPS))
out = cv2.VideoWriter("Video_tracked.mp4", cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

timestamps = []
frame_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    frame_count += 1
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame_pil = Image.fromarray(rgb_frame)
    
    # Detect faces
    boxes, _ = mtcnn.detect(frame_pil)

    if boxes is not None:
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box)
            face_crop = frame_pil.crop((x1, y1, x2, y2))  # Crop the detected face
            
            # Convert face to tensor & resize properly
            face_tensor = torch.tensor(np.array(face_crop)).permute(2, 0, 1).float() / 255.0  # Normalize
            face_tensor = torch.nn.functional.interpolate(face_tensor.unsqueeze(0), size=(160, 160), mode='bilinear', align_corners=False)
            
            # Extract embedding
            face_embedding = resnet(face_tensor.to(device)).detach().cpu().numpy()
                
            # Compare Faces
            distance = np.linalg.norm(face_embedding - ref_embedding)
            if distance < 0.6:  # Threshold for matching
                timestamp = frame_count / fps
                timestamps.append(timestamp)
                
                # Save detected face
                face_save_path = os.path.join(output_folder, f"person_at_{timestamp:.2f}s.jpg")
                face_crop.save(face_save_path)
                
                # Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f"Match {timestamp:.2f}s", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    out.write(frame)

cap.release()
out.release()

# Save timestamps to a text file
with open("timestamps.txt", "w") as f:
    for t in timestamps:
        f.write(f"Found at: {t:.2f} seconds\n")

print("Processing complete. Check 'Video_tracked.mp4', 'timestamps.txt', and 'detected_faces' folder.")
