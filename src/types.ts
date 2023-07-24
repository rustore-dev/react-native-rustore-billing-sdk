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
  CLOSED = 'CLOSED',
  TERMINATED = 'TERMINATED',
}

export interface Purchase {
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

// Покупка продукта

export enum PaymentResultType {
  SUCCESS = 'SUCCESS',
  CANCELLED = 'CANCELLED',
  FAILURE = 'FAILURE',
}

export interface SuccessPaymentResult {
  orderId: string;
  purchaseId: string;
  productId: string;
  invoiceId: string;
  subscriptionToken?: string;
}

export interface SuccessPayment {
  type: PaymentResultType.SUCCESS;
  result: SuccessPaymentResult;
}

export interface CancelledPaymentResult {
  purchaseId: string;
}

export interface CancelledPayment {
  type: PaymentResultType.CANCELLED;
  result: CancelledPaymentResult;
}

export interface FailurePaymentResult {
  purchaseId: string;
  invoiceId: string;
  orderId: string;
  quantity: number;
  productId: string;
  errorCode: number;
}

export interface FailurePayment {
  type: PaymentResultType.FAILURE;
  result: FailurePaymentResult;
}
