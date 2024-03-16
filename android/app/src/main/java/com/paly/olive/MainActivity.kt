package com.paly.olive

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.WebView
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    lateinit var myWebView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val context = peekAvailableContext()
        if (context != null) {
            createWebView(context)
        } else {
            addOnContextAvailableListener { createWebView(it) }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(context: Context) {
        myWebView = WebView(context)
        myWebView.setBackgroundColor(Color.TRANSPARENT)
        setContentView(myWebView)

        myWebView.settings.javaScriptEnabled = true

        myWebView.webChromeClient = MyWebChromeClient(this)

        myWebView.addJavascriptInterface(WebAppInterface(context), "Android")

        myWebView.loadUrl("file:///android_asset/www/index.html")
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            when (keyCode) {
                KeyEvent.KEYCODE_BACK -> {
                    if (myWebView.canGoBack()) {
                        myWebView.goBack()
                    } else {
                        finish()
                    }
                    return true
                }
            }
        }
        return super.onKeyDown(keyCode, event)
    }
}
