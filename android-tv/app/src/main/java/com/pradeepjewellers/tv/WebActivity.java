package com.pradeepjewellers.tv;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Opens one page of the Pradeep Jewellers site (BuildConfig.SITE_URL + path())
 * in a full-window WebView. The page itself does the work: the showroom
 * commercial (/screen) or the admin panel (/admin). Its service worker keeps
 * the last copy for offline starts; if even the first load fails, a short
 * message shows and the page is retried every few seconds.
 */
public abstract class WebActivity extends Activity {
    private static final long RETRY_MS = 15_000;

    protected WebView web;
    private View offline;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean mainFrameFailed;
    private final Runnable retry = () -> {
        mainFrameFailed = false;
        web.loadUrl(startUrl());
    };

    /** The page to open, e.g. "/screen". */
    protected abstract String path();

    protected String startUrl() {
        return BuildConfig.SITE_URL + path();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

        web = new WebView(this);
        web.setBackgroundColor(backgroundColor());
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // the commercial's muted videos autoplay
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " PJ-TV-App/" + BuildConfig.VERSION_NAME);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true); // the admin sign-in session
        cookies.setAcceptThirdPartyCookies(web, false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openOutside(request.getUrl());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openOutside(Uri.parse(url));
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) failed();
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) failed();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (!mainFrameFailed) offline.setVisibility(View.GONE);
            }
        });

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(backgroundColor());
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        offline = buildOfflineView();
        offline.setVisibility(View.GONE);
        root.addView(offline, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(startUrl());
        web.requestFocus();
    }

    protected int backgroundColor() {
        return Color.parseColor("#0B0807");
    }

    /** Pages of this site stay in the app; other links (WhatsApp, maps…) go to an app that can open them, if any. */
    private boolean openOutside(Uri uri) {
        Uri site = Uri.parse(BuildConfig.SITE_URL);
        if (site.getHost() != null && site.getHost().equalsIgnoreCase(uri.getHost())) return false;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            // No browser on this TV: stay on the page.
        }
        return true;
    }

    private void failed() {
        mainFrameFailed = true;
        offline.setVisibility(View.VISIBLE);
        handler.removeCallbacks(retry);
        handler.postDelayed(retry, RETRY_MS);
    }

    private View buildOfflineView() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.setBackgroundColor(Color.parseColor("#0B0807"));
        TextView title = new TextView(this);
        title.setText(R.string.offline_title);
        title.setTextColor(Color.parseColor("#D9B47A"));
        title.setTextSize(28);
        title.setGravity(Gravity.CENTER);
        TextView body = new TextView(this);
        body.setText(R.string.offline_body);
        body.setTextColor(Color.parseColor("#F6EFE3"));
        body.setTextSize(18);
        body.setGravity(Gravity.CENTER);
        body.setPadding(0, 24, 0, 0);
        box.addView(title);
        box.addView(body);
        return box;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.resumeTimers();
    }

    @Override
    protected void onPause() {
        web.onPause();
        web.pauseTimers();
        CookieManager.getInstance().flush(); // keep the admin signed in across restarts
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(retry);
        web.destroy();
        super.onDestroy();
    }
}
