import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    testStorage();
  }, []);

  async function testStorage() {
    const logMessages = [];
    
    logMessages.push('🔍 TESTING SECURESTORE...');
    
    try {
      // Test 1: Try to read all auth keys
      logMessages.push('\n📖 Reading stored data:');
      
      const token = await SecureStore.getItemAsync('token');
      logMessages.push(`Token: ${token ? token.substring(0, 20) + '...' : 'NULL'}`);
      
      const userType = await SecureStore.getItemAsync('userType');
      logMessages.push(`UserType: ${userType || 'NULL'}`);
      
      const userData = await SecureStore.getItemAsync('userData');
      logMessages.push(`UserData: ${userData || 'NULL'}`);
      
      const rememberMe = await SecureStore.getItemAsync('rememberMe');
      logMessages.push(`RememberMe: ${rememberMe || 'NULL'}`);
      
      // Test 2: Try to write test data
      logMessages.push('\n✍️ Writing test data...');
      await SecureStore.setItemAsync('test_key', 'test_value');
      logMessages.push('✅ Write successful');
      
      // Test 3: Try to read test data
      const testValue = await SecureStore.getItemAsync('test_key');
      logMessages.push(`Read test: ${testValue}`);
      
      if (testValue === 'test_value') {
        logMessages.push('✅ SecureStore is WORKING!');
      } else {
        logMessages.push('❌ SecureStore read/write FAILED');
      }
      
      // Decision
      logMessages.push('\n🎯 DECISION:');
      if (token && userType) {
        logMessages.push('✅ Auth data found - should auto-login');
        logMessages.push(`Redirecting to: ${userType === 'recruiter' ? '/(recruiter-tabs)' : '/(tabs)'}`);
        
        setTimeout(() => {
          if (userType === 'recruiter') {
            router.replace('/(recruiter-tabs)');
          } else {
            router.replace('/(tabs)');
          }
        }, 3000);
      } else {
        logMessages.push('❌ No auth data - going to login');
        logMessages.push('This means login did NOT save the data!');
        
        setTimeout(() => {
          router.replace('/(auth)/login-type');
        }, 3000);
      }
      
    } catch (error) {
      logMessages.push(`❌ ERROR: ${error.message}`);
    }
    
    setLogs(logMessages);
    setChecking(false);
  }

  function goToLogin() {
    router.replace('/(auth)/login-type');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Storage Debug</Text>
      
      {checking && <ActivityIndicator size="large" color="#007AFF" />}
      
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.button} onPress={goToLogin}>
        <Text style={styles.buttonText}>GO TO LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});