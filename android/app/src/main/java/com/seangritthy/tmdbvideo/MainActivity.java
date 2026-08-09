package com.seangritthy.tmdbvideo;

import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class MainActivity extends BridgeActivity {

    private static final Set<String> AD_KEYWORDS = new HashSet<>(Arrays.asList(
        "popads", "popcash", "adsterra", "exoclick", "juicyads", "propellerads",
        "adcash", "hilltopads", "clksite", "onclickmega", "adthrive", "mediavine",
        "doubleclick", "googlesyndication", "bet365", "1xbet", "mostbet", "parimatch",
        "adservice", "popunder", "banner", "tracking", "telemetry", "analytics"
    ));

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppUpdater.checkForUpdates(this, false);

        if (bridge != null && bridge.getWebView() != null) {
            final WebView webView = bridge.getWebView();
            webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
            webView.getSettings().setSupportMultipleWindows(false);

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (request != null && request.getUrl() != null) {
                        String urlStr = request.getUrl().toString().toLowerCase();
                        if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
                            if (urlStr.contains("localhost") || urlStr.contains("127.0.0.1") || urlStr.contains("vsembed.ru") || urlStr.contains("themoviedb.org") || urlStr.contains("tmdb.org")) {
                                return super.shouldOverrideUrlLoading(view, request);
                            }
                            return true; // Block external ad redirects!
                        }
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    if (request != null && request.getUrl() != null) {
                        String urlStr = request.getUrl().toString().toLowerCase();
                        for (String kw : AD_KEYWORDS) {
                            if (urlStr.contains(kw)) {
                                return new WebResourceResponse(
                                    "text/plain",
                                    "UTF-8",
                                    200,
                                    "OK",
                                    null,
                                    new ByteArrayInputStream("".getBytes())
                                );
                            }
                        }
                    }
                    return super.shouldInterceptRequest(view, request);
                }
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        AppUpdater.checkResumeInstall(this);
    }
}
