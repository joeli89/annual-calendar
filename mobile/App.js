import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from './design-system';

export default function App() {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.palette.screen }]}>
      <Text style={{ color: theme.labelColors.primary }}>
        Open up App.js to start working on your app!
      </Text>
      <StatusBar style={theme.statusBarStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
