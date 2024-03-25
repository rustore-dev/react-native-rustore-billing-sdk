package com.rustorebilling.utils

import android.content.Context
import android.content.res.Configuration
import ru.rustore.sdk.billingclient.presentation.BillingClientTheme
import ru.rustore.sdk.billingclient.provider.BillingClientThemeProvider

internal class BillingClientThemeProviderImpl(
  private val context: Context,
) : BillingClientThemeProvider {

  override fun provide(): BillingClientTheme =
    when (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) {
      Configuration.UI_MODE_NIGHT_NO -> BillingClientTheme.Light
      Configuration.UI_MODE_NIGHT_YES -> BillingClientTheme.Dark
      else -> BillingClientTheme.Light
    }
}
