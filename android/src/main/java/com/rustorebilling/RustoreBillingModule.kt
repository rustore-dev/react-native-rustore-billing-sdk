package com.rustorebilling

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import ru.rustore.sdk.billingclient.RuStoreBillingClient
import ru.rustore.sdk.billingclient.RuStoreBillingClientFactory
import ru.rustore.sdk.core.feature.model.FeatureAvailabilityResult

class RustoreBillingModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    lateinit var billingClient: RuStoreBillingClient
  }

  override fun getName(): String {
    return "RustoreBilling"
  }

  @ReactMethod
  fun initialize(params: ReadableMap) {
    billingClient = RuStoreBillingClientFactory.create(
      context = reactApplicationContext,
      consoleApplicationId = params.getString("consoleApplicationId") ?: "",
      deeplinkScheme = params.getString("deeplinkScheme") ?: "",
      externalPaymentLoggerFactory = { tag -> PaymentLogger(tag) },
      debugLogs = true,
    );
  }

  @ReactMethod
  fun checkPurchasesAvailability(promise: Promise) {
    try {
      when (val result = billingClient.purchases.checkPurchasesAvailability().await()) {
        is FeatureAvailabilityResult.Available -> {
          promise.resolve(true)
        }
        is FeatureAvailabilityResult.Unavailable -> {
          promise.resolve(result.cause.message)
        }
      }
    } catch (throwable: Throwable) {
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun getProducts(productIds: MutableList<String>, promise: Promise) {
    try {
      val productsResponse = billingClient.products.getProducts(productIds).await()
      promise.resolve(productsResponse)
    } catch (throwable: Throwable) {
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun getPurchases(promise: Promise) {
    try {
      val purchaseResponse = billingClient.purchases.getPurchases().await()
      promise.resolve(purchaseResponse)
    } catch (throwable: Throwable) {
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun getPurchaseInfo(purchaseId: String, promise: Promise) {
    try {
      val purchaseInfo = billingClient.purchases.getPurchaseInfo(purchaseId).await()
      promise.resolve(purchaseInfo)
    } catch (throwable: Throwable) {
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun purchaseProduct(product: ReadableMap, developerPayload: String?, promise: Promise) {
    try {
      val paymentResult = billingClient.purchases.purchaseProduct(product.getString("productId") ?: "").await()
      promise.resolve(paymentResult)
    } catch (throwable: Throwable) {
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun confirmPurchase(purchaseId: String, developerPayload: String?, promise: Promise) {
    try {
      val confirmPurchaseResponse = billingClient.purchases.confirmPurchase(purchaseId, developerPayload).await()
      promise.resolve(confirmPurchaseResponse)
    } catch (throwable: Throwable) {
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun deletePurchase(purchaseId: String, promise: Promise) {
    try {
      val deletePurchaseInfo = billingClient.purchases.deletePurchase(purchaseId).await()
      promise.resolve(deletePurchaseInfo)
    } catch (throwable: Throwable) {
      promise.reject(throwable)
    }
  }
}
