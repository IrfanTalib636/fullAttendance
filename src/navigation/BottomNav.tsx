import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Home, Settings } from "../screens";
import { COLORS, SCREENS } from "../enums";
import { History } from "../screens/History";
import { AnyIcon, IconType } from "../components";
import { AppDataContext } from "../context/AppDataContext";

const Tab = createBottomTabNavigator();

export const BottomNav = () => {
  const {appLang}=useContext(AppDataContext);
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName:any;

          if (route.name === SCREENS.HOME) {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === SCREENS.HISTORY) {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === SCREENS.SETTINGS) {
            iconName = focused ? "settings" : "settings-outline";
          }
          
          return <AnyIcon
          type={IconType.Ionicons}
          name={iconName}
          size={size}
          color={color}
          />
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name={SCREENS.HOME} component={Home} options={{ tabBarLabel: appLang.homeTab }}/>
      <Tab.Screen name={SCREENS.HISTORY} component={History} options={{ tabBarLabel: appLang.historyTab }}/>
      <Tab.Screen name={SCREENS.SETTINGS} component={Settings} options={{ tabBarLabel: appLang.settingsTab }}/>
    </Tab.Navigator>
  );
};
