package pe.yunta.app;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

// App Yunta: abre el sitio en un WebView, con cámara para el escaneo de rostro,
// subida de fotos para la verificación y enlaces externos (WhatsApp) fuera de la app.
public class MainActivity extends Activity {
  private static final int FILE_REQ = 41, CAM_REQ = 42;
  private WebView web;
  private ValueCallback<Uri[]> fileCb;
  private PermissionRequest pendingCam;

  @Override
  protected void onCreate(Bundle saved) {
    super.onCreate(saved);
    web = new WebView(this);
    web.setBackgroundColor(Color.parseColor("#FAF7F3"));
    setContentView(web);

    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setUserAgentString(s.getUserAgentString() + " YuntaApp/" + BuildConfig.VERSION_NAME);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);

    web.setWebViewClient(new WebViewClient() {
      @Override
      public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
        Uri u = req.getUrl();
        String scheme = u.getScheme() == null ? "" : u.getScheme();
        String host = u.getHost() == null ? "" : u.getHost();
        if (scheme.startsWith("http") && (BuildConfig.APP_HOST.equals(host) || host.endsWith("supabase.co"))) return false;
        openExternal(u);
        return true;
      }
      @Override
      public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err) {
        if (!req.isForMainFrame()) return;
        String html = "<html><body style='font-family:sans-serif;background:#4B2170;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:90vh;text-align:center;padding:24px'>"
          + "<h1 style='font-size:28px'>Sin conexión</h1><p>Revisa tu internet y vuelve a intentar.</p>"
          + "<a href='" + BuildConfig.APP_URL + "' style='background:#F2B705;color:#3E2D00;padding:14px 22px;border-radius:14px;font-weight:bold;text-decoration:none'>Reintentar</a></body></html>";
        v.loadDataWithBaseURL(BuildConfig.APP_URL, html, "text/html", "utf-8", null);
      }
    });

    web.setWebChromeClient(new WebChromeClient() {
      @Override
      public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
        if (fileCb != null) fileCb.onReceiveValue(null);
        fileCb = cb;
        try {
          startActivityForResult(params.createIntent(), FILE_REQ);
        } catch (ActivityNotFoundException e) {
          fileCb = null;
          return false;
        }
        return true;
      }

      // La página pide la cámara para el escaneo de rostro
      @Override
      public void onPermissionRequest(final PermissionRequest request) {
        runOnUiThread(() -> {
          boolean wantsCam = false;
          for (String r : request.getResources()) if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) wantsCam = true;
          if (!wantsCam) { request.deny(); return; }
          if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
          } else {
            pendingCam = request;
            requestPermissions(new String[] { Manifest.permission.CAMERA }, CAM_REQ);
          }
        });
      }
    });

    if (saved != null) web.restoreState(saved);
    else web.loadUrl(BuildConfig.APP_URL);
  }

  @Override
  public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
    super.onRequestPermissionsResult(code, perms, results);
    if (code == CAM_REQ && pendingCam != null) {
      if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED)
        pendingCam.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
      else pendingCam.deny();
      pendingCam = null;
    }
  }

  private void openExternal(Uri u) {
    try {
      Intent i = "intent".equals(u.getScheme())
        ? Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME)
        : new Intent(Intent.ACTION_VIEW, u);
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(i);
    } catch (Exception ignored) { }
  }

  @Override
  protected void onActivityResult(int req, int res, Intent data) {
    if (req == FILE_REQ && fileCb != null) {
      fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
      fileCb = null;
      return;
    }
    super.onActivityResult(req, res, data);
  }

  @Override
  protected void onSaveInstanceState(Bundle out) {
    super.onSaveInstanceState(out);
    web.saveState(out);
  }

  @Override
  public void onBackPressed() {
    if (web.canGoBack()) web.goBack();
    else super.onBackPressed();
  }
}
