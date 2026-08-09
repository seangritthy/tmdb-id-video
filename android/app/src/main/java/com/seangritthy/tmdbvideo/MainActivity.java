package com.seangritthy.tmdbvideo;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppUpdater.checkForUpdates(this, false);

        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
            webView.getSettings().setSupportMultipleWindows(false);

            bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (request != null && request.isForMainFrame()) {
                        Uri uri = request.getUrl();
                        if (isExternalUrl(view, uri)) {
                            showExternalLinkDialog(uri.toString());
                            return true;
                        }
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }

                @Override
                @SuppressWarnings("deprecation")
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (url != null) {
                        Uri uri = Uri.parse(url);
                        if (isExternalUrl(view, uri)) {
                            showExternalLinkDialog(url);
                            return true;
                        }
                    }
                    return super.shouldOverrideUrlLoading(view, url);
                }
            });
        }
    }

    private boolean isExternalUrl(WebView view, Uri targetUri) {
        if (targetUri == null || targetUri.getScheme() == null) {
            return false;
        }
        String scheme = targetUri.getScheme().toLowerCase();
        if (!"http".equals(scheme) && !"https".equals(scheme)) {
            return false;
        }

        String targetHost = targetUri.getHost();
        if (targetHost == null || targetHost.isEmpty()) {
            return false;
        }

        String appHost = null;
        if (view != null && view.getUrl() != null) {
            Uri currentUri = Uri.parse(view.getUrl());
            if (currentUri != null) {
                appHost = currentUri.getHost();
            }
        }
        if ((appHost == null || appHost.isEmpty()) && bridge != null && bridge.getAppUrl() != null) {
            Uri appUri = Uri.parse(bridge.getAppUrl());
            if (appUri != null) {
                appHost = appUri.getHost();
            }
        }
        if (appHost == null || appHost.isEmpty()) {
            appHost = "localhost";
        }

        targetHost = targetHost.toLowerCase();
        appHost = appHost.toLowerCase();

        return !(targetHost.equals(appHost) || targetHost.endsWith("." + appHost));
    }

    private void showExternalLinkDialog(final String url) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (isFinishing() || isDestroyed()) return;
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("External Link Detected")
                    .setMessage(url)
                    .setPositiveButton("Open", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            try {
                                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                                startActivity(intent);
                            } catch (Exception e) {
                                // Ignore if no intent handler available
                            }
                        }
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        AppUpdater.checkResumeInstall(this);
    }
}
