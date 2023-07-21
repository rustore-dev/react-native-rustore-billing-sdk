import { NativeModules } from 'react-native';
import type {
  PaymentResult,
  Product,
  InvalidPurchase,
  Purchase,
  ConfirmPurchaseResponse,
  DeletePurchaseResponse,
} from './types';

interface RustoreBillingModule {
  /**
   * Метод инициализации RuStore SDK для in-app платежей
   */
  initialize: (params: {
    /**
     * Идентификатор приложения из консоли разработчика RuStore (пример: https://console.rustore.ru/apps/111111)
     */
    consoleApplicationId: string;
    /**
     * Схема deeplink, необходимая для возврата в ваше приложение после оплаты через стороннее приложение (например, SberPay или СБП). SDK генерирует свой хост к данной схеме.
     */
    deeplinkScheme?: string;
  }) => void;
  checkPurchasesAvailability: () => Promise<Boolean | string>;
  getProducts: (productIds: string[]) => Promise<Product[]>;
  getPurchases: () => Promise<Purchase[]>;
  getPurchaseInfo: (purchaseId: string) => Promise<Purchase>;
  purchaseProduct: (params: {
    /**
     * Идентификатор продукта
     */
    productId: string;
    /**
     * Идентификатор заказа, создаётся на стороне AnyApp (опционально. Если не указан, то генерируется автоматически)
     */
    orderId?: string;
    /**
     * Количество продуктов (опционально)
     */
    quantity?: number;
    /**
     * Дополнительная информация от разработчика AnyApp (опционально)
     */
    developerPayload?: string;
  }) => Promise<PaymentResult | InvalidPurchase>;
  confirmPurchase: (params: {
    /**
     * Идентификатор покупки
     */
    purchaseId: string;
    /**
     * Указанная разработчиком строка, содержащая дополнительную информацию о заказе (опционально)
     */
    developerPayload?: string;
  }) => Promise<ConfirmPurchaseResponse>;
  deletePurchase: (purchaseId: string) => Promise<DeletePurchaseResponse>;
}

/**
 * RuStore SDK для in-app платежей
 */
export default NativeModules.RustoreBilling as RustoreBillingModule;
