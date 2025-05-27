import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Pressable,
  Image,

} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { updateHabit, getHabits } from '../../services/habitServices';
import { getGoals, saveGoals } from '../../services/goalServices';
import { Habit } from '../../types/Habit';
import { Goal } from '../../types/Goal';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';

type RouteParams = {
  habitId: string;
};

const PERIOD_OPTIONS = [
  { label: '1 Week (7 Days)', value: '7' },
  { label: '1 Month (30 Days)', value: '30' },
  { label: '3 Months (90 Days)', value: '90' },
];

const HABIT_TYPES = [
  { label: 'Everyday', value: 'everyday' },
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Weekends', value: 'weekends' },
];

const EditHabitModal = () => {
  const [modalVisible, setModalVisible] = useState(true);
  const route = useRoute<RouteProp<{ params: RouteParams }>>();
  const navigation = useNavigation();
  const habitId = route.params?.habitId;
  const [period, setPeriod] = useState('30');
  const [habitType, setHabitType] = useState('everyday');

  const [habit, setHabit] = useState<Habit | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [habitName, setHabitName] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabitAndGoal();
  }, []);

  const loadHabitAndGoal = async () => {
    try {
      const habits = await getHabits();
      const goals = await getGoals();

      const foundHabit = habits.find((h) => h.id === habitId);
      if (foundHabit) {
        setHabit(foundHabit);
        setHabitName(foundHabit.name);

        if (foundHabit.goalId) {
          const foundGoal = goals.find((g) => g.id === foundHabit.goalId);
          if (foundGoal) {
            setGoal(foundGoal);
            setGoalTitle(foundGoal.title);
          }
        }
      }
    } catch (error) {
      console.error('Error loading habit and goal:', error);
      Alert.alert('Error', 'Could not load habit details.');
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const handleSave = async () => {
    if (!habitName.trim() || !goalTitle.trim()) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }

    if (!habit) {
      Alert.alert('Error', 'Habit not found.');
      return;
    }

    try {
      // Update habit
      const updatedHabit: Habit = {
        ...habit,
        name: habitName.trim(),
        updatedAt: new Date().toISOString(),
      };

      await updateHabit(updatedHabit);

      // Update goal 
      if (goal && habit.goalId) {
        const goals = await getGoals();
        const updatedGoals = goals.map(g =>
          g.id === habit.goalId
            ? { ...g, title: goalTitle.trim() }
            : g
        );
        await saveGoals(updatedGoals);
      }

      Alert.alert('Success', 'Habit updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Could not update habit. Please try again.');
    }
  };

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View >
        <Text>Habit not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Modal visible={modalVisible} transparent animationType="fade">

        <Pressable style={styles.overlay} onPress={close} />


        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Edit Habit Goal</Text>
            <TouchableOpacity onPress={close}>
              <Image source={require('../../assets/blackClose.png')} style={styles.close}></Image>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Your Goal</Text>
          <TextInput
            value={goalTitle}
            onChangeText={setGoalTitle}
            style={styles.input}
            placeholder="Enter goal title"
          />


          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            value={habitName}
            onChangeText={setHabitName}
            style={styles.input}
            placeholder="Enter habit name"
          />

          <Text style={styles.label}>Period</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={period}
              onValueChange={setPeriod}

            >
              {PERIOD_OPTIONS.map(o => (
                <Picker.Item key={o.value} label={o.label} value={o.value} />
              ))}
            </Picker>
          </View>


          <Text style={styles.label}>Habit Type</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={habitType}
              onValueChange={setHabitType}

            >
              {HABIT_TYPES.map(o => (
                <Picker.Item key={o.value} label={o.label} value={o.value} />
              ))}
            </Picker>
          </View>



          <TouchableOpacity onPress={handleSave} activeOpacity={0.9}>
            <LinearGradient
              colors={['#FFA450', '#FF5C00']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}> Update </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EditHabitModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent'
  },


  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D9D9D9',
  },


  card: {
    marginHorizontal: 23,
    marginTop: 118,
    backgroundColor: '#FCFCFF',
    borderRadius: 6,
    padding: 15,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  close: {
    width: 24,
    height: 24,

  },

  label: {
    fontSize: 14,
    color: '#2F2F2F',
    fontFamily: 'Nunito',
    fontWeight: '600',
    marginBottom: 8,


  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Nunito',
    height: 55,
    marginBottom: 22,
  },

  pickerWrap: {

    height: 55,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#E7E7E7',
    paddingHorizontal: 11,
    marginBottom: 22,

  },

  button: {
    justifyContent: 'center',
    borderRadius: 4,
    alignItems: 'center',
    height: 49
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Nunito',

  },
});
