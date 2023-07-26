import React, { useEffect, useState } from 'react';

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
  PaymentResult,
  Product,
  PurchaseState,
} from 'react-native-rustore-billing';

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [isAvailable, setAvailable] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLoading(true);
    RustoreBillingClient.init({
      consoleApplicationId: '183519',
      deeplinkScheme: 'reactnativesdkscheme',
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
      } catch (err) {
        setError(JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };
    checkAvailability();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (isAvailable) {
        try {
          const availableProducts = ['productId1', 'productId2', 'productId3'];
          const products = await RustoreBillingClient.getProducts(
            availableProducts
          );

          const purchases = await RustoreBillingClient.getPurchases();
          for (const purchase of purchases) {
            switch (purchase.purchaseState) {
              case PurchaseState.CREATED:
              case PurchaseState.INVOICE_CREATED: {
                if (purchase.purchaseId) {
                  await deletePurchase(purchase.purchaseId);
                }
                break;
              }
              case PurchaseState.PAID: {
                if (purchase.purchaseId) {
                  await confirmPurchase(purchase.purchaseId);
                }
                break;
              }
            }
          }

          setProducts(products);
        } catch (err) {
          setError(JSON.stringify(err));
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProducts();
  }, [isAvailable]);

  const handlePurchase = (product: Product) => async () => {
    try {
      setLoading(true);
      const payment = await RustoreBillingClient.purchaseProduct({
        productId: product.productId,
      });
      switch (payment.type) {
        case PaymentResult.SUCCESS: {
          await confirmPurchase(payment.result.purchaseId);
          break;
        }
        case PaymentResult.CANCELLED:
        case PaymentResult.FAILURE: {
          await deletePurchase(payment.result?.purchaseId ?? '');
          break;
        }
      }
    } catch (err: any) {
      setError(JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const confirmPurchase = async (purchaseId: string) => {
    await RustoreBillingClient.confirmPurchase({
      purchaseId,
    });
    ToastAndroid.show(`Покупка ${purchaseId} подтверждена`, ToastAndroid.LONG);
  };

  const deletePurchase = async (purchaseId: string) => {
    await RustoreBillingClient.deletePurchase(purchaseId);
    ToastAndroid.show(`Покупка ${purchaseId} отменена`, ToastAndroid.LONG);
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
      {products.map((product) => (
        <TouchableOpacity
          key={product.productId}
          style={styles.item}
          onPress={handlePurchase(product)}
        >
          <Text style={styles.itemTitle}>
            {product.productId} - {product.title}
          </Text>
          <Text>{product.description}</Text>
        </TouchableOpacity>
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
