import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen.tsx';
import HomeScreen from '../screens/HomeScreen.tsx';
import CreateHabitScreen from '../screens/CreateHabitScreen.tsx';
import ProgressScreen from '../screens/ProgressScreen.tsx';
import SettingsScreen from '../screens/SettingsScreen.tsx';
import EditHabitModal from '../screens/modals/EditHabitModal.tsx';
import DeleteHabitModal from '../screens/modals/DeleteHabitModal.tsx';


type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateHabit: undefined;
  Progress: undefined;
  Settings: undefined;
  EditHabit: { habitId: string };
  DeleteHabit: { habitId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateHabit" component={CreateHabitScreen} />
        
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen 
          name="EditHabit" 
          component={EditHabitModal}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Edit Habit',
          }}
        />

        <Stack.Screen 
          name="DeleteHabit" 
          component={DeleteHabitModal}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
