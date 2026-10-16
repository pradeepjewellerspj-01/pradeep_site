package com.pradeepjewellers.tv;

import android.graphics.Color;
import android.view.InputDevice;
import android.view.KeyEvent;

/**
 * "PJ Admin": the admin panel. With a TV remote, up/down move between the
 * page's fields and buttons (as Tab / Shift+Tab) and OK presses them; a
 * keyboard or air mouse works as usual. Back goes back a page, then exits.
 */
public class AdminActivity extends WebActivity {
    @Override
    protected String path() {
        return "/admin";
    }

    @Override
    protected int backgroundColor() {
        return Color.parseColor("#FFFAF3");
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int code = event.getKeyCode();
        if ((code == KeyEvent.KEYCODE_DPAD_DOWN || code == KeyEvent.KEYCODE_DPAD_UP) && fromRemote(event)) {
            int meta = code == KeyEvent.KEYCODE_DPAD_UP ? KeyEvent.META_SHIFT_ON | KeyEvent.META_SHIFT_LEFT_ON : 0;
            KeyEvent tab = new KeyEvent(event.getDownTime(), event.getEventTime(), event.getAction(), KeyEvent.KEYCODE_TAB, event.getRepeatCount(), meta);
            return web.dispatchKeyEvent(tab);
        }
        return super.dispatchKeyEvent(event);
    }

    /**
     * A remote's D-pad, not a keyboard's arrow keys (those keep their usual meaning).
     * Remotes report a D-pad source, or a keyboard that is not a full (alphabetic) one.
     */
    private static boolean fromRemote(KeyEvent event) {
        if (event.isFromSource(InputDevice.SOURCE_DPAD) && !event.isFromSource(InputDevice.SOURCE_KEYBOARD)) return true;
        InputDevice device = event.getDevice();
        return device == null || device.getKeyboardType() != InputDevice.KEYBOARD_TYPE_ALPHABETIC;
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
