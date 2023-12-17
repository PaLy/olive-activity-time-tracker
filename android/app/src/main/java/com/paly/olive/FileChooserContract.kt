package com.paly.olive

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.result.contract.ActivityResultContract

class FileChooserContract : ActivityResultContract<Intent, Array<Uri>>() {
    override fun createIntent(context: Context, input: Intent) = input

    override fun parseResult(resultCode: Int, intent: Intent?): Array<Uri> {
        return if (resultCode == Activity.RESULT_OK) {
            val data = intent?.data
            if (data != null) {
                arrayOf(data)
            } else {
                val clipData = intent?.clipData
                if (clipData != null) {
                    Array(clipData.itemCount) { clipData.getItemAt(it).uri }
                } else {
                    emptyArray()
                }
            }
        } else {
            emptyArray()
        }
    }
}

