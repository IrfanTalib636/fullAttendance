import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AttendanceDetails, Home, Location, Login } from '../screens';
import { COLORS, SCREENS, STACK } from '../enums';
import { BottomNav } from './BottomNav';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe(); // cleanup
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.PRIMARY} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name={STACK.BOTTOM_NAV} component={BottomNav} />
            {/* <Stack.Screen name={SCREENS.HOME} component={Home} /> */}
            <Stack.Screen name={SCREENS.ATTENDANCE_DETAILS} component={AttendanceDetails} />
            <Stack.Screen name={SCREENS.LOCATION} component={Location} />
          </>
        ) : (
          <Stack.Screen name={SCREENS.LOGIN} component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
