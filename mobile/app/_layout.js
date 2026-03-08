import { StatusBar } from 'expo-status-bar';

import { TabBar } from '../components/TabBar';

export default function RootLayout() {
  return (
    <>
      <TabBar />
      <StatusBar style="auto" />
    </>
  );
}
