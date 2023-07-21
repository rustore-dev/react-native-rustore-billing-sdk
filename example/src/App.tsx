import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import RustoreBillingClient from 'react-native-rustore-billing';

export default function App() {
  const [result, setResult] = React.useState<any>();

  React.useEffect(() => {
    RustoreBillingClient.initialize({
      consoleApplicationId: 'test',
      deeplinkScheme: 'test',
    });
    const asd = async () => {
      try {
        const s = await RustoreBillingClient.checkPurchasesAvailability();
        setResult(s);
      } catch (err) {
        setResult(JSON.stringify(err));
      }
    };
    asd();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
