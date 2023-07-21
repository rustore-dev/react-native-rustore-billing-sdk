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
  const result = await RustoreBillingClient.initialize(
    "123456",
    "yourappscheme://iamback",
  );
  console.log(`initialize success: ${result}`);
} catch (err) {
  console.log(`initialize err: ${err}`);
}
```

123456 - код приложения из консоли разработчика RuStore (пример: https://console.rustore.ru/apps/123456).
yourappscheme://iamback - cхема deeplink, необходимая для возврата в ваше приложение после оплаты через стороннее приложение (например, SberPay или СБП). SDK генерирует свой хост к данной схеме.
Важно, чтобы схема deeplink, передаваемая в deeplinkScheme, совпадала со схемой, указанной в AndroidManifest.xml в разделе "Обработка deeplink".

## Проверка доступности работы с платежами
Для проверки доступности платежей необходимы следующие условия:
- На устройстве пользователя должен быть установлен RuStore.
- RuStore должен поддерживать функциональность платежей.
- Пользователь должен быть авторизован в RuStore.
- Пользователь и приложение не должны быть заблокированы в RuStore.
- Для приложения должна быть включена возможность покупок в консоли разработчика RuStore.
- Если все условия выполняются, метод `RustoreBillingClient.available()` возвращает значение true.
```ts
try {
  const isAvailable = await RustoreBillingClient.available();
  console.log(`available success ${isAvailable}`);
} catch (err) {
  console.log(`available error ${err}`);
}
```

## Работа с продуктами

### Получение списка продуктов
Для получения продуктов необходимо использовать метод `RustoreBillingClient.products(ids)`:
```ts
try {
  const response = await RustoreBillingClient.products(ids);
  for (const product of response.products) {
    console.log(product?.productId);
  }
} catch (err) {
  console.log(`products err: ${err}`);
}
```
- `ids: Array<String>` - список идентификаторов продуктов.

Метод возвращает `ProductsResponse`:
```ts
interface ProductsResponse {
    code: number;
    products?: Array<Product>;
    errors?: Array<DigitalShopGeneralError>;
    errorMessage?: string;
    errorDescription?: string;
    traceId?: string;
}
```
- code - код ответа.
- products - список продуктов.
- errors - список ошибок.
- errorMessage - сообщение об ошибке.
- errorDescription - описание ошибки.
- traceId - идентификатор ошибки.

Интерфейс ошибки `DigitalShopGeneralError`:
```ts
interface DigitalShopGeneralError {
    name?: string;
    code?: number;
    description?: string;
}
```
- name - имя ошибки.
- code - код ошибки.
- description - описание ошибки.

Интерфейс продукта `Product`:
```ts
interface Product {
    productId: string;
    productType?: string;
    productStatus: string;
    priceLabel?: string;
    price?: number;
    currency?: string;
    language?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    promoImageUrl?: string;
    subscription?: Subscription;
}
```
- productId - идентификатор продукта.
- productType - тип продукта.
- productStatus - статус продукта.
- priceLable - отформатированная цена товара, включая валютный знак на языке [language].
- price - цена в минимальных единицах.
- currency - код валюты ISO 4217.
- language - язык, указанный с помощью BCP 47 кодирования.
- title - название продукта на языке [language].
- description - описание продукта на языке [language].
- imageUrl - ссылка на картинку.
- promoImageUrl - ссылка на промо картинку.
- subscription - описание подписки, возвращается только для продуктов с типом subscription.

Интерфейс подписки `Subscription`:
```ts
interface Subscription {
    subscriptionPeriod?: SubscriptionPeriod;
    freeTrialPeriod?: SubscriptionPeriod;
    gracePeriod?: SubscriptionPeriod;
    introductoryPrice?: string;
    introductoryPriceAmount?: string;
    introductoryPricePeriod?: SubscriptionPeriod;
}
```
- subscriptionPeriod - период подписки.
- freeTrialPeriod - пробный период подписки.
- gracePeriod - льготный период подписки.
- introductoryPrice - отформатированная вступительная цена подписки, включая знак валюты, на языке product:language.
- introductoryPriceAmount - вступительная цена в минимальных единицах валюты (в копейках).
- introductoryPricePeriod - расчетный период вступительной цены.

Интерфейс периода подписки `SubscriptionPeriod`:
```ts
interface SubscriptionPeriod {
    years: number;
    months: number;
    days: number;
}
```
- years - количество лет.
- months - количество месяцев.
- days - количество дней.

## Работа с покупками
### Получение списка покупок
Для получения списка покупок необходимо использовать метод `RustoreBillingClient.purchases()`:
```ts
try {
  const response = await RustoreBillingClient.purchases();
  for (const product of response.purchases) {
    console.log(product?.purchaseId);
  }
} catch (err) {
  console.log(`purchase err: ${err}`);
}
```

Метод возвращает `PurchasesResponse`:
```ts
interface PurchasesResponse {
    code: number;
    errorMessage?: string;
    errorDescription?: string;
    traceId?: string;
    purchases?: Array<Purchase>;
    errors?: Array<DigitalShopGeneralError>;
}
```
- code - код ответа.
- errorMessage - сообщение об ошибке.
- errorDescription - описание ошибки.
- traceId - идентификатор ошибки.
- errors - список ошибок.
- purchases - список покупок.

Интерфейс ошибки `DigitalShopGeneralError`:
```ts
interface DigitalShopGeneralError {
    name?: string;
    code?: number;
    description?: string;
}
```
- name - наименование ошибки.
- code - код ошибки.
- description - описание ошибки.

Интерфейс покупки `Purchase`:
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
- purchaseId - идентификатор покупки.
- productId - идентификатор продукта.
- description - описание покупки.
- language - язык, указанный с помощью BCP 47 кодирования.
- purchaseTime - время покупки (в формате RFC 3339).
- orderId - уникальный идентификатор оплаты, сформированный приложением (uuid).
- amountLable - отформатированная цена покупки, включая валютный знак на языке [language].
- amount - цена в минимальных единицах валюты.
- currency - код валюты ISO 4217.
- quantity - количество продукта.
- purchaseState - состояние покупки.
  - CREATED - создана.
  - INVOICE_CREATED - создана, ожидает оплаты.
  - CONFIRMED - подтверждена.
  - PAID - оплачена.
  - CANCELLED - покупка отменена.
  - CONSUMED - потребление покупки подтверждено.
  - CLOSED - подписка была отменена.
- developerPayload - указанная разработчиком строка, содержащая дополнительную информацию о заказе.

### Покупка продукта
Для вызова покупки продукта используйте метод `RustoreBillingClient.purchase(id)`:
```ts
try {
  const response = await RustoreBillingClient.purchase(id);
  console.log(`purchase success: ${response}`);
} catch (err) {
  console.log(`purchase err: ${err}`);
}
```
- id - идентификатор продукта.

Интерфейс результата покупки PaymentResult:
```ts
interface PaymentResult {
    successInvoice?: SuccessInvoice;
    invalidInvoice?: InvalidInvoice;
    successPurchase?: SuccessPurchase;
    invalidPurchase?: InvalidPurchase;
}
```

Интерфейс `SuccessInvoice`:
```ts
interface SuccessInvoice {
    invoiceId: string;
    finishCode: string;
}
```

Интерфейс `InvalidInvoice`:
```ts
interface InvalidInvoice {
    invoiceId?: string;
}
```

Интерфейс `SuccessPurchase`:
```ts
interface SuccessPurchase {
    finishCode: string;
    orderId?: string;
    purchaseId: string;
    productId: string;
}
```

Интерфейс `InvalidPurchase`:
```ts
interface InvalidPurchase {
    purchaseId?: string;
    invoiceId?: string;
    orderId?: string;
    quantity?: number;
    productId?: string;
    errorCode?: number;
}
```

- `SuccessInvoice` - платежи завершились с результатом.
- `InvalidInvoice` - платежи завершились без указания инвойса. Вероятно, они были запущены с некорректным инвойсом (пустая строка, например).
- `SuccessPurchase` - результат успешного завершения покупки цифрового товара.
- `InvalidPurchase` - при оплате цифрового товара платежи завершились c ошибкой.

Возможные статусы, которые может содержать `finishCode`:
- SUCCESSFUL_PAYMENT - успешная оплата.
- CLOSED_BY_USER - отменено пользователем.
- UNHANDLED_FORM_ERROR - неизвестная ошибка.
- PAYMENT_TIMEOUT - ошибка оплаты по таймауту.
- DECLINED_BY_SERVER - отклонено сервером.
- RESULT_UNKNOWN - неизвестный статус оплаты.

### Потребление (подтверждение) покупки
RuStore содержит продукты следующих типов:
- CONSUMABLE - потребляемый (можно купить много раз, например кристаллы в приложении).
- NON_CONSUMABLE - непотребляемый (можно купить один раз, например отключение рекламы в приложении).
- SUBSCRIPTION - подписка (можно купить на период времени, например подписка в стриминговом сервисе).
  Потребления требуют только продукты типа CONSUMABLE, если они находятся в состоянии PurchaseState.PAID.

Для потребления покупки вы можете использовать метод `RustoreBillingClient.confirm(id)`:
```ts
try {
  const response = await RustoreBillingClient.confirm(id)
  console.log(`confirm success: ${response}`);
} catch (err) {
  console.log(`confirm err: ${err}`);
}
```
- id - идентификатор покупки.

Метод возвращает `ConfirmPurchaseResponse`:
```ts
interface ConfirmPurchaseResponse {
    code: number;
    errorMessage?: string;
    errorDescription?: string;
    traceId?: string;
    errors?: Array<DigitalShopGeneralError>;
}
```
- code - код ответа.
- errorMessage - сообщение об ошибке для пользователя.
- errorDescription - расшифровка сообщения об ошибке.
- traceId - идентификатор ошибочного сообщения.
- errors - список ошибок.

Интерфейс ошибки `DigitalShopGeneralError` описан выше.

## Тестовые данные
[Ссылка](https://securepayments.sberbank.ru/wiki/doku.php/test_cards) на тестовые банковские карты.
