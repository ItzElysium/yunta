package pe.yunta.cobros;

import android.app.Notification;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Pattern;

// Lee las notificaciones del celular de la empresa y envía a Yunta las de pagos recibidos
// (Yape y apps de bancos con Plin). Solo se envían las que tienen un monto "S/ ...".
public class AvisoService extends NotificationListenerService {
  static final String PREFS = "cobros";
  // Apps conocidas. También se aceptan otras si el texto habla de Yape o Plin.
  private static final String[] APPS = {
    "com.bcp.innovacxion.yapeapp",          // Yape
    "pe.com.interbank.mobilebanking",       // Interbank (Plin)
    "com.bbva.nxt_peru",                    // BBVA (Plin)
    "pe.com.scotiabank.blpm.android.client" // Scotiabank (Plin)
  };
  private static final Pattern MONTO = Pattern.compile("S/\\.?\\s?\\d");
  private static final Pattern PAGO = Pattern.compile("(?i)(yape|plin|te envi|recibiste|te pag|abono)");

  @Override
  public void onNotificationPosted(StatusBarNotification sbn) {
    try {
      String pkg = sbn.getPackageName();
      if (pkg.equals(getPackageName())) return;
      Bundle ex = sbn.getNotification().extras;
      String title = str(ex.getCharSequence(Notification.EXTRA_TITLE));
      String text = str(ex.getCharSequence(Notification.EXTRA_BIG_TEXT));
      if (text.isEmpty()) text = str(ex.getCharSequence(Notification.EXTRA_TEXT));
      String all = title + " " + text;
      boolean conocida = false;
      for (String a : APPS) if (a.equals(pkg)) conocida = true;
      if (!MONTO.matcher(all).find()) return;
      if (!conocida && !PAGO.matcher(all).find()) return;
      enviar(this, pkg, title, text);
    } catch (Exception ignored) { }
  }

  static String str(CharSequence c) { return c == null ? "" : c.toString(); }

  static void enviar(final android.content.Context ctx, final String pkg, final String title, final String text) {
    final SharedPreferences p = ctx.getSharedPreferences(PREFS, MODE_PRIVATE);
    final String url = p.getString("url", "");
    final String secret = p.getString("secret", "");
    new Thread(() -> {
      String estado;
      if (url.isEmpty()) estado = "sin configurar";
      else try {
        JSONObject j = new JSONObject();
        j.put("source", pkg); j.put("title", title); j.put("text", text);
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestMethod("POST");
        c.setConnectTimeout(10000); c.setReadTimeout(15000);
        c.setRequestProperty("Content-Type", "application/json");
        c.setRequestProperty("x-yunta-secret", secret);
        c.setDoOutput(true);
        try (OutputStream o = c.getOutputStream()) { o.write(j.toString().getBytes(StandardCharsets.UTF_8)); }
        int code = c.getResponseCode();
        estado = code == 200 ? "enviado" : "error " + code;
        c.disconnect();
      } catch (Exception e) { estado = "sin conexión"; }
      String hora = new SimpleDateFormat("dd/MM HH:mm", Locale.getDefault()).format(new Date());
      String linea = hora + " · " + estado + " · " + (title + " " + text).trim();
      if (linea.length() > 140) linea = linea.substring(0, 140) + "…";
      String log = p.getString("log", "");
      String nuevo = (linea + "\n" + log);
      String[] partes = nuevo.split("\n");
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < Math.min(30, partes.length); i++) sb.append(partes[i]).append("\n");
      p.edit().putString("log", sb.toString()).apply();
    }).start();
  }
}
