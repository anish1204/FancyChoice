import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { PlansScreen } from '../screens/customer/PlansScreen';
import { SubscriptionScreen } from '../screens/customer/SubscriptionScreen';
import { TrackingScreen } from '../screens/customer/TrackingScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';
import { TodayOrdersScreen } from '../screens/delivery/TodayOrdersScreen';
import { OrderHistoryScreen } from '../screens/delivery/OrderHistoryScreen';
import { RatingsScreen } from '../screens/delivery/RatingsScreen';
import { DashboardScreen } from '../screens/admin/DashboardScreen';
import { OrdersScreen } from '../screens/admin/OrdersScreen';
import { UsersScreen } from '../screens/admin/UsersScreen';
import { QRScannerScreen } from '../screens/delivery/QRScannerScreen';
import { CheckoutScreen } from '../screens/customer/CheckoutScreen';
import { PaymentSuccessScreen } from '../screens/customer/PaymentSuccessScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomerTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Plans" component={PlansScreen} />
    <Tab.Screen name="Subscription" component={SubscriptionScreen} />
    <Tab.Screen name="Tracking" component={TrackingScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const DeliveryTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Today" component={TodayOrdersScreen} />
    <Tab.Screen name="History" component={OrderHistoryScreen} />
    <Tab.Screen name="Ratings" component={RatingsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Users" component={UsersScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const TabsForRole = ({ role }) => {
  if (role === 'deliveryBoy') return <DeliveryTabs />;
  if (role === 'admin') return <AdminTabs />;
  return <CustomerTabs />;
};

export const RootNavigator = () => {
  const { token, user, restore } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restore().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Main">
              {() => <TabsForRole role={user?.role} />}
            </Stack.Screen>
            <Stack.Screen name="Scanner" component={QRScannerScreen} options={{ headerShown: true, title: 'Scan QR' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout' }} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OTPVerificationScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
