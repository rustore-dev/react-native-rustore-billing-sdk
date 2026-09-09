<!-- ── Language switch (EN active) ──────────────────────────────────── -->
<div align="left" style="margin:0 0 14px 0;">

  <span style="display:inline-block;
               padding:.28rem .6rem;
               border:1px solid rgba(0,0,0,.18);
               border-radius:10px 0 0 10px;
               font-weight:400;
               font-size:12px;
               letter-spacing:.06em;
               color:#111827;
               background:linear-gradient(180deg,#ffffff,#e9edf2);
               box-shadow:0 1px 0 rgba(0,0,0,.06);">
    [RU][ru]
  </span><span style="display:inline-block;
               margin-left:-1px;
               padding:.28rem .6rem;
               border:1px solid rgba(0,0,0,.14);
               border-radius:0 10px 10px 0;
               font-weight:400;
               font-size:12px;
               letter-spacing:.06em;
               background:linear-gradient(180deg,#f3f4f6,#ffffff);
               box-shadow:inset 0 2px 6px rgba(0,0,0,.10);">
    EN
  </span>

</div>
<!-- ────────────────────────────────────────────────────────────────── -->

# react-native-rustore-billing

React Native RuStoreSDK for payment integration

[Documentation on payments](https://www.rustore.ru/help/sdk/payments)

## General

### Implementation example
To learn how to correctly integrate payments, it's recommended to examine the sample application in the `example` folder.

### Conditions for payment operation
To conduct payments, the following conditions must be met:
- RuStore must be installed on the user's device.
- RuStore must support payment functionality.
- The user must be authenticated in RuStore.
- The user and the application must not be blocked in RuStore.
- The app must have in-app purchase enabled in the RuStore developer console.

## Integration into the project
```sh
// HTTPS
npm install git+https://git@gitflic.ru/project/rustore/react-native-rustore-billing-sdk.git

// SSH
npm install git+ssh://git@gitflic.ru/project/rustore/react-native-rustore-billing-sdk.git
```

### Handling deeplinks
For correct payment processing through third-party apps (SberPay or СБП), you need to properly implement deeplink handling. To do this, specify an intent-filter with your project's scheme in AndroidManifest.xml:
```xml
<activity android:name=".sample.MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="yourappscheme" />
    </intent-filter>
</activity>
```
where "yourappscheme" is your deeplink scheme, which can be changed to another one.
This scheme must match the scheme passed in the `RustoreBillingClient.init()` method.

## Initialization
Before calling library methods, initialization is required. Call the `RustoreBillingClient.init()` method:

```ts
try {
  RustoreBillingClient.init({
    consoleApplicationId: 'appId',
    deeplinkScheme: 'scheme',
  });
  console.log(`initialize success: ${result}`);
} catch (err) {
  console.log(`initialize err: ${err}`);
}
```
- `consoleApplicationId` - the application ID from the RuStore developer console (example: https://console.rustore.ru/apps/123456).
- `deeplinkScheme` - the deeplink scheme needed to return to your app after payment via a third-party app (e.g., SberPay or СБП). The SDK generates its own host for this scheme.
It's important that the deeplink scheme passed in `deeplinkScheme` matches the scheme specified in AndroidManifest.xml under "Handling deeplinks".

### Checking payment availability
The following conditions are required to check payment availability:
- RuStore must be installed on the user's device.
- RuStore must support payment functionality.
- The user must be authenticated in RuStore.
- The user and the application must not be blocked in RuStore.
- In-app purchases must be enabled for the app in the RuStore developer console.
- If all conditions are met, the method `RustoreBillingClient.checkPurchasesAvailability()` returns `true`.

```ts
try {
  const isAvailable = await RustoreBillingClient.checkPurchasesAvailability();
  console.log(`available success ${isAvailable}`);
} catch (err) {
  console.log(`available error ${err}`);
}
```

### Check if RuStore is installed on the device

```ts
try {
  const isRuStoreInstalled = await RustoreBillingClient.isRuStoreInstalled()
} catch (err) => {
  console.log(`isRuStoreInstalled error ${err}`);
}
```

## Working with products

### Getting the list of products
To get the list of products, use the `RustoreBillingClient.getProducts(productIds)` method:

```ts
try {
  const products = await RustoreBillingClient.getProducts(productIds);
  for (const product of products) {
    console.log(product?.productId);
  }
} catch (err) {
  console.log(`products err: ${err}`);
}
```
- `productIds` - list of product IDs.

The method returns a list of products `Product[]`. Below is the product model:
```ts
interface Product {
    productId: string;
    productType?: ProductType;
    productStatus: ProductStatus;
    priceLabel?: string;
    price?: number;
    currency?: string;
    language?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    promoImageUrl?: string;
    subscription?: ProductSubscription;
}
```
- `productId` - product identifier.
- `productType` - product type.
- `productStatus` - product status.
- `priceLabel` - formatted product price, including currency symbol in [language].
- `price` - price in minimal units.
- `currency` - ISO 4217 currency code.
- `language` - language using BCP 47 encoding.
- `title` - product name in [language].
- `description` - product description in [language].
- `imageUrl` - link to an image.
- `promoImageUrl` - link to a promotional image.
- `subscription` - subscription details, returned only for subscription-type products.

Subscription structure `Subscription`:
```ts
interface ProductSubscription {
  subscriptionPeriod?: SubscriptionPeriod;
  freeTrialPeriod?: SubscriptionPeriod;
  gracePeriod?: SubscriptionPeriod;
  introductoryPrice?: string;
  introductoryPriceAmount?: string;
  introductoryPricePeriod?: SubscriptionPeriod;
}
```
- `subscriptionPeriod` - subscription period.
- `freeTrialPeriod` - trial period of subscription.
- `gracePeriod` - grace period of subscription.
- `introductoryPrice` - formatted introductory price of subscription, including currency sign in product:language.
- `introductoryPriceAmount` - introductory price in minimal currency units (in kopecks).
- `introductoryPricePeriod` - introductory price calculation period.

Subscription period interface `SubscriptionPeriod`:
```ts
interface SubscriptionPeriod {
    years: number;
    months: number;
    days: number;
}
```
- `years` - number of years.
- `months` - number of months.
- `days` - number of days.

## Working with purchases
### Getting the list of purchases
To get the list of purchases, use the `RustoreBillingClient.getPurchases()` method:
```ts
try {
  const purchases = await RustoreBillingClient.getPurchases();
  for (const purchase of purchases) {
    console.log(purchase?.purchaseId);
  }
} catch (err) {
  console.log(`purchase err: ${err}`);
}
```

The method returns a list of purchases `Purchase[]`. Below is the purchase model:
```ts
interface Purchase {
  purchaseId?: string;
  productId: string;
  productType?: ProductType;
  invoiceId?: string;
  language?: string;
  purchaseTime?: string;
  orderId?: string;
  amountLabel?: string;
  amount?: number;
  currency?: string;
  quantity?: number;
  purchaseState?: PurchaseState;
  developerPayload?: string;
  subscriptionToken?: string;
}
```
- `purchaseId` - purchase identifier.
- `productId` - product identifier.
- `productType` - product type.
- `invoiceId` - invoice identifier.
- `language` - language using BCP 47 encoding.
- `purchaseTime` - time of purchase (RFC 3339 format).
- `orderId` - unique payment identifier generated by the app (UUID).
- `amountLabel` - formatted purchase price, including currency symbol in [language].
- `amount` - price in minimal currency units.
- `currency` - ISO 4217 currency code.
- `quantity` - quantity of the product.
- `purchaseState` - purchase state.
  - `CREATED` - purchase created.
  - `INVOICE_CREATED` - invoice created for the purchase, waiting for payment.
  - `CONFIRMED` - final status, purchase confirmed (for subscriptions and non-consumable products). Funds sent to the developer. Repurchase of the item blocked by the store.
  - `PAID` - for consumable products only — intermediate status, funds reserved on buyer's account. Purchase awaiting confirmation from the developer.
  - `CANCELLED` - purchase cancelled — no payment was made or refund issued to the buyer (for subscriptions, after refund, purchase does not go to CANCELLED).
  - `CONSUMED` - purchase consumption confirmed.
  - `PAUSED` - subscription entered HOLD period.
  - `TERMINATED` - subscription ended.
- `developerPayload` - custom string provided by the developer containing additional order information.
- `subscriptionToken` - token for server-side validation of the purchase.

### Getting a specific purchase
To get a specific purchase, use the `RustoreBillingClient.getPurchaseInfo(purchaseId)` method:
```ts
try {
  const purchase = await RustoreBillingClient.getPurchaseInfo('purchaseId');
  console.log(purchase?.purchaseId);
} catch (err) {
  console.log(`purchase err: ${err}`);
}
```
- `purchaseId` - purchase identifier.

The method returns `Purchase`, the interface of which is described above.

### Purchasing a product
To initiate a product purchase, use the `RustoreBillingClient.purchaseProduct({...})` method:
```ts
try {
  const response = await RustoreBillingClient.purchaseProduct({
    productId: 'productId',
    orderId: 'orderId',
    quantity: 0,
    developerPayload: 'developerPayload'
  });
  console.log(`purchase success: ${response}`);
} catch (err) {
  console.log(`purchase err: ${err}`);
}
```
- `productId` - product identifier.
- `orderId` - order ID, created on AnyApp side (optional. If not specified, auto-generated).
- `quantity` - number of products (optional).
- `developerPayload` - additional information from AnyApp developer (optional).

The result of a purchase may be one of the following interfaces: `SuccessPayment`, `CancelledPayment` or `FailurePayment`:
```ts
enum PaymentResult {
  SUCCESS = 'SUCCESS',
  CANCELLED = 'CANCELLED',
  FAILURE = 'FAILURE',
}

interface SuccessPaymentResult {
  orderId?: string;
  purchaseId: string;
  productId: string;
  invoiceId: string;
  sandbox: boolean;
  subscriptionToken?: string;
}

interface SuccessPayment {
  type: PaymentResult.SUCCESS;
  response: SuccessPaymentResult;
}

interface CancelledPaymentResult {
  purchaseId: string;
  sandbox: boolean;
}

interface CancelledPayment {
  type: PaymentResult.CANCELLED;
  response: CancelledPaymentResult;
}

interface FailurePaymentResult {
  purchaseId?: string;
  invoiceId?: string;
  orderId?: string;
  quantity?: number;
  productId?: string;
  errorCode?: number;
  sandbox: boolean;
}

interface FailurePayment {
  type: PaymentResult.FAILURE;
  response: FailurePaymentResult;
}
```
- `SuccessPayment` - successful digital product purchase result.
- `FailurePayment` - failed digital product purchase result.
- `CancelledPayment` - cancelled digital product purchase result.

### Consuming (confirming) a purchase
RuStore contains the following product types:
- `CONSUMABLE` - consumable (can be purchased multiple times, e.g., crystals in an app).
- `NON_CONSUMABLE` - non-consumable (can be purchased once, e.g., ad removal in an app).
- `SUBSCRIPTION` - subscription (can be purchased for a period of time, e.g., streaming service subscription).

Consumption is only required for `CONSUMABLE` products in the `PurchaseState.PAID` state.

To consume a purchase, you can use the `RustoreBillingClient.confirmPurchase({...})` method:
```ts
try {
  const isConfirmed = await RustoreBillingClient.confirmPurchase({
    purchaseId: 'purchaseId',
    developerPayload: 'developerPayload'
  })
  console.log(`confirm success: ${isConfirmed}`);
} catch (err) {
  console.log(`confirm err: ${err}`);
}
```
- `purchaseId` - purchase identifier.
- `developerPayload` - additional information from AnyApp developer (optional).

If all conditions are met, the `RustoreBillingClient.confirmPurchase()` method returns `true`.

### Cancelling a purchase

To cancel a purchase, you can use the `RustoreBillingClient.deletePurchase(purchaseId)` method:
```ts
try {
  const isDeleted = await RustoreBillingClient.deletePurchase(purchaseId)
  console.log(`delete success: ${isDeleted}`);
} catch (err) {
  console.log(`delete err: ${err}`);
}
```
- `purchaseId` - purchase identifier.

If all conditions are met, the `RustoreBillingClient.deletePurchase()` method returns `true`.

## Consumption and cancellation scenario for purchases
Unfinished payments must be handled by the AnyApp developer.

Use the `deletePurchase` method if:

- The `getPurchases` method returned a purchase with the status:
  - `PurchaseState.CREATED`.
  - `PurchaseState.INVOICE_CREATED`.
- The `purchaseProduct` method returned `PaymentResult.Cancelled`.
- The `purchaseProduct` method returned `PaymentResult.Failure`.

Use the `confirmPurchase` method if the `getPurchases` method returned a `CONSUMABLE` purchase with the status `PurchaseState.PAID`.

## Test data
[Test bank cards link](https://securepayments.sberbank.ru/wiki/doku.php/test_cards)

[ru]: README.md
[en]: README.en.md
