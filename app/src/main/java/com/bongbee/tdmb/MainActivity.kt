package com.bongbee.tdmb

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bongbee.tdmb.databinding.ActivityMainBinding
import com.bongbee.tdmb.util.UpdateChecker
import com.bongbee.tdmb.util.UrlDecoder
import com.bongbee.tdmb.util.VidSrcExtractor
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var extractor: VidSrcExtractor
    private var extractionJob: Job? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        extractor = VidSrcExtractor(this)

        setupListeners()
        checkUpdates()
    }

    private fun checkUpdates() {
        lifecycleScope.launch {
            val updateInfo = UpdateChecker.checkForUpdates()
            if (updateInfo != null && UpdateChecker.isUpdateAvailable(this@MainActivity, updateInfo.versionTag)) {
                showUpdateDialog(updateInfo)
            }
        }
    }

    private fun showUpdateDialog(updateInfo: UpdateChecker.UpdateInfo) {
        MaterialAlertDialogBuilder(this)
            .setTitle("New Update Available: ${updateInfo.versionTag}")
            .setMessage(updateInfo.releaseNotes)
            .setPositiveButton("Update") { _, _ ->
                startDownload(updateInfo)
            }
            .setNegativeButton("Later", null)
            .show()
    }

    private fun startDownload(updateInfo: UpdateChecker.UpdateInfo) {
        binding.progressIndicator.visibility = View.VISIBLE
        binding.tvStatus.text = "Downloading update..."
        
        lifecycleScope.launch {
            val apkFile = UpdateChecker.downloadUpdateApk(this@MainActivity, updateInfo) { downloaded, total ->
                val progress = if (total > 0) (downloaded * 100 / total).toInt() else -1
                runOnUiThread {
                    if (progress >= 0) {
                        binding.tvStatus.text = "Downloading update: $progress%"
                    }
                }
            }
            
            binding.progressIndicator.visibility = View.GONE
            if (apkFile != null) {
                UpdateChecker.launchInAppInstaller(this@MainActivity, apkFile)
            } else {
                binding.tvStatus.text = "Update download failed"
            }
        }
    }

    private fun setupListeners() {
        binding.btnLaunch.setOnClickListener {
            val tmdbId = binding.etTmdbId.text.toString()
            val season = binding.etSeason.text.toString()
            val episode = binding.etEpisode.text.toString()

            if (tmdbId.isNotBlank()) {
                startExtraction(tmdbId, season, episode)
            } else {
                binding.tvStatus.text = "Error: Please enter a TMDB ID"
            }
        }

        binding.btnStop.setOnClickListener {
            extractionJob?.cancel()
            updateStatus("Extraction stopped by user", "")
            binding.progressIndicator.visibility = View.GONE
        }

        binding.btnClearCache.setOnClickListener {
            // In a real app, clear WebView cache/cookies
            binding.tvStatus.text = "Cache cleared (simulated)"
        }
    }

    private fun startExtraction(id: String, season: String, episode: String) {
        extractionJob?.cancel()
        
        val url = if (season.isNotBlank() && episode.isNotBlank()) {
            "https://vsembed.ru/embed/tv/$id/$season/$episode"
        } else {
            "https://vsembed.ru/embed/movie/$id"
        }

        binding.progressIndicator.visibility = View.VISIBLE
        binding.btnPlay.visibility = View.GONE
        updateStatus("Extracting from vsembed.ru...", url)

        extractionJob = lifecycleScope.launch {
            try {
                val result = extractor.extractVideoUrl(url)
                if (result != null) {
                    val extractedUrl = if (result.contains("cloudnestra.com/rcp/")) {
                        UrlDecoder.decodeCloudnestraUrl(result) ?: result
                    } else {
                        result
                    }
                    updateStatus("Extraction successful!", extractedUrl)
                    binding.btnPlay.visibility = View.VISIBLE
                    binding.btnPlay.setOnClickListener {
                        try {
                            val playIntent = android.content.Intent(android.content.Intent.ACTION_VIEW).apply {
                                setDataAndType(android.net.Uri.parse(extractedUrl), if (extractedUrl.contains(".m3u8")) "application/x-mpegURL" else "video/*")
                                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            startActivity(playIntent)
                        } catch (_: Exception) {
                            val browserIntent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(extractedUrl))
                            startActivity(browserIntent)
                        }
                    }
                } else {
                    updateStatus("Extraction failed: No URL found", url)
                }
            } catch (e: Exception) {
                updateStatus("Error: ${e.message}", url)
            } finally {
                binding.progressIndicator.visibility = View.GONE
            }
        }
    }

    private fun updateStatus(status: String, url: String) {
        binding.tvStatus.text = status
        binding.tvUrl.text = url
    }
}
