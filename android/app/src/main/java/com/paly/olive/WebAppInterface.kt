package com.paly.olive

import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat.startActivity
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileWriter
import java.io.IOException

class WebAppInterface(private val context: Context) {
    @JavascriptInterface
    fun export(json: String, filename: String): String {
        val file = File(context.filesDir, filename)
        try {
            FileWriter(file).use { fileWriter -> fileWriter.write(json) }
        } catch (e: IOException) {
            return "error"
        }

        val shareIntent = Intent(Intent.ACTION_SEND)
        shareIntent.setType("application/json")
        val fileUri = FileProvider.getUriForFile(context, "com.paly.olive.fileprovider", file)
        // fixes: java.lang.SecurityException: Permission Denial: reading androidx.core.content.FileProvider uri content://com.paly.olive.fileprovider/files/activities.json from pid=10935, uid=1000 requires the provider be exported, or grantUriPermission()
        // https://stackoverflow.com/a/75015592/7946803
        shareIntent.clipData = ClipData.newRawUri("", fileUri)
        shareIntent.putExtra(Intent.EXTRA_STREAM, fileUri)
        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

        context.startActivity(Intent.createChooser(shareIntent, "Share $filename"))

        return "ok"
    }
}