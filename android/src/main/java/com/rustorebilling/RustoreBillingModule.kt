package com.rustorebilling

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.rustorebilling.utils.BillingClientThemeProviderImpl
import ru.rustore.sdk.billingclient.RuStoreBillingClient
import ru.rustore.sdk.billingclient.RuStoreBillingClientFactory
import ru.rustore.sdk.billingclient.model.product.SubscriptionPeriod
import ru.rustore.sdk.billingclient.model.purchase.PaymentResult
import ru.rustore.sdk.billingclient.model.purchase.Purchase
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
  fun init(params: ReadableMap) {
    if (RuStoreBillingClientFactory.isSingletonInitialized) {
      return;
    }

    val consoleApplicationId = params.getString("consoleApplicationId")!!
    val deeplinkScheme = params.getString("deeplinkScheme")!!
    billingClient = RuStoreBillingClientFactory.create(
      context = reactApplicationContext,
      consoleApplicationId,
      deeplinkScheme,
      themeProvider = BillingClientThemeProviderImpl(reactApplicationContext),
      externalPaymentLoggerFactory = { tag -> PaymentLogger(tag) },
      debugLogs = true,
    );
  }

  @ReactMethod
  fun checkPurchasesAvailability(promise: Promise) {
    billingClient.purchases.checkPurchasesAvailability()
      .addOnSuccessListener { availabilityResponse ->
        when (availabilityResponse) {
          is FeatureAvailabilityResult.Available -> {
            promise.resolve(true)
          }

          is FeatureAvailabilityResult.Unavailable -> {
            promise.resolve(availabilityResponse.cause.message)
          }
        }
      }.addOnFailureListener { throwable ->
        promise.reject(throwable)
      }
  }

  @ReactMethod
  fun getProducts(productIds: ReadableArray, promise: Promise) {
    val ids = mutableListOf<String>()
    for (index in 0 until productIds.size()) {
      ids.add(productIds.getString(index))
    }

    billingClient.products.getProducts(ids).addOnSuccessListener { products ->
      val result = WritableNativeArray()

      for (product in products) {
        val freeTrialPeriod = parsePeriod(product.subscription?.freeTrialPeriod)
        val gracePeriod = parsePeriod(product.subscription?.gracePeriod)
        val introductoryPricePeriod = parsePeriod(product.subscription?.introductoryPricePeriod)
        val subscriptionPeriod = parsePeriod(product.subscription?.subscriptionPeriod)

        val itemSubscription = WritableNativeMap().apply {
          putMap("freeTrialPeriod", freeTrialPeriod)
          putMap("gracePeriod", gracePeriod)
          putMap("introductoryPricePeriod", introductoryPricePeriod)
          putMap("subscriptionPeriod", subscriptionPeriod)
          putString("introductoryPrice", product.subscription?.introductoryPrice)
          putString("introductoryPriceAmount", product.subscription?.introductoryPriceAmount)
        }

        val item = WritableNativeMap().apply {
          putString("productId", product.productId)
          putString("currency", product.currency)
          putString("description", product.description)
          putString("language", product.language)
          putString("priceLabel", product.priceLabel)
          product.price?.let { putInt("price", it) }
          putString("title", product.title)
          putString("productType", product.productType.toString())
          putString("imageUrl", product.imageUrl.toString())
          putString("promoImageUrl", product.promoImageUrl.toString())
          putString("productStatus", product.productStatus.toString())
          putMap("subscription", itemSubscription)
        }
        result.pushMap(item)
      }

      promise.resolve(result)
    }.addOnFailureListener { throwable ->
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun getPurchases(promise: Promise) {
    billingClient.purchases.getPurchases().addOnSuccessListener { purchases ->
      val result = WritableNativeArray()
      for (purchase in purchases) {
        val item = parsePurchase(purchase)
        result.pushMap(item)
      }
      promise.resolve(result)
    }.addOnFailureListener { throwable ->
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun getPurchaseInfo(purchaseId: String, promise: Promise) {
    billingClient.purchases.getPurchaseInfo(purchaseId).addOnSuccessListener { purchase ->
      val result = parsePurchase(purchase)
      promise.resolve(result)
    }.addOnFailureListener { throwable ->
      promise.reject(throwable)
    }
  }

  @ReactMethod
  fun purchaseProduct(params: ReadableMap, promise: Promise) {
    val productId = params.getString("productId")!!
    val orderId = params.getString("orderId")
    val quantity = if (params.hasKey("quantity")) params.getInt("quantity") else null
    val developerPayload = params.getString("developerPayload")

    billingClient.purchases.purchaseProduct(productId, orderId, quantity, developerPayload)
      .addOnSuccessListener { paymentResult ->
        when (paymentResult) {
          is PaymentResult.Success -> {
            val response = WritableNativeMap().apply {
              putString("productId", paymentResult.productId)
              putString("purchaseId", paymentResult.purchaseId)
              putString("orderId", paymentResult.orderId)
              putString("invoiceId", paymentResult.invoiceId)
              putBoolean("sandbox", paymentResult.sandbox)
              putString("subscriptionToken", paymentResult.subscriptionToken)
            }

            val result = WritableNativeMap().apply {
              putString("type", "SUCCESS")
              putMap("response", response)
            }

            promise.resolve(result)
          }

          is PaymentResult.Cancelled -> {
            val response = WritableNativeMap().apply {
              putString("purchaseId", paymentResult.purchaseId)
              putBoolean("sandbox", paymentResult.sandbox)
            }

            val result = WritableNativeMap().apply {
              putString("type", "CANCELLED")
              putMap("response", response)
            }

            promise.resolve(result)
          }

          is PaymentResult.Failure -> {
            val response = WritableNativeMap().apply {
              putString("productId", paymentResult.productId)
              putString("purchaseId", paymentResult.purchaseId)
              putString("orderId", paymentResult.orderId)
              putString("invoiceId", paymentResult.invoiceId)
              putBoolean("sandbox", paymentResult.sandbox)
              paymentResult.errorCode?.let { putInt("errorCode", it) }
              paymentResult.quantity?.let { putInt("quantity", it) }
            }

            val result = WritableNativeMap().apply {
              putString("type", "FAILURE")
              putMap("response", response)
            }

            promise.resolve(result)
          }

          is PaymentResult.InvalidPaymentState -> {
            val throwable = Throwable(message = paymentResult.toString())
            promise.reject(throwable)
          }
        }
      }.addOnFailureListener { throwable ->
        promise.reject(throwable)
      };
  }

  @ReactMethod
  fun confirmPurchase(params: ReadableMap, promise: Promise) {
    val purchaseId = params.getString("purchaseId")!!
    val developerPayload = params.getString("developerPayload")

    billingClient.purchases.confirmPurchase(purchaseId, developerPayload).addOnSuccessListener {
      promise.resolve(true)
    }.addOnFailureListener { throwable ->
      promise.reject(throwable)
    };
  }

  @ReactMethod
  fun deletePurchase(purchaseId: String, promise: Promise) {
    billingClient.purchases.deletePurchase(purchaseId).addOnSuccessListener {
      promise.resolve(true)
    }.addOnFailureListener { throwable ->
      promise.reject(throwable)
    };
  }

  private fun parsePeriod(period: SubscriptionPeriod?): WritableNativeMap? {
    return period?.let {
      WritableNativeMap().apply {
        putInt("days", it.days)
        putInt("months", it.months)
        putInt("years", it.years)
      }
    }
  }

  private fun parsePurchase(purchase: Purchase): WritableNativeMap {
    return WritableNativeMap().apply {
      putString("productId", purchase.productId)
      putString("purchaseId", purchase.purchaseId)
      putString("orderId", purchase.orderId)
      putString("invoiceId", purchase.invoiceId)
      putString("subscriptionToken", purchase.subscriptionToken)
      putString("amountLabel", purchase.amountLabel)
      purchase.amount?.let { putInt("amount", it) }
      putString("currency", purchase.currency)
      putString("developerPayload", purchase.developerPayload)
      putString("language", purchase.language)
      putString("productType", purchase.productType.toString())
      putString("purchaseState", purchase.purchaseState.toString())
      putString("purchaseTime", purchase.purchaseTime.toString())
      purchase.quantity?.let { putInt("quantity", it) }
    }
  }
}
