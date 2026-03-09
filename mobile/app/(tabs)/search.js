import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { title2, useAppTheme } from '../../design-system';

export default function SearchScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={[title2.regular, styles.text]}>Search</Text>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.palette.screen,
    },
    text: {
      color: theme.labelColors.primary,
    },
  });
}
