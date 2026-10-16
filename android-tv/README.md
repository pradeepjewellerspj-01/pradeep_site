# Pradeep Jewellers for Android TV

A small Android app (≈160 KB) that puts two entries on the TV home screen:

| Entry | Opens | Behaviour |
| --- | --- | --- |
| **PJ Showroom TV** | `<site>/screen` | Full screen, no bars, display kept awake. Remote ←/→ change the advertisement, OK pauses. Back exits. |
| **PJ Admin** | `<site>/admin` | The admin panel. Remote ↑/↓ move between fields and buttons, OK presses; a keyboard or air mouse works as usual. Back goes back a page. |

Why an app and not only the web app? Android TV has no Chrome, so there is no "Install app" button there. This app wraps the same pages in Android's WebView, so everything (advertisements, rates, offline copy) still comes from the website and changes in the admin panel reach the TV without updating the app. The same APK also installs on Android phones and tablets.

On computers, phones and tablets with Chrome or Edge, `/screen` and `/admin` are also installable web apps directly (browser menu → *Install*), see the main README.

## Build

Needs JDK 17+ and the Android SDK (Android Studio installs both).

1. Set the website in `gradle.properties`:
   ```properties
   pj.siteUrl=https://www.your-domain.com
   ```
   (no trailing slash). The build stops with a message if this is empty.
2. Build:
   ```bash
   cd android-tv
   ./gradlew assembleDebug        # Windows: gradlew.bat assembleDebug
   ```
   The APK is `app/build/outputs/apk/debug/app-debug.apk`. A debug build is fine for your own TVs.

For a release build, create a keystore once (`keytool -genkeypair -v -keystore pj-tv.jks -alias pj -keyalg RSA -keysize 2048 -validity 10000`), keep it safe, then:

```bash
PJ_KEYSTORE=/path/pj-tv.jks PJ_KEYSTORE_PASSWORD=… PJ_KEY_ALIAS=pj PJ_KEY_PASSWORD=… ./gradlew assembleRelease
```

Later updates must be signed with the same keystore.

## Install on the TV

1. On the TV: **Settings → Device Preferences → About**, press **Build** seven times to enable Developer options; then **Developer options → USB debugging / Network debugging** on.
2. From the computer (same Wi-Fi): `adb connect <tv-ip>:5555`, then `adb install -r app-debug.apk`.
   Or copy the APK to a USB drive and open it with a file manager app on the TV (allow "Install unknown apps" for it).
3. **PJ Showroom TV** and **PJ Admin** appear in the apps row. For the showroom, open PJ Showroom TV and leave it running.

## Notes

- **Offline.** The site's service worker keeps the last copy: after one successful start, the TV keeps playing without internet, with rates labelled *Delayed*. If even the first start fails, the app shows "No internet connection" and retries every 15 seconds.
- **Admin sign-in** stays for 12 hours (the website's session); the cookie survives app restarts.
- **Links** to other sites (WhatsApp, maps) open in another app if the TV has one; otherwise they are ignored.
- **Screen saver.** The app keeps the display awake while PJ Showroom TV is open. If the TV's own sleep timer still turns it off, set **Settings → Device Preferences → Energy saver** to *Never*.
