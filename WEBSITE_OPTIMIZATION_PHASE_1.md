# IMPORTANT

This project already has a working frontend and backend.

DO NOT rebuild the project from scratch.

DO NOT redesign the UI.

DO NOT change the existing folder structure unless necessary.

DO NOT delete working features.

DO NOT replace FastAPI.

DO NOT replace MySQL.

DO NOT replace authentication.

Instead:

- Analyze the existing codebase.
- Fix bugs.
- Optimize performance.
- Improve architecture.
- Keep the current design.
- Prepare the project for Phase 2 (YOLO Integration).

# ReWorth AI - Phase 1: Website Optimization Before YOLO Integration

## Role

You are a Senior Full Stack Software Engineer, Software Architect, Frontend Engineer, Backend Engineer, and Performance Optimization Expert.

---

# Objective

The ReWorth AI project is already built and functional.

Your task is **NOT** to redesign the website.

Your task is to optimize, stabilize, clean, and prepare the existing project for seamless integration with a real YOLO AI model.

This is **Phase 1 only**.

Do NOT integrate the YOLO model in this phase.

Instead, prepare the website so that the AI model can be integrated easily in Phase 2.

---

# Important Rules

DO NOT

- Change the UI design
- Change branding
- Change color palette
- Remove existing features
- Replace the backend
- Replace the database
- Rewrite the project

KEEP

- Current UI
- Current UX
- Current layouts
- Current pages
- Existing workflow

Only improve the architecture and fix issues.

---

# Current Architecture

Current project consists of:

- Next.js Frontend
- FastAPI Backend
- MySQL Database
- JWT Authentication
- WebSocket Support
- AI Detection Module
- Rewards System
- QR Session Workflow

The project already works but requires optimization.

---

# Goal

After this optimization the architecture should become:

Phone Camera

↓

Frontend

↓

POST /api/v1/detect/frame

↓

FastAPI Backend

↓

YOLO Model (best.pt)

↓

Detection Result

↓

EcoCredits

↓

Database

↓

Website Live Update

The frontend must never directly access the YOLO model.

---

# Task 1 - Fix All Bugs

Search the complete project and fix all issues.

Examples:

- Infinite React rendering
- Hydration mismatch
- Blinking pages
- Flickering UI
- Refresh loops
- Memory leaks
- Duplicate API requests
- Broken routing
- Broken navigation
- WebSocket reconnect loops
- Duplicate listeners
- State update loops
- Race conditions
- Loading loops
- Unhandled exceptions
- Missing error handling

The application must run without console errors.

---

# Task 2 - Camera Architecture

Replace the current camera implementation with a reusable Camera Service.

Requirements

- navigator.mediaDevices.getUserMedia()
- Desktop webcam support
- Android support
- iPhone support
- Front camera
- Rear camera
- Camera switching
- Camera permission handling
- Camera disconnect handling
- Browser compatibility

Display only the live camera feed.

Do NOT perform AI inference inside React.

---

# Task 3 - Frame Capture Layer

Create a reusable Camera Service.

Responsibilities

- Capture frame every 300–500 ms
- Resize image to 640×640
- Convert to JPEG
- Compress image
- Convert to Base64
- Send frame to backend
- Pause capture when browser tab is inactive
- Resume automatically

The UI must never contain AI logic.

---

# Task 4 - API Layer

Create a centralized API service.

Endpoint

POST

/api/v1/detect/frame

Payload

```json
{
  "frame":"base64_image"
}
```

Use Axios.

Include

- timeout
- retry
- cancellation
- JWT token
- centralized error handling
- reusable request methods

---

# Task 5 - Detection Layer

The frontend must NEVER guess detections.

Only display backend responses.

Expected response

```json
{
  "detections":[
    {
      "class":"Plastic Bottle",
      "confidence":0.97,
      "credits":10
    }
  ]
}
```

Display

- Waste Type
- Confidence
- Credits Earned

---

# Task 6 - Session Management

Improve recycling session handling.

Show

- Session ID
- Countdown Timer
- Remaining Time
- Session Status

Automatically stop

- Camera upload
- API calls

when the session expires.

---

# Task 7 - WebSocket Optimization

Maintain only ONE socket connection.

Handle events

- detection
- credits_updated
- leaderboard_updated
- session_expired

Prevent duplicate listeners.

Reconnect safely.

---

# Task 8 - State Management

Separate application state.

Stores

- Authentication
- Camera
- Session
- Detection
- Rewards
- Leaderboard
- Profile

Do not mix unrelated state.

---

# Task 9 - Detection Overlay

Create reusable overlay components.

Support

- Bounding Boxes
- Labels
- Confidence
- Credits
- Smooth animations

Overlay must be reusable.

---

# Task 10 - Error Handling

Handle gracefully

- Camera unavailable
- Camera permission denied
- Camera disconnected
- Backend offline
- YOLO unavailable
- Duplicate detection
- Session expired
- Unauthorized
- Network timeout

Display clean toast notifications.

---

# Task 11 - Performance Optimization

Optimize

- React rendering
- Images
- Bundle size
- API calls
- Memory usage
- Lazy loading
- Memoization

Remove unnecessary re-renders.

---

# Task 12 - Mobile Optimization

Support

- Android Chrome
- Samsung Internet
- Firefox
- Edge
- Safari

Support

- Portrait
- Landscape
- Mobile camera

---

# Task 13 - Code Cleanup

Remove

- Dead code
- Duplicate components
- Unused imports
- Mock APIs
- Fake detections
- Simulated deposits
- Temporary testing buttons
- Unused services

Keep production-ready code only.

---

# Task 14 - Folder Structure

Organize modules

```
camera/
api/
services/
hooks/
store/
components/
websocket/
utils/
```

Camera logic must remain isolated.

API logic must remain isolated.

Detection UI must remain isolated.

---

# Task 15 - Logging

Add useful development logs.

Examples

- Camera Started
- Camera Closed
- Frame Captured
- Frame Uploaded
- Detection Received
- Credits Updated
- Session Started
- Session Expired

---

# Task 16 - AI Integration Ready

Prepare the project for Phase 2.

Requirements

The frontend should communicate ONLY with the backend API.

The frontend must NEVER

- Import YOLO
- Import OpenCV
- Load best.pt
- Perform inference

All AI processing belongs inside the FastAPI backend.

Future replacement of best.pt should require ZERO frontend changes.

---

# Deliverables

Return the optimized project with

- Stable pages
- No blinking
- No refresh loops
- Working live camera
- Working session timer
- Production-ready API layer
- Optimized WebSocket
- Clean architecture
- Mobile support
- Better performance
- AI integration-ready frontend
- No mock detection
- No simulation buttons
- No fake data

---

# Phase Completion Criteria

This phase is complete only if

✓ The website is stable

✓ Camera works on desktop and mobile

✓ Frames are ready to be sent to FastAPI

✓ API layer is production-ready

✓ WebSocket works correctly

✓ Session management is stable

✓ UI has no blinking

✓ Architecture is clean

✓ The project is ready for Phase 2 (YOLO integration)
# Final Report

After completing all tasks, provide:

1. List of files modified.
2. List of bugs fixed.
3. List of performance improvements.
4. List of new folders/files created.
5. Any remaining issues that require manual work.
6. Confirmation that the project is ready for Phase 2 (YOLO Integration).