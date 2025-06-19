import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [netId, setNetId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Here you would typically make an API call to verify credentials
    // For now, we'll just navigate to the profile setup
    router.push('/(auth)/setup-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/knizo-symbol-only.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.form}>
          <Text style={styles.label}>NetID</Text>
          <TextInput
            style={styles.input}
            value={netId}
            onChangeText={setNetId}
            placeholder="Enter your NetID"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Linking.openURL('https://oit.duke.edu/help')}
          >
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!netId || !password) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!netId || !password}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          For assistance, please visit{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://oit.duke.edu/help')}
          >
            oit.duke.edu/help
          </Text>
        </Text>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 120,
    height: 120,
    marginTop: 40,
  },
  form: {
    width: '100%',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
}); 