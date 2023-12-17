package com.paly.olive

import android.net.Uri
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.ComponentActivity


class MyWebChromeClient(val activity: ComponentActivity) : WebChromeClient() {
    private lateinit var filePathCallback: ValueCallback<Array<Uri>>

    private val fileChooserLauncher = activity.registerForActivityResult(FileChooserContract()) {
        filePathCallback.onReceiveValue(it)
    }

    override fun onConsoleMessage(message: ConsoleMessage): Boolean {
        Log.e(
            "Olive:web",
            "${message.message()} -- From line " + "${message.lineNumber()} of ${message.sourceId()}"
        )
        return true
    }

    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>,
        fileChooserParams: FileChooserParams
    ): Boolean {
        this.filePathCallback = filePathCallback
        val intent = fileChooserParams.createIntent()
        fileChooserLauncher.launch(intent)
        return true
    }
}