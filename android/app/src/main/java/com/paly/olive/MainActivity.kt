package com.paly.olive

import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import androidx.webkit.WebViewClientCompat

class MainActivity : ComponentActivity() {
    private lateinit var myWebView: WebView
    private lateinit var backPressedCallback: OnBackPressedCallback

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        createWebView()
        setupOnBackPressedCallback()
    }

    override fun onResume() {
        super.onResume()
        if (!backPressedCallback.isEnabled) {
            backPressedCallback.isEnabled = true
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
        deviceId: Int
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults, deviceId)

        when (requestCode) {
            WebAppInterface.NOTIFICATION_PERMISSION_REQUEST_CODE -> {
                val granted = grantResults.isNotEmpty() &&
                             grantResults[0] == PackageManager.PERMISSION_GRANTED

                // Notify the web app about the permission result
                val result = if (granted) "granted" else "denied"
                myWebView.evaluateJavascript(
                    "window.dispatchEvent(new CustomEvent('notificationPermissionResult', { detail: '$result' }));",
                    null
                )
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView() {
        setContentView(R.layout.activity_main)
        myWebView = findViewById(R.id.webview)
        val statusBar = findViewById<View>(R.id.status_bar)
        val navigationBar = findViewById<View>(R.id.navigation_bar)

        ViewCompat.setOnApplyWindowInsetsListener(myWebView) { v: View, insets: WindowInsetsCompat ->
            val systemBarsInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime()) // Get keyboard insets

            statusBar.layoutParams.height = systemBarsInsets.top + imeInsets.top
            navigationBar.layoutParams.height = systemBarsInsets.bottom + imeInsets.bottom
            statusBar.requestLayout()
            navigationBar.requestLayout()
            WindowInsetsCompat.CONSUMED
        }

        myWebView.setBackgroundColor(Color.TRANSPARENT)

        myWebView.settings.javaScriptEnabled = true

        myWebView.webChromeClient = MyWebChromeClient(this)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", AssetsPathHandler(this))
            .build()
        myWebView.webViewClient = object : WebViewClientCompat() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
                Log.e("MainActivity", "WebView render process gone. Terminated: " + detail.didCrash())
                view.destroy()
                createWebView()
                Log.i("MainActivity", "WebView recreated after render process crash.")
                return true
            }
        }

        myWebView.addJavascriptInterface(WebAppInterface(this), "Android")

        myWebView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
    }

    private fun setupOnBackPressedCallback() {
        backPressedCallback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (myWebView.canGoBack()) {
                    myWebView.goBack()
                } else {
                    // If the WebView can't go back, disable this callback
                    // and call onBackPressed() again to let the system handle it (e.g., finish the activity)
                    // Or, if you want to explicitly finish:
                    // finish()
                    // However, letting the system handle it is usually better if you might have fragments.
                    // For a simple activity like this, finish() is okay, but isEnabled = false is more robust.

                    if (isEnabled) { // Check if still enabled to prevent potential recursive calls
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed() // Trigger default back behavior (e.g., finish activity)
                    }
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, backPressedCallback)
    }
}
