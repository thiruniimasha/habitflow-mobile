import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User.ts';

const USER_KEY = 'loggedUser';
const REGISTERED_USERS_KEY = 'registeredUsers';

const getUserSpecificKey = (userId: string, dataType: string) => {
  return `user_${userId}_${dataType}`;
};

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
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
};


export const saveRegisteredUser = async (user: User) => {
  try {
    const existingUsers = await getRegisteredUsers();
    const userExists = existingUsers.some(u => u.email === user.email);
    
    if (userExists) {
      throw new Error('User already exists');
    }
    
    const updatedUsers = [...existingUsers, user];
    await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
  } catch (error) {
    console.error('Error saving registered user:', error);
    throw error;
  }
};

export const getRegisteredUsers = async (): Promise<User[]> => {
  try {
    const json = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error getting registered users:', error);
    return [];
  }
};

export const validateUserCredentials = async (email: string, password: string): Promise<User | null> => {
  try {
    const registeredUsers = await getRegisteredUsers();
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    return user || null;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return null;
  }
};


export const saveUserData = async (userId: string, dataType: string, data: any) => {
  try {
    const key = getUserSpecificKey(userId, dataType);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving user data for ${dataType}:`, error);
  }
};

export const getUserData = async (userId: string, dataType: string): Promise<any> => {
  try {
    const key = getUserSpecificKey(userId, dataType);
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error(`Error getting user data for ${dataType}:`, error);
    return null;
  }
};

export const clearUserData = async (userId: string, dataType: string) => {
  try {
    const key = getUserSpecificKey(userId, dataType);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing user data for ${dataType}:`, error);
  }
};

export const getUserDataKeys = async (userId: string): Promise<string[]> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.startsWith(`user_${userId}_`));
    return userKeys;
  } catch (error) {
    console.error('Error getting user data keys:', error);
    return [];
  }
};

export const clearAllUserData = async (userId: string) => {
  try {
    const userKeys = await getUserDataKeys(userId);
    await AsyncStorage.multiRemove(userKeys);
  } catch (error) {
    console.error('Error clearing all user data:', error);
  }
};

export const saveUserHabits = async (userId: string, habits: any[]) => {
  await saveUserData(userId, 'habits', habits);
};

export const getUserHabits = async (userId: string): Promise<any[]> => {
  const habits = await getUserData(userId, 'habits');
  return habits || [];
};

export const saveUserProgress = async (userId: string, progress: any) => {
  await saveUserData(userId, 'progress', progress);
};

export const getUserProgress = async (userId: string): Promise<any> => {
  return await getUserData(userId, 'progress');
};

export const saveUserSettings = async (userId: string, settings: any) => {
  await saveUserData(userId, 'settings', settings);
};

export const getUserSettings = async (userId: string): Promise<any> => {
  return await getUserData(userId, 'settings');
};