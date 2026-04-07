package com.bongbee.tdmb.util

import android.util.Base64
import android.util.Log

object UrlDecoder {
    fun decodeCloudnestraUrl(url: String): String? {
        return try {
            val encoded = url.substringAfter("/rcp/")
            val decoded = String(Base64.decode(encoded, Base64.DEFAULT))

            val patterns = listOf(
                Regex("""(https?://[^\s"']+\.m3u8[^\s"']*)"""),
                Regex("""(https?://[^\s"']+\.mp4[^\s"']*)"""),
                Regex("""(https?://[^\s"']+/(?:manifest|playlist|master)[^\s"']*)""")
            )

            for (pattern in patterns) {
                pattern.find(decoded)?.value?.let { return it }
            }
            if (decoded.startsWith("http")) return decoded
            null
        } catch (e: Exception) {
            Log.e("UrlDecoder", "Decode failed", e)
            null
        }
    }
}
