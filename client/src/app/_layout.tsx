import React from 'react'

import {  Stack } from 'expo-router'

const MainLayout = () => {
  return (
    <Stack>
    <Stack.Screen name='index' options={{ headerShown: false }} />
    <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    <Stack.Screen name='(authenticate)' options={{ headerShown: false }} />
    <Stack.Screen name='(publisher)' options={{ headerShown: false }} />
    <Stack.Screen name='(onboarding)' options={{
       headerShown: false }} />
  </Stack>
  )
}

export default MainLayout