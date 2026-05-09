import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { CartScreen } from './src/screens/CartScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { POSScreen } from './src/screens/POSScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { UtangScreen } from './src/screens/UtangScreen';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  const { logout } = useApp();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerRight: () => (
            <Pressable style={styles.logoutButton} onPress={() => void logout()}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          ),
        }}
      >
        <Tab.Screen name="POS">{({ navigation }) => <POSScreen onViewCart={() => navigation.navigate('Cart')} />}</Tab.Screen>
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Inventory" component={InventoryScreen} />
        <Tab.Screen name="Utang" component={UtangScreen} />
        <Tab.Screen name="Today" component={TodayScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

const Root = () => {
  const { loading, user } = useApp();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Tabs />;
};

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoutButton: {
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutText: {
    fontWeight: '600',
  },
});
