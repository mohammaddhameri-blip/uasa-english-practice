# Paparan UASA — Android APK

The app is a minimal landscape WebView shell for the official school exam display.
It always attempts to load the latest GitHub Pages site, and uses a bundled HTML and logo if the smartboard is offline.

## Safe APK auto-update

On launch the app checks `../apk-version.json`. If a newer **signed release APK** exists, Android DownloadManager downloads it automatically. No installation window appears during an exam. In the existing `•••` teacher settings, choose **Semak kemas kini APK** to approve installation. Android must ask for permission to install from this source and to confirm the APK update. Repeated updates work only when all releases use the SAME signing key and applicationId.

Updating the hosted HTML changes the live display the next time the app opens with an Internet connection; it does not require a new APK. When offline, the app continues with the HTML and logo bundled at the time the APK was built.

## First release (requires one-time private signing setup)

1. Create a private Android JKS signing key with alias `uasa` and keep it in a safe place. **Never commit it to this public repository.** 
2. On GitHub, open Settings → Secrets and variables → Actions and add:
   - `UASA_KEYSTORE_BASE64`: single-line base64 of the entire JKS file
   - `UASA_STORE_PASSWORD`: JKS store password
   - `UASA_KEY_PASSWORD`: JKS key password
3. Open Actions → **Build UASA Display APK** → Run workflow. It signs the APK, publishes a GitHub release and updates `../apk-version.json` automatically.
4. Download the first `uasa-display.apk` from the new GitHub release and install it on the smartboard. Later releases from this workflow are detected and downloaded automatically.

**Important:** Existing APKs with a different application ID or signing key cannot be updated in place by this app. Android requires one initial install of this signed version. The original old APK remains unchanged.

APK builder: Gradle 8.9, AGP 8.7.3, Java 17, Android SDK 35.
