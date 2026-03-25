import * as React from 'react';
import { View, Text, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { CartProvider, useCart } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FoodDetailScreen from './src/screens/FoodDetailScreen';

// New Screens
import CompleteProfileScreen from './src/screens/CompleteProfileScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PRIMARY = '#e23744';

// ── Stacks ──
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
}

function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuMain" component={MenuScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Tab icons ──
function TabIcon({ name, focused }) {
  return <Ionicons name={focused ? name : `${name}-outline`} size={22} color={focused ? PRIMARY : '#bbb'} />;
}

function CartIcon({ focused }) {
  const { cartCount } = useCart();
  return (
    <View>
      <Ionicons name={focused ? 'bag' : 'bag-outline'} size={22} color={focused ? PRIMARY : '#bbb'} />
      {cartCount > 0 && (
        <View style={{ position:'absolute', top:-4, right:-8, backgroundColor:PRIMARY, borderRadius:8, minWidth:16, height:16, alignItems:'center', justifyContent:'center', paddingHorizontal:3 }}>
          <Text style={{ color:'#fff', fontSize:9, fontWeight:'800' }}>{cartCount}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Tabs ──
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: PRIMARY,
      tabBarInactiveTintColor: '#bbb',
      tabBarStyle: {
        backgroundColor: '#fff', borderTopColor: '#f0f0f0', borderTopWidth: 0.5,
        height: Platform.OS === 'ios' ? 84 : 60,
        paddingBottom: Platform.OS === 'ios' ? 24 : 6, paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    }}>
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: ({focused}) => <TabIcon name="home" focused={focused} /> }} />
      <Tab.Screen name="Menu" component={MenuStack} options={{ tabBarIcon: ({focused}) => <TabIcon name="restaurant" focused={focused} /> }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: ({focused}) => <CartIcon focused={focused} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({focused}) => <TabIcon name="person" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

// ── Main App Stack (Protected) ──
function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

// ── Auth Gate — decides between Login or MainAppStack ──
function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainApp" component={MainAppStack} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── Root App ──
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="AuthGate" component={AuthGate} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
