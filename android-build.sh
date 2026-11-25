#!/usr/bin/env bash
# Crea el proyecto Android de una de las dos apps y lo deja listo para "gradle assembleRelease".
#   ./android-build.sh yunta    -> app que abre el sitio (con cámara para el escaneo de rostro)
#   ./android-build.sh cobros   -> Yunta Cobros (lee los avisos de Yape/Plin del celular de la empresa)
# Variables: APP_URL, APP_HOST, VERSION_NAME, VERSION_CODE
set -euo pipefail
APP=${1:?yunta o cobros}
ROOT=$(cd "$(dirname "$0")" && pwd)
D="$ROOT/build-$APP"; rm -rf "$D"; mkdir -p "$D"; cd "$D"
P=src/main
VERSION_CODE=${VERSION_CODE:-1}; VERSION_NAME=${VERSION_NAME:-1.1}
APP_URL=${APP_URL:-https://itzelysium.github.io/yunta/}; APP_HOST=${APP_HOST:-itzelysium.github.io}

if [ "$APP" = yunta ]; then PKG=pe.yunta.app; LABEL=Yunta; BG='#4B2170'; A='#F2B705'; B='#FF7A59'
else PKG=pe.yunta.cobros; LABEL='Yunta Cobros'; BG='#1E6B4F'; A='#F2B705'; B='#FFFFFF'; fi
PDIR=$P/java/${PKG//.//}
mkdir -p "$PDIR" $P/res/values $P/res/drawable $P/res/mipmap-anydpi

cat > settings.gradle <<EOF
pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositories { google(); mavenCentral() } }
rootProject.name = '$APP'
EOF
printf 'android.useAndroidX=false\norg.gradle.jvmargs=-Xmx2g\n' > gradle.properties

cat > build.gradle <<EOF
plugins { id 'com.android.application' version '8.9.1' }
android {
  namespace '$PKG'
  compileSdk 36
  defaultConfig {
    applicationId '$PKG'
    minSdk 26
    targetSdk 36
    versionCode $VERSION_CODE
    versionName '$VERSION_NAME.$VERSION_CODE'
    buildConfigField 'String', 'APP_URL', '"$APP_URL"'
    buildConfigField 'String', 'APP_HOST', '"$APP_HOST"'
  }
  buildFeatures { buildConfig true }
  signingConfigs {
    if (System.getenv('KS_PATH')) {
      release {
        storeFile file(System.getenv('KS_PATH'))
        storePassword System.getenv('KS_PASS')
        keyAlias System.getenv('KS_ALIAS')
        keyPassword System.getenv('KS_PASS')
      }
    }
  }
  buildTypes {
    release {
      minifyEnabled false
      signingConfig System.getenv('KS_PATH') ? signingConfigs.release : signingConfigs.debug
    }
  }
}
EOF

if [ "$APP" = yunta ]; then
  cp "$ROOT/android-yunta-MainActivity.java" "$PDIR/MainActivity.java"
  EXTRA_PERM='<uses-permission android:name="android.permission.CAMERA" />
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.front" android:required="false" />'
  SERVICE=''
else
  cp "$ROOT/android-cobros-MainActivity.java" "$PDIR/MainActivity.java"
  cp "$ROOT/android-cobros-AvisoService.java" "$PDIR/AvisoService.java"
  EXTRA_PERM=''
  SERVICE='<service android:name=".AvisoService" android:exported="true" android:label="Yunta Cobros"
      android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">
      <intent-filter><action android:name="android.service.notification.NotificationListenerService" /></intent-filter>
    </service>'
fi

cat > $P/AndroidManifest.xml <<EOF
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  $EXTRA_PERM
  <application android:label="$LABEL" android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher"
    android:theme="@style/Yunta" android:usesCleartextTraffic="false" android:supportsRtl="true">
    <activity android:name=".MainActivity" android:exported="true"
      android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|uiMode"
      android:windowSoftInputMode="adjustResize">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
    $SERVICE
  </application>
</manifest>
EOF

cat > $P/res/values/styles.xml <<EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="fondo">$BG</color>
  <style name="Yunta" parent="android:Theme.Material.Light.NoActionBar">
    <item name="android:statusBarColor">@color/fondo</item>
    <item name="android:navigationBarColor">#FFFFFF</item>
    <item name="android:windowBackground">@color/fondo</item>
    <item name="android:colorAccent">$A</item>
  </style>
</resources>
EOF

# Ícono A "Yunta": dos personas (puntos) que forman una Y. Lienzo 512 escalado al área segura de 108dp.
cat > $P/res/drawable/ic_bg.xml <<EOF
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><solid android:color="$BG"/></shape>
EOF
cat > $P/res/drawable/ic_fg.xml <<EOF
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <group android:scaleX="0.2" android:scaleY="0.2" android:translateX="2.8" android:translateY="1">
    <path android:pathData="M178,214 L256,300 L334,214" android:strokeColor="#FFFFFF" android:strokeWidth="44" android:strokeLineCap="round" android:strokeLineJoin="round" android:fillColor="#00000000"/>
    <path android:pathData="M256,300 L256,392" android:strokeColor="#FFFFFF" android:strokeWidth="44" android:strokeLineCap="round" android:fillColor="#00000000"/>
    <path android:pathData="M122,158 a42,42 0 1,0 84,0 a42,42 0 1,0 -84,0" android:fillColor="$A"/>
    <path android:pathData="M306,158 a42,42 0 1,0 84,0 a42,42 0 1,0 -84,0" android:fillColor="$B"/>
  </group>
</vector>
EOF
cat > $P/res/mipmap-anydpi/ic_launcher.xml <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@drawable/ic_bg"/>
  <foreground android:drawable="@drawable/ic_fg"/>
  <monochrome android:drawable="@drawable/ic_fg"/>
</adaptive-icon>
EOF
echo "Proyecto listo en $D"
