# AI-Based Missing Person Detection

A Python-based facial recognition system that identifies missing persons by comparing a provided image with faces detected in public surveillance video feeds. The system uses **deep learning-based face embeddings** for robust and accurate recognition.

## Features
- **Face Detection** using MTCNN for high accuracy across varied lighting and angles.
- **Face Recognition** with InceptionResNetV1 pretrained model for deep embeddings.
- **Video Frame Processing** to annotate matched faces and extract timestamps.
- **Flask Backend API** for image/video uploads and real-time processing.
- **Match Results** returned as:
  - Annotated processed video
  - Matched timestamps in JSON format

## Tech Stack
- **Language:** Python
- **Frameworks:** Flask, PyTorch
- **Libraries:** MTCNN, InceptionResNetV1, OpenCV, NumPy
- **Deployment:** Local or Cloud (GCP/VM)

## Project Workflow
1. **Upload Image** – Image of the missing person is provided.
2. **Upload Video** – Surveillance or recorded footage is uploaded.
3. **Processing** – System detects faces in video frames, generates embeddings, and compares them to the uploaded image.
4. **Output** – Annotated video with bounding boxes around matched faces and timestamps.

## Installation
```bash
# Clone the repository
git clone https://github.com/username/missing-person-detection.git
cd missing-person-detection

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows use venv\Scripts\activate

# Run Flask app
python app.py
```
Access the API at http://localhost:5000

Endpoints:
1. /upload – Upload image and video
2. /process – Start face recognition process

## Results
Annotated Video – Faces matching the uploaded image are highlighted with bounding boxes.

Timestamps JSON – Contains list of frames/time where matches were found.
