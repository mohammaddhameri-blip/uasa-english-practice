# Kehadiran HTML updates

Public update channel for the private offline attendance APK. No pupil roster or attendance records belong here.

Manifest: https://mohammaddhameri-blip.github.io/uasa-english-practice/kehadiran-updates/manifest.json

Version 2 establishes the update channel with the existing attendance interface. To publish changes, add a new immutable index-vN.html, calculate its SHA-256 over the exact UTF-8 bytes, and update manifest.json with the higher integer version, HTTPS HTML URL, and hash. Keep existing version files for clients checking during deployment. Preserve the template marker, window.KEHADIRAN_ROSTER, roster.js reference, and localStorage key.

The APK supplies roster.js privately. This folder is an update source, not a standalone online attendance register.
