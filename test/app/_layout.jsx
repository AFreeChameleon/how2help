import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Slot, Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="location" options={{ headerShown: false }} />
        </Stack>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
