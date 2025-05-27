import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Pressable,
  Modal,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addHabit } from '../services/habitServices';
import { addGoal } from '../services/goalServices';
import { Picker } from '@react-native-picker/picker';

type RootStackParamList = {
  Home: undefined;
   CreateHabit: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CreateHabit'>;

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

const CreateHabitScreen: React.FC<Props> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [goalName, setGoalName] = useState('');
  const [habitName, setHabitName] = useState('');
  const [period, setPeriod] = useState('30');
  const [habitType, setHabitType] = useState('everyday');

  const close = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const handleCreate = async () => {
    if (!habitName.trim() || !goalName.trim()) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }
    try {
      const newGoalId = Date.now().toString();
      await addHabit({
        id: Date.now().toString(),
        name: habitName.trim(),
        frequency: habitType as any,
        createdAt: new Date().toISOString(),
         goalId: newGoalId,

      });
      await addGoal({
        id: newGoalId,
        title: goalName.trim(),
        completed: 0,
        target: parseInt(period),
        frequency: habitType,
      });
      Alert.alert('Great!', 'Habit goal created.', [
        { text: 'OK', onPress: () => close() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save, try again.');
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Modal visible={modalVisible} transparent animationType="fade">

        <Pressable style={styles.overlay} onPress={close} />


        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Create New Habit Goal</Text>
            <TouchableOpacity onPress={close}>
              <Image source={require('../assets/blackClose.png')} style={styles.close}></Image>
            </TouchableOpacity>
          </View>


          <Text style={styles.label}>Your Goal</Text>
          <TextInput
            placeholder="e.g. Read 5 philosophy books"
            style={styles.input}
            value={goalName}
            onChangeText={setGoalName}
          />


          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            placeholder="e.g. Read 20 pages"
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
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


          <TouchableOpacity onPress={handleCreate} activeOpacity={0.9}>
            <LinearGradient
              colors={['#FFA450', '#FF5C00']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Create New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateHabitScreen;


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },


  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#CBCBCB',
  },


  card: {
    marginHorizontal: 22,
    marginTop: 150,
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
