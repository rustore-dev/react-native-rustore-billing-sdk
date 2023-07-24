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
npm install react-native-rustore-billing
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
Эта схема должна совпадать со схемой, передаваемым в методе `initialize()`.

## Инициализация
Перед вызовом методов библиотеки необходимо выполнить ее инициализацию. Для инициализации вызовете метод `RustoreBillingClient.initialize()`:

```ts
try {
  RustoreBillingClient.initialize({
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
Для получения продуктов необходимо использовать метод `RustoreBillingClient.getProducts(ids)`:

```ts
try {
  const products = await RustoreBillingClient.getProducts(ids);
  for (const product of products) {
    console.log(product?.productId);
  }
} catch (err) {
  console.log(`products err: ${err}`);
}
```
- `ids` - список идентификаторов продуктов.

Метод возвращает `Product[]`:
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

Интерфейс подписки `Subscription`:
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

Метод возвращает `Purchase[]`:
```ts
interface Purchase {
    purchaseId?: string;
    productId?: string;
    description?: string;
    language?: string;
    purchaseTime?: string;
    orderId?: string;
    amountLabel?: string;
    amount?: number;
    currency?: string;
    quantity?: number;
    purchaseState?: string;
    developerPayload?: string;
}
```
- `purchaseId` - идентификатор покупки.
- `productId` - идентификатор продукта.
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
  - `TERMINATED` - подписка больше не существует.
- `developerPayload` - указанная разработчиком строка, содержащая дополнительную информацию о заказе.

### Получение конкретной покупки
Для получения конкретной покупки необходимо использовать метод `RustoreBillingClient.getPurchaseInfo(id)`:
```ts
try {
  const purchase = await RustoreBillingClient.getPurchaseInfo('purchaseId');
  console.log(purchase?.purchaseId);
} catch (err) {
  console.log(`purchase err: ${err}`);
}
```

Метод возвращает `Purchase`, который описан выше.

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
- `orderId` - идентификатор заказа.
- `quantity` - количество продуктов.
- `developerPayload` - указанная разработчиком строка, содержащая дополнительную информацию.

Интерфейсы результата покупки могут быть `SuccessPayment`, `CancelledPayment` или `FailurePayment`:
```ts
enum PaymentResultType {
  SUCCESS = 'SUCCESS',
  CANCELLED = 'CANCELLED',
  FAILURE = 'FAILURE',
}

interface SuccessPaymentResult {
  orderId?: string;
  purchaseId?: string;
  productId?: string;
  invoiceId?: string;
  subscriptionToken?: string;
}

interface SuccessPayment {
  type: PaymentResultType.SUCCESS;
  result: SuccessPaymentResult;
}

interface CancelledPaymentResult {
  purchaseId?: string;
}

interface CancelledPayment {
  type: PaymentResultType.CANCELLED;
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
  type: PaymentResultType.FAILURE;
  result: FailurePaymentResult;
}
```
- `SuccessPayment` - результат успешного завершения покупки цифрового товара.
- `CancelledPayment` - результат ошибки покупки цифрового товара.
- `FailurePayment` - результат отмены покупки цифрового товара.

### Потребление (подтверждение) покупки
RuStore содержит продукты следующих типов:
- `CONSUMABLE` - потребляемый (можно купить много раз, например кристаллы в приложении).
- `NON_CONSUMABLE` - непотребляемый (можно купить один раз, например отключение рекламы в приложении).
- `SUBSCRIPTION` - подписка (можно купить на период времени, например подписка в стриминговом сервисе).
  Потребления требуют только продукты типа CONSUMABLE, если они находятся в состоянии PurchaseState.PAID.

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
- `developerPayload` - указанная разработчиком строка, содержащая дополнительную информацию.

Если все условия выполняются, метод `RustoreBillingClient.confirmPurchase()` возвращает значение `true`.

### Отмена покупки

Для отмены покупки вы можете использовать метод `RustoreBillingClient.deletePurchase(id)`:
```ts
try {
  const isDeleted = await RustoreBillingClient.deletePurchase(id)
  console.log(`delete success: ${isDeleted}`);
} catch (err) {
  console.log(`delete err: ${err}`);
}
```
- `id` - идентификатор покупки.

Если все условия выполняются, метод `RustoreBillingClient.deletePurchase()` возвращает значение `true`.

## Тестовые данные
[Ссылка](https://securepayments.sberbank.ru/wiki/doku.php/test_cards) на тестовые банковские карты.
