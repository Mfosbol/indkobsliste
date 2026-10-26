import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ShoppingProvider } from './context/ShoppingContext';
import ListScreen from './screens/ListScreen';
import AddScreen from './screens/AddScreen';
import FrequentScreen from './screens/FrequentScreen';
import ScannerScreen from './screens/ScannerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ShoppingProvider>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Liste"
            screenOptions={({ route }) => ({
              headerStyle: {
                backgroundColor: '#2E7D4F',
              },
              headerTitleStyle: {
                fontSize: 20,
                fontWeight: '700',
                color: '#FFFFFF',
              },
              headerTintColor: '#FFFFFF',
              tabBarStyle: {
                backgroundColor: '#2E7D4F',
                borderTopWidth: 0,
              },
              tabBarActiveTintColor: '#FFFFFF',
              tabBarInactiveTintColor: '#A8D5BC',
              tabBarIcon: ({ focused, color, size }) => {
                let iconName = 'list';

                if (route.name === 'Liste') {
                  iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'Tilføj') {
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                } else if (route.name === 'Ofte købt') {
                  iconName = focused ? 'time' : 'time-outline';
                } else if (route.name === 'Scan') {
                  iconName = focused ? 'barcode' : 'barcode-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Liste" component={ListScreen} />
            <Tab.Screen name="Tilføj" component={AddScreen} />
            <Tab.Screen name="Scan" component={ScannerScreen} />
            <Tab.Screen name="Ofte købt" component={FrequentScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </ShoppingProvider>
    </GestureHandlerRootView>
  );
}
