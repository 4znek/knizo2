import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SetupProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate account setup
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/knizo-symbol-only.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Creating your Knizo account...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 