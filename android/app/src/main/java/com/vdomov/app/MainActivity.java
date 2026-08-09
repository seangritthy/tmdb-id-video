package com.vdomov.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppUpdater.checkForUpdates(this, false);
    }

    @Override
    public void onResume() {
        super.onResume();
        AppUpdater.checkResumeInstall(this);
    }
}
