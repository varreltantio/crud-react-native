import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator,  DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Alert } from 'react-native';
import { logout } from './api/auth'; 

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import BarangListScreen from './screens/BarangListScreen';
import BarangFormScreen from './screens/BarangFormScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const handleLogout = async () => {
    await logout();
    props.navigation.replace('Login');
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={() => {
          Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin logout?', [
            { text: 'Batal', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: handleLogout },
          ]);
        }}
        icon={({ color, size }) => (
          <Icon name="logout" color="red" size={size} />
        )}
        labelStyle={{ color: 'red' }}
      />
    </DrawerContentScrollView>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#6200ee',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Profil',
          drawerIcon: ({ color, size }) => (
            <Icon name="account-circle" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Barang"
        component={BarangListScreen}
        options={{
          title: 'Barang',
          drawerIcon: ({ color, size }) => (
            <Icon name="cube-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          
          {/* App Screens with Sidebar */}
          <Stack.Screen name="MainApp" component={AppDrawer} />

          <Stack.Screen name="BarangForm" component={BarangFormScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
