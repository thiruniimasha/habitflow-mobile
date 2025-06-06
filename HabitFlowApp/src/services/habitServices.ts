import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/Habit.ts';
import { getUser } from './storage';

const getUserSpecificKey = async (dataType: string): Promise<string> => {
  const user = await getUser();
  if (!user) throw new Error('No user logged in');
  return `user_${user.email}_${dataType}`;
};

type CompletedHabitsRecord = {
  [date: string]: string[];
};

/**
 * Get all habits 
 */
export const getHabits = async (): Promise<Habit[]> => {
  try {
    const key = await getUserSpecificKey('habits');
    const habitsJson = await AsyncStorage.getItem(key);
    return habitsJson ? JSON.parse(habitsJson) : [];
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

/**
 * Add new habit
 */
export const addHabit = async (habit: Habit): Promise<void> => {
  try {
    const habits = await getHabits();
    habits.push(habit);
    const key = await getUserSpecificKey('habits');
    await AsyncStorage.setItem(key, JSON.stringify(habits));
  } catch (error) {
    console.error('Error adding habit:', error);
    throw error;
  }
};

/**
 * Delete habit 
 */
export const deleteHabit = async (habitId: string): Promise<void> => {
  try {
    const habits = await getHabits();
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    const habitsKey = await getUserSpecificKey('habits');
    await AsyncStorage.setItem(habitsKey, JSON.stringify(updatedHabits));
    
   
    const completedHabits = await getCompletedHabits();
    for (const date in completedHabits) {
      completedHabits[date] = completedHabits[date].filter(id => id !== habitId);
    }
    const completedKey = await getUserSpecificKey('completedHabits');
    await AsyncStorage.setItem(completedKey, JSON.stringify(completedHabits));
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

/**
 * Update a habit 
 */
export const updateHabit = async (updatedHabit: Habit): Promise<void> => {
  try {
    const habits = await getHabits();
    const updatedHabits = habits.map(habit =>
      habit.id === updatedHabit.id ? updatedHabit : habit
    );
    const key = await getUserSpecificKey('habits');
    await AsyncStorage.setItem(key, JSON.stringify(updatedHabits));
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

/**
 * Get completed habits 
 */
export const getCompletedHabits = async (): Promise<CompletedHabitsRecord> => {
  try {
    const key = await getUserSpecificKey('completedHabits');
    const completedJson = await AsyncStorage.getItem(key);
    return completedJson ? JSON.parse(completedJson) : {};
  } catch (error) {
    console.error('Error getting completed habits:', error);
    return {};
  }
};

/**
 * Mark as completed 
 */
export const markHabitAsCompleted = async (habitId: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0]; 
    const completedHabits = await getCompletedHabits();
    
    if (!completedHabits[today]) {
      completedHabits[today] = [];
    }
    
    if (!completedHabits[today].includes(habitId)) {
      completedHabits[today].push(habitId);
      const key = await getUserSpecificKey('completedHabits');
      await AsyncStorage.setItem(key, JSON.stringify(completedHabits));
    }
  } catch (error) {
    console.error('Error marking habit as completed:', error);
    throw error;
  }
};

export const getTodayCompletedHabits = async (): Promise<string[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const completedHabits = await getCompletedHabits();
    return completedHabits[today] || [];
  } catch (error) {
    console.error('Error getting today completed habits:', error);
    return [];
  }
};

export const getHabitStats = async (period: 'day' | 'week' | 'month') => {
  try {
    const habits = await getHabits();
    const completedHabits = await getCompletedHabits();
    
    const dailyHabits = habits.filter(h => h.frequency === 'daily');
    const weeklyHabits = habits.filter(h => h.frequency === 'weekly');
    
    const today = new Date();
    const dates: string[] = [];
    
    if (period === 'day') {
      dates.push(today.toISOString().split('T')[0]);
    } else if (period === 'week') {
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
    } else if (period === 'month') {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    let totalHabits = 0;
    if (period === 'day') {
      totalHabits = dailyHabits.length;
    } else if (period === 'week') {
      totalHabits = dailyHabits.length * 7 + weeklyHabits.length;
    } else if (period === 'month') {
      totalHabits = dailyHabits.length * 30 + weeklyHabits.length * 4;
    }
    
    let habitsCompleted = 0;
    
    dates.forEach(date => {
      const completedForDate = completedHabits[date] || [];
      
      dailyHabits.forEach(habit => {
        if (completedForDate.includes(habit.id)) {
          habitsCompleted++;
        }
      });
      
      if (period !== 'day') {
        const weekDay = new Date(date).getDay(); 
        if (weekDay === 0) { 
          weeklyHabits.forEach(habit => {
            if (completedForDate.includes(habit.id)) {
              habitsCompleted++;
            }
          });
        }
      }
    });
    
    
    const streaks: { [key: string]: number } = {};

    habits.forEach(habit => {
      let streak = 0;
      let dayCount = 0;

      while (dayCount < 30) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - dayCount);
        const dateStr = checkDate.toISOString().split('T')[0];
        const completedForDate = completedHabits[dateStr] || [];

        if (habit.frequency === 'daily') {
          if (completedForDate.includes(habit.id)) {
            streak++;
          } else {
            break;
          }
          dayCount++;
        } else if (habit.frequency === 'weekly') {
          const weekDay = checkDate.getDay(); // Sunday = 0
          if (weekDay === 0) {
            if (completedForDate.includes(habit.id)) {
              streak++;
            } else {
              break;
            }
          }
          dayCount++;
        }
      }

      streaks[habit.id] = streak;
    });
    
    return {
      habitsCompleted,
      totalHabits,
      streaks,
    };
  } catch (error) {
    console.error('Error calculating habit stats:', error);
    return {
      habitsCompleted: 0,
      totalHabits: 0,
      streaks: {},
    };
  }
};