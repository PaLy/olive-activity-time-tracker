package com.paly.olive

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import androidx.webkit.WebViewClientCompat


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

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", AssetsPathHandler(this))
            .build()
        myWebView.webViewClient = object : WebViewClientCompat() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }
        }

        myWebView.addJavascriptInterface(WebAppInterface(context), "Android")

        myWebView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
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
