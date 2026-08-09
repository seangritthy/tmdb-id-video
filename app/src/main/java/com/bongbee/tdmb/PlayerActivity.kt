package com.bongbee.tdmb

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.bongbee.tdmb.databinding.ActivityPlayerBinding

class PlayerActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPlayerBinding

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPlayerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Enable Fullscreen Immersive Mode
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            )

        val videoUrl = intent.getStringExtra(EXTRA_VIDEO_URL) ?: return finish()

        setupWebView(videoUrl)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView(url: String) {
        val webView = binding.webViewPlayer
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            userAgentString = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
        }

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = WebViewClient()

        if (url.contains(".m3u8")) {
            val html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
                        html, body { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                        video { width: 100%; height: 100%; object-fit: contain; }
                    </style>
                </head>
                <body>
                    <video id="video" controls autoplay playsinline></video>
                    <script>
                        var video = document.getElementById('video');
                        var videoSrc = '$url';
                        if (Hls.isSupported()) {
                            var hls = new Hls();
                            hls.loadSource(videoSrc);
                            hls.attachMedia(video);
                            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                                video.play();
                            });
                        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                            video.src = videoSrc;
                            video.addEventListener('loadedmetadata', function() {
                                video.play();
                            });
                        }
                    </script>
                </body>
                </html>
            """.trimIndent()
            webView.loadDataWithBaseURL("https://vsembed.ru/", html, "text/html", "UTF-8", null)
        } else {
            webView.loadUrl(url)
        }
    }

    companion object {
        const val EXTRA_VIDEO_URL = "extra_video_url"

        fun start(context: Context, videoUrl: String) {
            val intent = Intent(context, PlayerActivity::class.java).apply {
                putExtra(EXTRA_VIDEO_URL, videoUrl)
            }
            context.startActivity(intent)
        }
    }
}
