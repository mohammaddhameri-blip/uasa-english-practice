# ColourCard Scan — smartboard webcam prototype

A zero-install, static, browser-based prototype for identifying four coloured classroom answer cards using a webcam and a **calibrated perspective grid**. Runs locally on the smartboard; no pupil camera footage is uploaded or saved.

**Open the live app:** https://mohammaddhameri-blip.github.io/uasa-english-practice/colour-card-scanner/

## Quick smartboard test

1. Open the GitHub Pages link in Chrome or Edge on the smartboard.
2. Press **Try demo cards** to see 28 simulated answers without a camera. This tests the interface only, not colour recognition.
3. Press **Start camera** and grant browser camera permission. If using an external webcam, choose it from the Camera menu.
4. Select **Calibrate grid**, then drag the small grid intersection handles to line up each detection zone with where pupils will hold their coloured answer cards. Tap **Review answers** to finish.
5. Enter a class name such as `5T`. Use **Edit list** in the Seating roster section to paste one pupil's name per line, ordered left to right, **back row to front row**.
6. Hold up matte **yellow = A**, **green = B**, **magenta = C**, **cyan = D** cards. Automatic detections appear in the numbered zones.
7. Tap a zone or pupil number to correct an answer manually if it is unclear or missed.
8. Press **Freeze & mark** and download results as CSV. Use **Clear answers** before another question.

Save and load classroom layouts in the same browser. Use **Download layout JSON** as a backup before switching smartboards or clearing the browser.

## Technical details and limitations

- Uses `getUserMedia` over HTTPS (GitHub Pages). Requires a real camera and permission. The app has no server or face recognition.
- Default is four rows by seven columns, adjustable to 1–10 rows and 1–12 columns. Every grid intersection is draggable; grid coordinates are normalized to video view and saved locally in browser storage.
- Detects connected regions of bright, saturated yellow, green, magenta and cyan using a lightweight HSV-based classifier, applies minimum-size filtering and stable-frame confirmation, and maps blob centres into zones.
- Detection is approximate: pupils may raise cards into neighbouring zones; backgrounds, dark classroom lighting, reflections, overlap or camera resolution can cause missed or incorrect readings. A teacher should confirm uncertain responses before using results for official assessment.
- Sensitivity slider adjusts the minimum connected-colour region size. Lower numbers detect smaller cards but may produce more false positives.
- **Mirror camera** should be enabled only if you want horizontal reversal. The camera analysis and visual display reverse together.
- Manual answers are protected from automatic overwrites until cleared. `Freeze & mark` temporarily pauses automatic answer updates.
- Demo mode is explicitly simulated and cannot validate webcam accuracy.
- Class names, pupil names, grid, practice question and current answer values are saved **only** to local browser storage. CSV/JSON downloads stay with the teacher. No cloud roster integration or multi-device synchronisation in this version.
- A static GitHub Pages build cannot access camera on an insecure HTTP site. Use the `https://` Pages address and a browser such as Chrome or Edge.

This is a working **first-stage prototype**, not yet a formally validated scanner or a complete assessment/question-bank platform.
