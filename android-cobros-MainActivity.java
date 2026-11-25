package pe.yunta.cobros;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.text.InputType;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

// Pantalla de configuración de Yunta Cobros: dirección del servidor, clave,
// permiso para leer notificaciones y registro de los últimos avisos enviados.
public class MainActivity extends Activity {
  private TextView estado, log;
  private final Handler h = new Handler(Looper.getMainLooper());

  @Override
  protected void onCreate(Bundle saved) {
    super.onCreate(saved);
    final SharedPreferences p = getSharedPreferences(AvisoService.PREFS, MODE_PRIVATE);
    int pad = dp(20);

    LinearLayout col = new LinearLayout(this);
    col.setOrientation(LinearLayout.VERTICAL);
    col.setPadding(pad, pad, pad, pad);
    col.setBackgroundColor(Color.parseColor("#FAF7F3"));

    TextView t = text("Yunta Cobros", 26, true); t.setTextColor(Color.parseColor("#4B2170")); col.addView(t);
    col.addView(text("Instálala solo en el celular de la empresa que recibe los Yape y Plin. Lee los avisos de pago y los envía a Yunta para confirmar las compras solas.", 15, false));

    estado = text("", 16, true); estado.setPadding(0, dp(16), 0, dp(8)); col.addView(estado);

    col.addView(text("Dirección de la función aviso-pago", 14, true));
    final EditText url = new EditText(this); url.setHint("https://xxxx.supabase.co/functions/v1/aviso-pago");
    url.setText(p.getString("url", "")); url.setInputType(InputType.TYPE_TEXT_VARIATION_URI); col.addView(url);

    col.addView(text("Clave (COBROS_SECRET)", 14, true));
    final EditText sec = new EditText(this); sec.setText(p.getString("secret", ""));
    sec.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD); col.addView(sec);

    Button guardar = boton("Guardar", "#4B2170", Color.WHITE);
    guardar.setOnClickListener(v -> { p.edit().putString("url", url.getText().toString().trim()).putString("secret", sec.getText().toString().trim()).apply(); refrescar(); });
    col.addView(guardar);

    Button acceso = boton("Dar acceso a las notificaciones", "#F2B705", Color.parseColor("#3E2D00"));
    acceso.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)));
    col.addView(acceso);

    Button prueba = boton("Enviar aviso de prueba", "#F1EBE4", Color.parseColor("#20172A"));
    prueba.setOnClickListener(v -> { AvisoService.enviar(this, "prueba", "Prueba Yunta", "Prueba te envió un pago por S/ 0.01"); h.postDelayed(this::refrescar, 2500); });
    col.addView(prueba);

    col.addView(text("Últimos avisos", 14, true));
    log = text("", 13, false); log.setTypeface(Typeface.MONOSPACE); col.addView(log);

    ScrollView sv = new ScrollView(this); sv.addView(col);
    setContentView(sv);
  }

  @Override protected void onResume() { super.onResume(); refrescar(); }

  private void refrescar() {
    SharedPreferences p = getSharedPreferences(AvisoService.PREFS, MODE_PRIVATE);
    boolean acceso = tieneAcceso();
    boolean conf = !p.getString("url", "").isEmpty() && !p.getString("secret", "").isEmpty();
    estado.setText(acceso && conf ? "✓ Activo: los pagos se confirman solos" : !acceso ? "Falta dar acceso a las notificaciones" : "Falta la dirección y la clave");
    estado.setTextColor(Color.parseColor(acceso && conf ? "#1F7A4D" : "#9A5B00"));
    String l = p.getString("log", "");
    log.setText(l.isEmpty() ? "Todavía no hay avisos." : l);
  }

  private boolean tieneAcceso() {
    String flat = Settings.Secure.getString(getContentResolver(), "enabled_notification_listeners");
    return flat != null && flat.contains(new ComponentName(this, AvisoService.class).flattenToString());
  }

  private TextView text(String s, int sp, boolean bold) {
    TextView t = new TextView(this); t.setText(s); t.setTextSize(sp); t.setTextColor(Color.parseColor("#20172A"));
    if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
    t.setPadding(0, dp(6), 0, dp(6)); return t;
  }
  private Button boton(String s, String bg, int fg) {
    Button b = new Button(this); b.setText(s); b.setAllCaps(false); b.setTextColor(fg); b.setBackgroundColor(Color.parseColor(bg));
    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    lp.topMargin = dp(10); b.setLayoutParams(lp); return b;
  }
  private int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }
}
