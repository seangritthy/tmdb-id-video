package com.seangritthy.tmdbvideo;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppUpdater.checkForUpdates(this, false);

        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
            webView.getSettings().setSupportMultipleWindows(false);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        AppUpdater.checkResumeInstall(this);
    }
}
