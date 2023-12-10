package com.paly.olive

import android.os.Bundle
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val myWebView = WebView(applicationContext)
        setContentView(myWebView)

        myWebView.settings.javaScriptEnabled = true

        myWebView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                Log.e(
                    "Olive:web", "${message.message()} -- From line " +
                        "${message.lineNumber()} of ${message.sourceId()}"
                )
                return true
            }
        }

        myWebView.loadUrl("file:///android_asset/www/index.html")
    }
}
