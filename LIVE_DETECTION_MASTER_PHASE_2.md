# ReWorth.AI
# Phase 2 - Live AI Detection Integration (Master Specification)

---

# Objective

Integrate the user's custom trained YOLO model into the existing optimized ReWorth.AI architecture and complete the entire real-time detection pipeline.

This phase must transform the application from:

Camera Preview

↓

Manual Finalize Detection

into

Real-Time AI Detection

while preserving the current architecture created during Website Optimization Phase 1.

This phase is implementation-focused.

Do NOT redesign the application.

Do NOT rewrite the architecture.

Improve only the live AI detection pipeline and fix the known issues.

---

# Existing Project State

Phase 1 has already completed successfully.

The following are already working:

✓ Authentication

✓ Student Dashboard

✓ Admin Dashboard

✓ QR Session

✓ Camera Preview

✓ FastAPI Backend

✓ Database

✓ Rewards System

✓ Leaderboard

✓ WebSocket

✓ CameraService

✓ DetectionService

✓ DetectionOverlay

✓ YOLO Wrapper

✓ backend/yolo/best.pt loads successfully

The architecture must remain intact.

---

# CRITICAL REQUIREMENT

The project MUST use ONLY the user's trained model.

Model:

backend/yolo/best.pt

Never replace this model.

Never download another model.

Never switch to COCO classes.

Never switch to pretrained YOLO.

Never simulate detections.

Never generate fake detections.

Everything must come directly from:

backend/yolo/best.pt

---

# Current Problems

The following issues currently exist.

Every issue below must be investigated and fixed.

---

## Problem 1

Camera preview works.

YOLO loads.

Detection API works.

However the website is NOT displaying live detections.

Current behaviour

Camera

↓

Object visible

↓

No detection

Expected

Camera

↓

Bottle visible

↓

Bounding box

↓

Plastic Bottle

↓

Confidence

↓

Credits

---

## Problem 2

Detection only appears after pressing

Finalize & Collect Credits.

This is incorrect.

Detection must occur continuously while the camera is running.

---

## Problem 3

The detected class sometimes changes.

Example

Real object

Plastic Bottle

YOLO prediction

Plastic Bottle

Website stores

Paper

This indicates the frontend or backend is replacing or remapping detections incorrectly.

Find the root cause.

Fix it.

Never hardcode classes.

Never replace detections.

Never fallback to another waste type.

The stored waste type must exactly equal the model output.

---

## Problem 4

DetectionOverlay is not rendering actual YOLO detections.

It must render

Bounding Boxes

Class Name

Confidence

Credits

using ONLY backend inference.

No placeholder boxes.

No random animation.

No mock overlay.

---

## Problem 5

The rewards page flickers rapidly after Finalize.

Investigate

React rendering

WebSocket subscriptions

duplicate listeners

duplicate timers

state synchronization

hydration

API polling

Fix the root cause.

Do NOT hide the symptom.

---

## Problem 6

Dashboard flickers after reward updates.

Stabilize rendering.

Prevent unnecessary rerenders.

---

## Problem 7

Camera cleanup.

When leaving the page

Stop MediaStream

Clear timers

Cancel pending frame uploads

Disconnect unnecessary listeners

Prevent memory leaks

---

# Required Live Detection Pipeline

The application must follow exactly this pipeline.

Phone Camera

↓

CameraService

↓

Capture Frame (300-500 ms)

↓

Compress JPEG

↓

POST

/api/v1/detect/frame

↓

Detection Router

↓

DetectionService.process_frame()

↓

detector.detect(image_data)

↓

backend/yolo/yolo_detector.py

↓

best.pt

↓

Inference

↓

DetectionService

↓

Frontend DetectionOverlay

↓

Live Bounding Box

↓

Live Class Name

↓

Live Confidence

↓

Live Credits

This is the ONLY source of truth.

Nothing else should generate detections.

---

# Real-Time Detection Behaviour

While the recycling session is active

repeat every

300-500 ms

Capture frame

↓

Run YOLO

↓

Receive detections

↓

Update overlay

↓

Repeat

The user must never press Finalize to see detections.

Detection is LIVE.

---

# Detection Overlay Requirements

The overlay must continuously display

Bounding Box

Waste Class

Confidence

Credits

The overlay should follow moving objects.

Boxes should update smoothly.

No flashing.

No stale boxes.

No disappearing objects.

---

# Backend Verification

Verify the following pipeline.

backend/app/api/v1/routers/detection.py

↓

backend/app/services/detection_service.py

↓

app/utils/detector.py

↓

backend/yolo/yolo_detector.py

↓

best.pt

↓

Detection JSON

Verify every layer.

Remove any remaining mock logic.

---

# Detection Response

Frontend must consume ONLY backend responses.

Expected structure

{
    "detections":[
        {
            "class":"Plastic Bottle",
            "confidence":0.97,
            "credits":10
        }
    ]
}

Never create detections inside React.

---

# Finalize Behaviour

When

Finalize & Collect Credits

is pressed

DO NOT

capture another frame.

Instead

Use the latest successful detection currently displayed in the Live Detection Preview.

Example

Live Preview

Plastic Bottle

97%

↓

Finalize

↓

Save Plastic Bottle

↓

Award Plastic Bottle Credits

↓

Update Database

The Finalize button must never cause another classification.

---

# Performance

Maintain

Smooth camera preview

300-500 ms inference

Single active upload request

Cancel previous request if necessary

No duplicate frame uploads

Memoized DetectionOverlay

No unnecessary rerenders

No duplicate websocket events

---

# Logging

Useful logs

YOLO Model Loaded

Frame Received

Frame Sent

Inference Started

Inference Completed

Detected Class

Confidence

Credits Awarded

Session Finished

Inference Failed

Camera Stopped

---

# Files To Review

backend/app/services/detection_service.py

backend/app/utils/detector.py

backend/yolo/yolo_detector.py

backend/app/api/v1/routers/detection.py

services/CameraService.ts

api/DetectionService.ts

components/shared/DetectionOverlay.tsx

store/useCameraStore.ts

store/useSessionStore.ts

store/useWebSocketStore.ts

app/(student)/dashboard/page.tsx

Review any additional files required to complete this phase.

---

# Restrictions

Do NOT redesign the UI.

Do NOT change authentication.

Do NOT modify unrelated modules.

Do NOT replace the project architecture.

Do NOT introduce another detection pipeline.

Use the existing architecture.

Improve it.

---

# Validation Checklist

Before marking this phase complete verify all of the following.

☐ Camera preview works

☐ Frames stream continuously

☐ best.pt performs inference

☐ Bounding boxes appear live

☐ Class labels appear live

☐ Confidence appears live

☐ Credits appear live

☐ Plastic Bottle remains Plastic Bottle

☐ No incorrect class mapping

☐ Finalize uses latest live detection

☐ Correct credits awarded

☐ Correct database record stored

☐ Rewards page no longer flickers

☐ Dashboard no longer flickers

☐ Camera cleanup verified

☐ No duplicate requests

☐ No mock detections remain

---

# Final Report

Provide

1. Files modified

2. Bugs fixed

3. Performance improvements

4. AI integration improvements

5. Remaining manual work

6. Confirmation that

the user's trained YOLO model

backend/yolo/best.pt

is now driving

real-time live detection

throughout the website.

Do NOT begin Phase 3.