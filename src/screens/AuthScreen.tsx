import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { login, signup } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      Alert.alert('Authentication Failed', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sari-Sari POS</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.primaryButton} onPress={submit}>
        <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
      </Pressable>
      <Pressable style={styles.linkButton} onPress={() => setIsSignup((v) => !v)}>
        <Text>{isSignup ? 'Already have an account? Login' : 'No account? Create one'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    alignItems: 'center',
    padding: 14,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  linkButton: { marginTop: 12, alignItems: 'center' },
});
