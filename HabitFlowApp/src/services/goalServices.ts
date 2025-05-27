import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '../types/Goal';
import { getUser } from './storage';

const getUserSpecificKey = async (dataType: string): Promise<string> => {
  const user = await getUser();
  if (!user) throw new Error('No user logged in');
  return `user_${user.email}_${dataType}`;
};

export const addGoal = async (goal: Goal): Promise<void> => {
  try {
    const goals = await getGoals();
    goals.push(goal);
    await saveGoals(goals);
  } catch (e) {
    console.error('Error adding goal', e);
  }
};

export const getGoals = async (): Promise<Goal[]> => {
  try {
    const key = await getUserSpecificKey('goals');
    const json = await AsyncStorage.getItem(key);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error reading goals from storage', e);
    return [];
  }
};

export const saveGoals = async (goals: Goal[]): Promise<void> => {
  try {
    const key = await getUserSpecificKey('goals');
    await AsyncStorage.setItem(key, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals to storage', e);
  }
};