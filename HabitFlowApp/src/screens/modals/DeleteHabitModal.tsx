import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Image } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { deleteHabit, getHabits } from '../../services/habitServices';
import { getGoals, saveGoals } from '../../services/goalServices';
import { Habit } from '../../types/Habit';
import { Icons } from '../../utils/Icon';
import LinearGradient from 'react-native-linear-gradient';


type RouteParams = {
  habitId: string;
};

const DeleteHabitModal = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }>>();
  const navigation = useNavigation();
  const habitId = route.params?.habitId;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    try {
      await deleteHabit(habit.id);

      if (habit.goalId) {
        const goals = await getGoals();
        const updatedGoals = goals.filter(g => g.id !== habit.goalId);
        await saveGoals(updatedGoals);
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting habit:', error);
      Alert.alert('Error', 'Could not delete habit. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
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

        <Image source={Icons.delete} style={styles.trash} />




        <Text style={styles.message}>
          Are you sure want to delete?
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleDelete} activeOpacity={0.9}>
                      <LinearGradient
                        colors={['#FFA450', '#FF5C00']}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.buttonText}> Delete </Text>
                      </LinearGradient>
                    </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.container}>

          <View style={styles.successModal}>
            <Image source={Icons.deleteSuccess} style={styles.trash} />
           
           

           
              

                
             

              <Text style={styles.successMessage}>
                List has been deleted
              </Text>

              

               <TouchableOpacity style= {styles.okButton} onPress={handleSuccessClose} activeOpacity={0.9}>
                      <LinearGradient
                        colors={['#FFA450', '#FF5C00']}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.okButtonText}> Ok </Text>
                      </LinearGradient>
                    </TouchableOpacity>
           
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeleteHabitModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    width: '100%',
    maxWidth: 328,
    alignItems: 'center',
  },
  
  trash: {
    width: 48,
    height: 48,
    marginBottom: 22,
  },

  message: {
    fontSize: 18,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 22,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  buttonContainer: {
    width: '100%',
    gap: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 4,
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FBFBFB',
  },
  
  cancelButtonText: {
    color: '#2F2F2F',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
  },
  
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    width: '100%',
    maxWidth: 330,
    alignItems: 'center',
    position: 'relative',
  },
 
  
  
  
  
  successMessage: {
    fontSize: 18,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 22,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  okButton: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 4,
   
    alignItems: 'center',
  },
  okButtonText: {
    color: '#FBFBFB',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Nunito',
  },
});