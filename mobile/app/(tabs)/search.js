import { StyleSheet, Text, View } from 'react-native';

import { labelColorsLight, title2 } from '../../design-system';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={[title2.regular, styles.text]}>Search</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: labelColorsLight.primary,
  },
});
