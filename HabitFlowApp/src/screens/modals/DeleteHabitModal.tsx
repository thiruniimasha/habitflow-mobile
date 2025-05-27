import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { deleteHabit, getHabits } from '../../services/habitServices';
import { getGoals, saveGoals } from '../../services/goalServices';
import { Habit } from '../../types/Habit';

type RouteParams = {
  habitId: string;
};

const DeleteHabitModal = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }>>();
  const navigation = useNavigation();
  const habitId = route.params?.habitId;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabit();
  }, []);

  const loadHabit = async () => {
    try {
      const habits = await getHabits();
      const foundHabit = habits.find((h) => h.id === habitId);
      if (foundHabit) {
        setHabit(foundHabit);
      }
    } catch (error) {
      console.error('Error loading habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!habit) {
      Alert.alert('Error', 'Habit not found.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit.id);
              
              // Also delete the associated goal if it exists
              if (habit.goalId) {
                const goals = await getGoals();
                const updatedGoals = goals.filter(g => g.id !== habit.goalId);
                await saveGoals(updatedGoals);
              }

              Alert.alert('Success', 'Habit deleted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Could not delete habit. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Habit not found.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Text style={styles.title}>Delete Habit</Text>
        <Text style={styles.message}>
          Are you sure you want to delete "{habit.name}"?
        </Text>
        <Text style={styles.warning}>
          This action cannot be undone and will also delete the associated goal.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={handleDelete}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeleteHabitModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  warning: {
    fontSize: 14,
    color: '#FF5C00',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
  },
  cancelButtonText: {
    color: '#2F2F2F',
  },
  loadingText: {
    fontSize: 16,
    color: '#2F2F2F',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
  },
});