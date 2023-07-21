// Работа с продуктами

export interface ProductsResponse {
  code: number;
  products?: Array<Product>;
  errors?: Array<DigitalShopGeneralError>;
  errorMessage?: string;
  errorDescription?: string;
  traceId?: string;
}

export interface DigitalShopGeneralError {
  name?: string;
  code?: number;
  description?: string;
}

export enum ProductType {}

export enum ProductStatus {}

export interface Product {
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

export interface ProductSubscription {
  subscriptionPeriod?: SubscriptionPeriod;
  freeTrialPeriod?: SubscriptionPeriod;
  gracePeriod?: SubscriptionPeriod;
  introductoryPrice?: string;
  introductoryPriceAmount?: string;
  introductoryPricePeriod?: SubscriptionPeriod;
}

export interface SubscriptionPeriod {
  years: number;
  months: number;
  days: number;
}

// Работа с покупками

export interface PurchasesResponse {
  code: number;
  errorMessage?: string;
  errorDescription?: string;
  traceId?: string;
  purchases?: Array<Purchase>;
  errors?: Array<DigitalShopGeneralError>;
}

export enum PurchaseState {
  CREATED = 'CREATED',
  INVOICE_CREATED = 'INVOICE_CREATED',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  CONSUMED = 'CONSUMED',
  CLOSED = 'CLOSED',
}

export interface Purchase {
  purchaseId?: string;
  productId: string;
  productType?: ProductType;
  invoiceId?: string;
  description?: string;
  language?: string;
  purchaseTime?: Date;
  orderId?: string;
  amountLabel?: string;
  amount?: number;
  currency?: string;
  quantity?: number;
  purchaseState?: PurchaseState;
  developerPayload?: string;
  subscriptionToken?: string;
}

// Покупка продукта

export interface PaymentResult {
  successInvoice?: SuccessInvoice;
  invalidInvoice?: InvalidInvoice;
  successPurchase?: SuccessPurchase;
  invalidPurchase?: InvalidPurchase;
}

export enum PaymentFinishCode {
  SUCCESSFUL_PAYMENT = 'SUCCESSFUL_PAYMENT',
  CLOSED_BY_USER = 'CLOSED_BY_USER',
  UNHANDLED_FORM_ERROR = 'UNHANDLED_FORM_ERROR',
  PAYMENT_TIMEOUT = 'PAYMENT_TIMEOUT',
  DECLINED_BY_SERVER = 'DECLINED_BY_SERVER',
  RESULT_UNKNOWN = 'RESULT_UNKNOWN',
}

export interface SuccessInvoice {
  invoiceId: string;
  finishCode: PaymentFinishCode;
}

export interface InvalidInvoice {
  invoiceId?: string;
}

export interface SuccessPurchase {
  finishCode: PaymentFinishCode;
  orderId: string;
  purchaseId: string;
  productId: string;
  subscriptionToken?: string | null;
}

export interface InvalidPurchase {
  purchaseId?: string;
  invoiceId?: string;
  orderId?: string;
  quantity?: number;
  productId?: string;
  errorCode?: number;
}

// Потребление (подтверждение) покупки

export interface PurchaseResponse {
  code: number;
  errorMessage?: string;
  errorDescription?: string;
  traceId?: string;
  errors?: Array<DigitalShopGeneralError>;
}

export interface ConfirmPurchaseResponse extends PurchaseResponse {}

// Удаление покупки

export interface DeletePurchaseResponse extends PurchaseResponse {}

// Исключения

export interface RuStoreException {
  message: string;
}

export interface RuStoreNotInstalledException extends RuStoreException {}
export interface RuStoreOutdatedException extends RuStoreException {}
export interface RuStoreUserUnauthorizedException extends RuStoreException {}
export interface RuStoreApplicationBannedException extends RuStoreException {}
export interface RuStoreUserBannedException extends RuStoreException {}
