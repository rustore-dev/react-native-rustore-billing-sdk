import { NativeModules } from 'react-native';
import type {
  CancelledPayment,
  FailurePayment,
  Product,
  Purchase,
  SuccessPayment,
} from './types';

interface RustoreBillingModule {
  /**
   * Метод инициализации RuStore SDK для in-app платежей
   */
  init: (params: {
    /**
     * Идентификатор приложения из консоли разработчика RuStore (пример: https://console.rustore.ru/apps/111111)
     */
    consoleApplicationId: string;
    /**
     * Схема deeplink, необходимая для возврата в ваше приложение после оплаты через стороннее приложение (например, SberPay или СБП). SDK генерирует свой хост к данной схеме.
     */
    deeplinkScheme: string;
  }) => void;
  /**
   * Метод проверки доступности работы с платежами
   */
  checkPurchasesAvailability: () => Promise<Boolean | string>;
  /**
   * Метод получения списка продуктов
   */
  getProducts: (productIds: string[]) => Promise<Product[]>;
  /**
   * Метод получения списка покупок
   */
  getPurchases: () => Promise<Purchase[]>;
  /**
   * Метод получения информации о покупке
   */
  getPurchaseInfo: (purchaseId: string) => Promise<Purchase>;
  /**
   * Метод для покупки продукта
   */
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
  }) => Promise<SuccessPayment | CancelledPayment | FailurePayment>;
  /**
   * Метод потребления (подтверждения) покупки
   */
  confirmPurchase: (params: {
    /**
     * Идентификатор покупки
     */
    purchaseId: string;
    /**
     * Указанная разработчиком строка, содержащая дополнительную информацию о заказе (опционально)
     */
    developerPayload?: string;
  }) => Promise<Boolean>;
  /**
   * Метод для отмены покупки
   */
  deletePurchase: (purchaseId: string) => Promise<Boolean>;
}

/**
 * RuStore SDK для in-app платежей
 */
export default NativeModules.RustoreBilling as RustoreBillingModule;

export * from './types';
