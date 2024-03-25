import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import RustoreBillingClient, {
  CancelledPayment,
  FailurePayment,
  PaymentResult,
  Product,
  Purchase,
  PurchaseState,
  SuccessPayment,
} from 'react-native-rustore-billing';

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [isAvailable, setAvailable] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payment, setPayment] = useState<
    SuccessPayment | CancelledPayment | FailurePayment
  >();

  useEffect(() => {
    setLoading(true);
    RustoreBillingClient.init({
      consoleApplicationId: '183519',
      deeplinkScheme: 'yourappscheme://iamback',
    });

    const checkAvailability = async () => {
      try {
        const response =
          await RustoreBillingClient.checkPurchasesAvailability();
        if (typeof response === 'boolean') {
          setAvailable(response);
        } else {
          setAvailable(false);
          setError(response as string);
        }
      } catch (err: any) {
        setError(JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };
    checkAvailability();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const availableProducts = [
        'SDK_sampleRN_con_280223_1',
        'SDK_sampleRN_con_280223_2',
        'SDK_sampleRN_non_con_280223_1',
        'SDK_sampleRN_non_con_280223_2',
        'SDK_sampleRN_sub_280223_2',
        'SDK_sampleRN_sub_280223_1',
      ];
      const products = await RustoreBillingClient.getProducts(
        availableProducts
      );

      setProducts(products);
    } catch (err: any) {
      setError(JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const purchases = await RustoreBillingClient.getPurchases();
      setPurchases(purchases);
    } catch (err: any) {
      setError(JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAvailable) {
      Promise.all([fetchProducts(), fetchPurchases()]);
    }
  }, [fetchProducts, fetchPurchases, isAvailable]);

  const handlePurchase = async (productId: string) => {
    setLoading(true);
    try {
      const paymentResult = await RustoreBillingClient.purchaseProduct({
        productId,
      });
      setPayment(paymentResult);

    } catch (err: any) {
      setError(JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const confirmPurchase = async (purchaseId: string) => {
    try {
      await RustoreBillingClient.confirmPurchase({ purchaseId });
      ToastAndroid.show(
        `Подтверждение покупки: ${purchaseId}`,
        ToastAndroid.LONG
      );
    } catch (err: any) {
      setError(JSON.stringify(err));
    }
  };

  const deletePurchase = async (purchaseId: string) => {
    try {
      await RustoreBillingClient.deletePurchase(purchaseId);
      ToastAndroid.show(`Отменена покупки: ${purchaseId}`, ToastAndroid.LONG);
    } catch (err: any) {
      setError(JSON.stringify(err));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <Text>Биллинг недоступен!</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <TouchableOpacity onPress={() => fetchProducts()}>
        <Text style={{ fontWeight: 'bold' }}>Reload products</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => fetchPurchases()}>
        <Text style={{ fontWeight: 'bold' }}>Reload purchases</Text>
      </TouchableOpacity>
      <Text>Payment</Text>
      {payment?.type === PaymentResult.SUCCESS && (
        <Text>
          (SUCCESS) Invoice: ${payment?.response?.invoiceId ?? '0'} | Purchase:
          ${payment?.response?.purchaseId ?? '0'}
        </Text>
      )}
      {payment?.type === PaymentResult.CANCELLED && (
        <Text>
          (CANCELLED) Purchase: ${payment?.response?.purchaseId ?? '0'}
        </Text>
      )}
      {payment?.type === PaymentResult.FAILURE && (
        <Text>
          (FAILURE) Invoice: ${payment?.response?.invoiceId ?? '0'} | Purchase:
          ${payment?.response?.purchaseId ?? '0'}
        </Text>
      )}
      <Text>Products</Text>
      {products.map((product) => (
        <View key={product.productId} style={styles.item}>
          <Text style={styles.itemTitle}>
            {product.productId} - {product.title}
          </Text>
          <Text>
            {product.priceLabel} {product.description}
          </Text>
          <TouchableOpacity onPress={() => handlePurchase(product.productId)}>
            <Text style={{ fontWeight: 'bold' }}>Buy</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text>Purchases</Text>
      {purchases.map((purchase) => (
        <View key={purchase.purchaseId} style={styles.item}>
          <Text style={styles.itemTitle}>{purchase.purchaseId}</Text>
          <Text>
            {purchase.purchaseState} - {purchase.description}
          </Text>
          {purchase.purchaseState === PurchaseState.PAID && (
            <TouchableOpacity
              onPress={() => confirmPurchase(purchase?.purchaseId ?? '')}
            >
              <Text style={{ fontWeight: 'bold' }}>Confirm</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => deletePurchase(purchase?.purchaseId ?? '')}
          >
            <Text style={{ fontWeight: 'bold' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 16,
  },
  itemTitle: {
    color: '#000',
    fontWeight: '500',
  },
});
