package com.rustorebilling

import android.content.Intent
import com.facebook.react.ReactActivity

class RustoreIntent : ReactActivity() {
  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)

    RustoreBillingModule.billingClient.onNewIntent(intent)
  }
}
