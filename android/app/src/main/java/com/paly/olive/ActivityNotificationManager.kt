package com.paly.olive

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class ActivityNotificationManager(private val context: Context) {

    companion object {
        private const val CHANNEL_ID = "activity_tracker_channel"
        private const val NOTIFICATION_ID = 1
    }

    private val notificationManager: NotificationManagerCompat = NotificationManagerCompat.from(context)

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Activity Tracker",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Shows currently running activities"
            setShowBadge(false)
        }

        val systemNotificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        systemNotificationManager.createNotificationChannel(channel)
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    fun updateNotification(activitiesJson: String): Boolean {
        try {
            val activities = parseActivitiesJson(activitiesJson)

            if (activities.isEmpty()) {
                clearNotification()
                return true
            }

            val notification = createActivitiesNotification(activities)
            notificationManager.notify(NOTIFICATION_ID, notification)
            return true

        } catch (_: Exception) {
            val errorNotification = createErrorNotification()
            notificationManager.notify(NOTIFICATION_ID, errorNotification)
            return false
        }
    }

    fun clearNotification() {
        notificationManager.cancel(NOTIFICATION_ID)
    }

    private fun parseActivitiesJson(json: String): List<ActivityInfo> {
        val activities = mutableListOf<ActivityInfo>()

        if (json.startsWith("[") && json.endsWith("]")) {
            val content = json.substring(1, json.length - 1)
            if (content.isNotEmpty()) {
                val items = content.split("},{")

                for (item in items) {
                    val cleanItem = item.replace("{", "").replace("}", "")
                    val parts = cleanItem.split(",")

                    var fullName = ""
                    var duration = ""

                    for (part in parts) {
                        val keyValue = part.split(":")
                        if (keyValue.size == 2) {
                            val key = keyValue[0].trim().replace("\"", "")
                            val value = keyValue[1].trim().replace("\"", "")

                            when (key) {
                                "fullName" -> fullName = value
                                "duration" -> duration = value
                            }
                        }
                    }

                    if (fullName.isNotEmpty()) {
                        activities.add(ActivityInfo(fullName, duration))
                    }
                }
            }
        }

        return activities
    }

    private fun createActivitiesNotification(activities: List<ActivityInfo>): Notification {
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = if (activities.size == 1) {
            "1 activity in progress"
        } else {
            "${activities.size} activities in progress"
        }

        val contentText = activities.joinToString(", ") { it.fullName }

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setAutoCancel(false)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(createDetailedText(activities))
            )

        return builder.build()
    }

    private fun createDetailedText(activities: List<ActivityInfo>): String {
        return activities.joinToString("\n") { activity ->
            "${activity.fullName}${if (activity.duration.isNotEmpty()) " - ${activity.duration}" else ""}"
        }
    }

    private fun createErrorNotification(): Notification {
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("Activity Tracker")
            .setContentText("Error updating activities")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setAutoCancel(false)
            .build()
    }

    data class ActivityInfo(
        val fullName: String,
        val duration: String = ""
    )
}
