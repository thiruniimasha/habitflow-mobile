import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '../types/Goal.ts';

const GOALS_KEY = 'user_goals';

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
    const json = await AsyncStorage.getItem(GOALS_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error reading goals from storage', e);
    return [];
  }
};

export const saveGoals = async (goals: Goal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals to storage', e);
  }
};
