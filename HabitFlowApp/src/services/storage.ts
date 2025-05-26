import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User.ts';

const USER_KEY = 'loggedUser';

export const saveUser = async (user: User) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const clearUser = async () => {
  await AsyncStorage.removeItem('user');
};
