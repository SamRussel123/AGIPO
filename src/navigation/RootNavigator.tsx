import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
// 1. Import DefaultTheme
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { TabNavigator } from './TabNavigator'; 
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';

const Stack = createNativeStackNavigator();

// 2. Define the Dark Pokedex Theme
const PokedexTheme = {
  ...DefaultTheme, // Keep standard behavior for things we don't change
  colors: {
    ...DefaultTheme.colors,
    background: '#373737', // <--- THIS SETS THE GLOBAL BACKGROUND
    card: '#373737',       // Matches headers and tab bars to background
    text: '#ffffff',       // Default text becomes white
    border: '#555555',     // Makes divider lines subtle
  },
};

// 3. Updated Loading Screen to match the Dark Theme
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#e63946" />
    <Text style={styles.loadingText}>Loading PokeExplorer...</Text>
  </View>
);

export const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; 
  }, []);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    // 4. Pass the custom theme here
    <NavigationContainer theme={PokedexTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Group>
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen name="PokemonDetailScreen" component={PokemonDetailScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#373737', // Updated to match global theme
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
    color: '#ffffff', // Updated to white so it's visible
  },
});