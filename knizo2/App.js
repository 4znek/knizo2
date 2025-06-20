import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

// This tells Expo Snack and Expo Go to use the file-based router
const App = () => <ExpoRoot />;

registerRootComponent(App); 