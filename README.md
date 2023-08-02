# react-native-rustore-billing

React Native RuStoreSDK для подключения платежей

## Общее

### Пример реализации
Для того, чтобы узнать как правильно интегрировать платежи, рекомендуется ознакомиться с приложением-примером в папке `example`.

### Условия работы платежей
Для работы проведения платежей необходимо соблюдение следующих условий:
- На устройстве пользователя должен быть установлен RuStore.
- RuStore должен поддерживать функциональность платежей.
- Пользователь должен быть авторизован в RuStore.
- Пользователь и приложение не должны быть заблокированы в RuStore.
- Для приложения должна быть включена возможность покупок в консоли разработчика RuStore.

## Подключение в проект
```sh
// HTTPS
npm install git+https://git@gitflic.ru:rustore/react-native-rustore-billing-sdk.git

// SSH
npm install git+ssh://git@gitflic.ru:rustore/react-native-rustore-billing-sdk.git
```

### Обработка deeplink
Для корректной работы оплаты через сторонние приложения (СБП или SberPay), вам необходимо правильно реализовать обработку deeplink. Для этого необходимо указать в AndroidManifest.xml intent-filter с scheme вашего проекта:
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
где "yourappscheme" - схема вашего deeplink, может быть изменена на другую.
Эта схема должна совпадать со схемой, передаваемым в методе `RustoreBillingClient.init()`.

## Инициализация
Перед вызовом методов библиотеки необходимо выполнить ее инициализацию. Для инициализации вызовете метод `RustoreBillingClient.init()`:

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
- `consoleApplicationId` - код приложения из консоли разработчика RuStore (пример: https://console.rustore.ru/apps/123456).
- `deeplinkScheme` - cхема deeplink, необходимая для возврата в ваше приложение после оплаты через стороннее приложение (например, SberPay или СБП). SDK генерирует свой хост к данной схеме.
Важно, чтобы схема deeplink, передаваемая в deeplinkScheme, совпадала со схемой, указанной в AndroidManifest.xml в разделе "Обработка deeplink".

## Проверка доступности работы с платежами
Для проверки доступности платежей необходимы следующие условия:
- На устройстве пользователя должен быть установлен RuStore.
- RuStore должен поддерживать функциональность платежей.
- Пользователь должен быть авторизован в RuStore.
- Пользователь и приложение не должны быть заблокированы в RuStore.
- Для приложения должна быть включена возможность покупок в консоли разработчика RuStore.
- Если все условия выполняются, метод `RustoreBillingClient.checkPurchasesAvailability()` возвращает значение `true`.

```ts
try {
  const isAvailable = await RustoreBillingClient.checkPurchasesAvailability();
  console.log(`available success ${isAvailable}`);
} catch (err) {
  console.log(`available error ${err}`);
}
```

## Работа с продуктами

### Получение списка продуктов
Для получения продуктов необходимо использовать метод `RustoreBillingClient.getProducts(productIds)`:

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
- `productIds` - список идентификаторов продуктов.

Метод возвращает список продуктов `Product[]`. Ниже представлена модель продукта:
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
- `productId` - идентификатор продукта.
- `productType` - тип продукта.
- `productStatus` - статус продукта.
- `priceLabel` - отформатированная цена товара, включая валютный знак на языке [language].
- `price` - цена в минимальных единицах.
- `currency` - код валюты ISO 4217.
- `language` - язык, указанный с помощью BCP 47 кодирования.
- `title` - название продукта на языке [language].
- `description` - описание продукта на языке [language].
- `imageUrl` - ссылка на картинку.
- `promoImageUrl` - ссылка на промо картинку.
- `subscription` - описание подписки, возвращается только для продуктов с типом subscription.

Структура подписки `Subscription`:
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
- `subscriptionPeriod` - период подписки.
- `freeTrialPeriod` - пробный период подписки.
- `gracePeriod` - льготный период подписки.
- `introductoryPrice` - отформатированная вступительная цена подписки, включая знак валюты, на языке product:language.
- `introductoryPriceAmount` - вступительная цена в минимальных единицах валюты (в копейках).
- `introductoryPricePeriod` - расчетный период вступительной цены.

Интерфейс периода подписки `SubscriptionPeriod`:
```ts
interface SubscriptionPeriod {
    years: number;
    months: number;
    days: number;
}
```
- `years` - количество лет.
- `months` - количество месяцев.
- `days` - количество дней.

## Работа с покупками
### Получение списка покупок
Для получения списка покупок необходимо использовать метод `RustoreBillingClient.getPurchases()`:
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

Метод возвращает список покупок `Purchase[]`. Ниже представлена модель покупки:
```ts
interface Purchase {
  purchaseId?: string;
  productId: string;
  productType?: ProductType;
  invoiceId?: string;
  description?: string;
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
- `purchaseId` - идентификатор покупки.
- `productId` - идентификатор продукта.
- `productType` - тип продукта.
- `invoiceId` - идентификатор счета.
- `description` - описание покупки.
- `language` - язык, указанный с помощью BCP 47 кодирования.
- `purchaseTime` - время покупки (в формате RFC 3339).
- `orderId` - уникальный идентификатор оплаты, сформированный приложением (uuid).
- `amountLabel` - отформатированная цена покупки, включая валютный знак на языке [language].
- `amount` - цена в минимальных единицах валюты.
- `currency` - код валюты ISO 4217.
- `quantity` - количество продукта.
- `purchaseState` - состояние покупки.
  - `CREATED` - создана.
  - `INVOICE_CREATED` - создана, ожидает оплаты.
  - `CONFIRMED` - подтверждена.
  - `PAID` - оплачена.
  - `CANCELLED` - покупка отменена.
  - `CONSUMED` - потребление покупки подтверждено.
  - `CLOSED` - подписка была отменена.
  - `TERMINATED` - подписка завершена.
- `developerPayload` - указанная разработчиком строка, содержащая дополнительную информацию о заказе.
- `subscriptionToken` - токен для валидации покупки на сервере.

### Получение конкретной покупки
Для получения конкретной покупки необходимо использовать метод `RustoreBillingClient.getPurchaseInfo(purchaseId)`:
```ts
try {
  const purchase = await RustoreBillingClient.getPurchaseInfo('purchaseId');
  console.log(purchase?.purchaseId);
} catch (err) {
  console.log(`purchase err: ${err}`);
}
```
- `purchaseId` - идентификатор покупки.

Метод возвращает `Purchase`, интерфейс которой описан выше.

### Покупка продукта
Для вызова покупки продукта используйте метод `RustoreBillingClient.purchaseProduct({...})`:
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
- `productId` - идентификатор продукта.
- `orderId` - идентификатор заказа, создаётся на стороне AnyApp (опционально. Если не указан, то генерируется автоматически).
- `quantity` - количество продуктов (опционально).
- `developerPayload` - дополнительная информация от разработчика AnyApp (опционально).

Результатом покупки может быть один из следующих интерфейсов: `SuccessPayment`, `CancelledPayment` или `FailurePayment`:
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
  subscriptionToken?: string;
}

interface SuccessPayment {
  type: PaymentResult.SUCCESS;
  result: SuccessPaymentResult;
}

interface CancelledPaymentResult {
  purchaseId: string;
}

interface CancelledPayment {
  type: PaymentResult.CANCELLED;
  result: CancelledPaymentResult;
}

interface FailurePaymentResult {
  purchaseId?: string;
  invoiceId?: string;
  orderId?: string;
  quantity?: number;
  productId?: string;
  errorCode?: number;
}

interface FailurePayment {
  type: PaymentResult.FAILURE;
  result: FailurePaymentResult;
}
```
- `SuccessPayment` - результат успешного завершения покупки цифрового товара.
- `FailurePayment` - результат ошибки покупки цифрового товара.
- `CancelledPayment` - результат отмены покупки цифрового товара.

### Потребление (подтверждение) покупки
RuStore содержит продукты следующих типов:
- `CONSUMABLE` - потребляемый (можно купить много раз, например кристаллы в приложении).
- `NON_CONSUMABLE` - непотребляемый (можно купить один раз, например отключение рекламы в приложении).
- `SUBSCRIPTION` - подписка (можно купить на период времени, например подписка в стриминговом сервисе).

Потребления требуют только продукты типа `CONSUMABLE`, если они находятся в состоянии `PurchaseState.PAID`.

Для потребления покупки вы можете использовать метод `RustoreBillingClient.confirmPurchase({...})`:
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
- `purchaseId` - идентификатор покупки.
- `developerPayload` - дополнительная информация от разработчика AnyApp (опционально).

Если все условия выполняются, метод `RustoreBillingClient.confirmPurchase()` возвращает значение `true`.

### Отмена покупки

Для отмены покупки вы можете использовать метод `RustoreBillingClient.deletePurchase(purchaseId)`:
```ts
try {
  const isDeleted = await RustoreBillingClient.deletePurchase(purchaseId)
  console.log(`delete success: ${isDeleted}`);
} catch (err) {
  console.log(`delete err: ${err}`);
}
```
- `purchaseId` - идентификатор покупки.

Если все условия выполняются, метод `RustoreBillingClient.deletePurchase()` возвращает значение `true`.

## Сценарий потребления и отмены покупки
Обработка незавершённых платежей должна производиться разработчиком AnyApp.

Метод отмены покупки (`deletePurchase`) необходимо использовать, если:

- Метод получения списка покупок (`getPurchases`) вернул покупку со статусом:
  - `PurchaseState.CREATED`.
  - `PurchaseState.INVOICE_CREATED`.
- Метод покупки (`purchaseProduct`) вернул `PaymentResult.Cancelled`.
- Метод покупки (`purchaseProduct`) вернул `PaymentResult.Failure`.

Метод потребления продукта (`confirmPurchase`) необходимо использовать, если метод получения списка покупок (`getPurchases`) вернул покупку типа `CONSUMABLE` и со статусом `PurchaseState.PAID`.

## Тестовые данные
[Ссылка](https://securepayments.sberbank.ru/wiki/doku.php/test_cards) на тестовые банковские карты.
