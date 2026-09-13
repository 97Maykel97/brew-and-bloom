import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import SessionGuard from '@/components/auth/SessionGuard';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <SessionGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />
    </>
  );
}
