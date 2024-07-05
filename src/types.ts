// Работа с продуктами

export enum ProductType {
  NON_CONSUMABLE = 'NON_CONSUMABLE',
  CONSUMABLE = 'CONSUMABLE',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

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

export enum PurchaseState {
  CREATED = 'CREATED',
  INVOICE_CREATED = 'INVOICE_CREATED',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  CONSUMED = 'CONSUMED',
  PAUSED = 'PAUSED',
  TERMINATED = 'TERMINATED',
}

export interface Purchase {
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

// Покупка продукта

export enum PaymentResult {
  SUCCESS = 'SUCCESS',
  CANCELLED = 'CANCELLED',
  FAILURE = 'FAILURE',
}

export interface SuccessPaymentResult {
  orderId?: string;
  purchaseId: string;
  productId: string;
  invoiceId: string;
  sandbox: boolean;
  subscriptionToken?: string;
}

export interface SuccessPayment {
  type: PaymentResult.SUCCESS;
  response: SuccessPaymentResult;
}

export interface CancelledPaymentResult {
  purchaseId: string;
  sandbox: boolean;
}

export interface CancelledPayment {
  type: PaymentResult.CANCELLED;
  response: CancelledPaymentResult;
}

export interface FailurePaymentResult {
  purchaseId?: string;
  invoiceId?: string;
  orderId?: string;
  quantity?: number;
  productId?: string;
  errorCode?: number;
  sandbox: boolean;
}

export interface FailurePayment {
  type: PaymentResult.FAILURE;
  response: FailurePaymentResult;
}
