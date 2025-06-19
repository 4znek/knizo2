import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/knizo-symbol-only.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(auth)/school-select')}
      >
        <Text style={styles.buttonText}>Find your campus</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '20%',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 