import * as React from 'react';

import { StyleSheet, Text, View } from 'react-native';
import RustoreBillingClient from 'react-native-rustore-billing';

export default function App() {
  const [result, setResult] = React.useState<any>();

  React.useEffect(() => {
    RustoreBillingClient.initialize({
      consoleApplicationId: '183519',
      deeplinkScheme: 'test',
    });

    const asyncFunc = async () => {
      try {
        const s = await RustoreBillingClient.checkPurchasesAvailability();
        setResult(s);
      } catch (err) {
        setResult(JSON.stringify(err));
      }
    };
    asyncFunc();
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
