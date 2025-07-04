import { useAppSelector } from '@/store/hooks';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const ReduxDebugger: React.FC = () => {
  const authState = useAppSelector((state) => state.auth);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redux State Debugger</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication State:</Text>
          <Text style={styles.text}>isAuthenticated: {authState.isAuthenticated.toString()}</Text>
          <Text style={styles.text}>isLoading: {authState.isLoading.toString()}</Text>
          <Text style={styles.text}>hasToken: {authState.token ? 'Yes' : 'No'}</Text>
          <Text style={styles.text}>hasUser: {authState.user ? 'Yes' : 'No'}</Text>
          {authState.error && (
            <Text style={styles.error}>Error: {authState.error}</Text>
          )}
        </View>
        
        {authState.token && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Token (first 20 chars):</Text>
            <Text style={styles.token}>{authState.token.substring(0, 20)}...</Text>
          </View>
        )}
        
        {authState.user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Data:</Text>
            <Text style={styles.text}>{JSON.stringify(authState.user, null, 2)}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 14,
    marginBottom: 2,
    color: '#666',
  },
  token: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 3,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginTop: 5,
  },
});

export default ReduxDebugger; 