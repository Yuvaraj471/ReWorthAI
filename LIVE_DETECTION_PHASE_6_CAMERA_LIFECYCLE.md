# Phase 6.0 – Camera Lifecycle Stabilization & Session Flow

## Objective

The AI detection pipeline is functioning correctly.

YOLO inference, live detection, multi-object detection, duplicate prevention, rewards, dashboard updates, and automatic session reset are all operational.

However, after a recycling session finishes, the frontend continues sending camera frames to:

POST /api/v1/detect/frame

This causes unnecessary backend requests and eventually produces:

400 No active recycling session found

and browser runtime errors.

This phase focuses ONLY on stabilizing the camera lifecycle.

Do NOT redesign the application.

Do NOT modify the YOLO model.

Do NOT modify authentication.

Do NOT modify rewards.

Do NOT modify leaderboard logic.

Only improve the lifecycle of the live camera and detection flow.

--------------------------------------------------------

Current Working Features

✔ Login

✔ Student Dashboard

✔ Admin Dashboard

✔ QR Session

✔ Live Camera

✔ YOLO Detection

✔ Multiple Object Detection

✔ Duplicate Prevention

✔ Confidence Threshold (60%)

✔ Session Timer

✔ EcoCredits

✔ Rewards

✔ Leaderboard

✔ Activity History

✔ Automatic Session Reset

These features MUST continue working.

--------------------------------------------------------

Task 1

Inspect the complete camera lifecycle.

Document the following sequence.

Idle

↓

Start Recycling Session

↓

Camera Opens

↓

Frame Capture

↓

POST /detect/frame

↓

YOLO Detection

↓

Current Session Deposits

↓

Finalize

↓

POST /detect/finalize

↓

POST /sessions/end

↓

Camera Stops

↓

Return to Idle

Ensure there are no hidden states.

--------------------------------------------------------

Task 2

Stop Frame Uploads

Immediately after:

POST /detect/finalize

and

POST /sessions/end

successfully complete,

the application must:

• stop frame capture

• stop requestAnimationFrame

• clear every interval

• clear every timeout

• cancel pending requests

• release MediaStream

• stop webcam tracks

No additional frame uploads should occur after session completion.

--------------------------------------------------------

Task 3

Session State Protection

Introduce a dedicated camera/session state.

Example

sessionActive = true

while scanning

sessionActive = false

after session completion

Before uploading every frame:

if (!sessionActive)
    return;

This prevents invalid uploads.

--------------------------------------------------------

Task 4

Prevent Multiple Capture Loops

Verify that only ONE capture loop exists.

Allowed:

• requestAnimationFrame

OR

• setInterval

Never both.

Remove duplicate loops.

--------------------------------------------------------

Task 5

Graceful Error Handling

Handle:

400

404

408

500

without crashing React.

Instead:

• stop scanning

• stop camera

• clear resources

• log readable messages

• show a toast notification

Example

"Session completed successfully."

"Scan another QR code to begin a new recycling session."

--------------------------------------------------------

Task 6

Resource Cleanup

When:

• session ends

• component unmounts

• page changes

• browser refreshes

perform complete cleanup.

Required:

stop MediaStream

clearInterval

clearTimeout

cancelAnimationFrame

remove listeners

No camera resources should leak.

--------------------------------------------------------

Task 7

Browser Refresh Recovery

If the page refreshes while scanning:

Reset the camera.

Reset session state.

Return safely to dashboard.

No stale sessions.

--------------------------------------------------------

Task 8

Logging

Add readable logs.

Example

[Camera] Started

[Camera] Frame Captured

[Detection] Upload Started

[Detection] Upload Finished

[Session] Finalized

[Camera] Stopped

[Cleanup] Completed

These logs should help debugging.

--------------------------------------------------------

Task 9

Code Cleanup

Remove

• dead code

• duplicate cleanup

• duplicate intervals

• unused state

Improve readability.

--------------------------------------------------------

Task 10

Validation

Run

npx tsc --noEmit

python -m py_compile app/main.py

Both must pass.

--------------------------------------------------------

Expected Behaviour

Start Session

↓

Camera Starts

↓

Frames Upload

↓

YOLO Detects

↓

Finalize

↓

End Session

↓

Camera Stops

↓

No More API Calls

↓

Dashboard Returns To Idle

↓

User Can Start Another Session

without refreshing the page.

--------------------------------------------------------

Deliverables

Provide:

1. Files modified

2. Methods modified

3. Camera lifecycle diagram

4. Cleanup strategy

5. Testing procedure

6. Confirmation that:

✔ No HTTP 400 after session end

✔ No HTTP 500 after session end

✔ No duplicate frame uploads

✔ Camera cleanup works correctly

✔ Multiple consecutive sessions work correctly

Do not begin Phase 7.

Only complete this phase.