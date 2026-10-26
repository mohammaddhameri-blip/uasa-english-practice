package my.ska.lawas.uasadisplay;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.database.Cursor;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

public class MainActivity extends Activity {
    private static final String HOME = "https://mohammaddhameri-blip.github.io/uasa-english-practice/uasa-5t-display/";
    private static final String VERSION_URL = HOME + "apk-version.json";
    private static final String OFFLINE = "file:///android_asset/index.html";
    private WebView web;
    private DownloadManager downloads;
    private volatile long downloadId = -1;
    private volatile String status = "Menyemak kemas kini...";
    private volatile String sha256 = "";
    private volatile String nextVersion = "";
    private Uri readyApk;
    private boolean permissionRequested = false;
    private boolean usingOffline = false;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        immersive();
        downloads = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(17, 19, 21));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccess(true); // Bundled offline fallback only
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new TeacherBridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith(HOME) || url.startsWith(OFFLINE)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl())); }
                catch (Exception ignored) {}
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame() && !usingOffline) {
                    usingOffline = true;
                    view.loadUrl(OFFLINE);
                }
            }
            @Override public void onPageFinished(WebView view, String url) { showStatus(status); }
        });
        setContentView(web);
        web.loadUrl(HOME);
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(downloadReceiver, filter, Context.RECEIVER_EXPORTED);
        else registerReceiver(downloadReceiver, filter);
        checkForUpdates(false);
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    public final class TeacherBridge {
        @JavascriptInterface public void openTimeSettings() {
            runOnUiThread(() -> startActivity(new Intent(Settings.ACTION_DATE_SETTINGS)));
        }
        @JavascriptInterface public void checkForUpdates() { runOnUiThread(() -> checkForUpdates(true)); }
    }

    private int installedCode() {
        try {
            PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? (int) info.getLongVersionCode() : info.versionCode;
        } catch (Exception e) { return 1; }
    }

    private void showStatus(String message) {
        status = message;
        if (web == null) return;
        runOnUiThread(() -> web.evaluateJavascript(
            "window.onNativeUpdateStatus&&window.onNativeUpdateStatus(" +
            JSONObject.quote(message) + ");", null));
    }

    private void checkForUpdates(boolean manual) {
        if (readyApk != null) {
            if (manual) offerInstall();
            else showStatus("APK " + nextVersion + " siap dimuat turun. Buka ••• untuk memasangnya.");
            return;
        }
        if (downloadId != -1) {
            showStatus("APK " + nextVersion + " sedang dimuat turun.");
            return;
        }
        showStatus("Menyemak kemas kini...");
        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(VERSION_URL + "?t=" + System.currentTimeMillis()).openConnection();
                connection.setConnectTimeout(7000);
                connection.setReadTimeout(7000);
                connection.setRequestProperty("Cache-Control", "no-cache");
                if (connection.getResponseCode() != 200) throw new Exception("HTTP " + connection.getResponseCode());
                String json;
                try (InputStream input = connection.getInputStream()) {
                    byte[] data = new byte[8192];
                    int n = input.read(data);
                    if (n <= 0) throw new Exception("Empty manifest");
                    json = new String(data, 0, n, java.nio.charset.StandardCharsets.UTF_8);
                }
                JSONObject manifest = new JSONObject(json);
                int code = manifest.optInt("versionCode", 0);
                String url = manifest.optString("apkUrl", "");
                if (code <= installedCode() || url.isEmpty()) {
                    showStatus("APK sudah versi terkini (v" + installedCode() + ").");
                    return;
                }
                URL candidate = new URL(url);
                if (!"https".equals(candidate.getProtocol()) || !"github.com".equalsIgnoreCase(candidate.getHost())) {
                    throw new Exception("Untrusted download address");
                }
                nextVersion = manifest.optString("versionName", String.valueOf(code));
                sha256 = manifest.optString("sha256", "").trim().toLowerCase(java.util.Locale.ROOT);
                runOnUiThread(() -> beginDownload(url));
            } catch (Exception e) {
                showStatus("Tidak dapat semak APK. Semak Internet dan cuba lagi.");
            } finally { if (connection != null) connection.disconnect(); }
        }).start();
    }

    private void beginDownload(String url) {
        try {
            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
            req.setTitle("Kemas kini Paparan UASA " + nextVersion);
            req.setDescription("Muat turun APK rasmi. Pemasangan memerlukan kebenaran guru.");
            req.setMimeType("application/vnd.android.package-archive");
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE);
            req.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "uasa-display-" + nextVersion.replaceAll("[^a-zA-Z0-9._-]", "") + ".apk");
            downloadId = downloads.enqueue(req);
            showStatus("APK " + nextVersion + " sedang dimuat turun secara automatik.");
        } catch (Exception e) {
            downloadId = -1;
            showStatus("Gagal memuat turun APK. Cuba semula.");
        }
    }

    private final BroadcastReceiver downloadReceiver = new BroadcastReceiver() {
        @Override public void onReceive(Context context, Intent intent) {
            if (!DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())) return;
            if (intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) != downloadId) return;
            long id = downloadId;
            downloadId = -1;
            try (Cursor cursor = downloads.query(new DownloadManager.Query().setFilterById(id))) {
                if (cursor == null || !cursor.moveToFirst() ||
                    cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS)) != DownloadManager.STATUS_SUCCESSFUL) {
                    showStatus("Muat turun gagal. Semak Internet dan cuba lagi.");
                    return;
                }
                Uri file = downloads.getUriForDownloadedFile(id);
                if (file == null) throw new Exception("Downloaded file missing");
                new Thread(() -> validateDownload(file)).start();
            } catch (Exception e) { showStatus("Tidak dapat membuka fail APK."); }
        }
    };

    private void validateDownload(Uri apk) {
        try {
            if (!sha256.isEmpty()) {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                try (InputStream input = getContentResolver().openInputStream(apk)) {
                    if (input == null) throw new Exception("File missing");
                    byte[] buffer = new byte[32768];
                    int count;
                    while ((count = input.read(buffer)) != -1) digest.update(buffer, 0, count);
                }
                StringBuilder actual = new StringBuilder();
                for (byte b : digest.digest()) actual.append(String.format(java.util.Locale.ROOT, "%02x", b & 0xff));
                if (!actual.toString().equalsIgnoreCase(sha256)) throw new Exception("SHA-256 mismatch");
            }
            readyApk = apk;
            showStatus("APK " + nextVersion + " sedia. Buka ••• > Semak kemas kini APK untuk pasang.");
        } catch (Exception e) { showStatus("Fail APK tidak sah. Pemasangan dibatalkan."); }
    }

    private void offerInstall() {
        if (readyApk == null) return;
        new AlertDialog.Builder(this).setTitle("Pasang kemas kini APK?")
            .setMessage("Versi " + nextVersion + " telah dimuat turun. Pemasangan memerlukan pengesahan Android. Paparan peperiksaan akan ditutup sementara semasa pemasangan.")
            .setNegativeButton("Kemudian", (dialog, which) -> {})
            .setPositiveButton("Pasang", (dialog, which) -> installApk())
            .show();
    }

    private void installApk() {
        if (readyApk == null) return;
        if (Build.VERSION.SDK_INT >= 26 && !getPackageManager().canRequestPackageInstalls()) {
            permissionRequested = true;
            startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getPackageName())));
            return;
        }
        Intent installer = new Intent(Intent.ACTION_VIEW);
        installer.setDataAndType(readyApk, "application/vnd.android.package-archive");
        installer.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        try { startActivity(installer); }
        catch (Exception e) { showStatus("Tidak dapat membuka pemasang APK Android."); }
    }

    @Override protected void onResume() {
        super.onResume();
        immersive();
        if (permissionRequested && (Build.VERSION.SDK_INT < 26 || getPackageManager().canRequestPackageInstalls())) {
            permissionRequested = false;
            installApk();
        }
    }
    @Override protected void onDestroy() {
        try { unregisterReceiver(downloadReceiver); } catch (Exception ignored) {}
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
