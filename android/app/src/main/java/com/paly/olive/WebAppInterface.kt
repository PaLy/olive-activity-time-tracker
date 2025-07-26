package com.paly.olive

import android.Manifest
import android.annotation.SuppressLint
import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.webkit.JavascriptInterface
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileWriter
import java.io.IOException

class WebAppInterface(private val context: Context) {

    private val notificationManager = ActivityNotificationManager(context)

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

    @SuppressLint("MissingPermission")
    @JavascriptInterface
    fun updateNotification(activitiesJson: String): String {
        try {
            if (!hasNotificationPermission()) {
                return "permission_denied"
            }

            val success = notificationManager.updateNotification(activitiesJson)
            return if (success) "success" else "error"
        } catch (e: Exception) {
            return "error: ${e.message}"
        }
    }

    @JavascriptInterface
    fun stopNotification(): String {
        try {
            notificationManager.clearNotification()
            return "success"
        } catch (e: Exception) {
            return "error: ${e.message}"
        }
    }

    @JavascriptInterface
    fun hasNotificationPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true // Notifications are automatically granted for API < 33
        }
    }

    @JavascriptInterface
    fun requestNotificationPermission(): String {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (context is MainActivity) {
                ActivityCompat.requestPermissions(
                    context,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
                return "requested"
            }
            return "error: cannot request permission"
        }
        return "not_needed"
    }

    companion object {
        const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
    }
}