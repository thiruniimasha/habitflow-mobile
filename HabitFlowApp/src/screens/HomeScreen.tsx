import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getUser } from '../services/storage';
import {
  getHabits,
  markHabitAsCompleted,
  getTodayCompletedHabits,
  getCompletedHabits
} from '../services/habitServices';
import { getGoals } from '../services/goalServices';
import { Habit } from '../types/Habit';
import { Goal } from '../types/Goal';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native';
import { Icons } from '../utils/Icon';
import { deleteHabit } from '../services/habitServices';
import { saveGoals } from '../services/goalServices';


type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateHabit: undefined;
  Progress: undefined;
  Settings: undefined;
  AllHabits: undefined;
  AllGoals: undefined;
};

type GoalProps = {
  title: string;
  completed: number;
  target: number;
  frequency: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [userName, setUserName] = useState('Susy');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>(['1', '2']);
  const [completionRate, setCompletionRate] = useState(70);
  const [showAllHabits, setShowAllHabits] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    loadUserData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadHabits();
      loadGoals();
    });
    return unsubscribe;
  }, [navigation]);

  const loadGoals = async () => {
    try {
      const goalsData = await getGoals();
      setGoals(goalsData);
    } catch (error) {
      console.log('Error loading goals:', error);
    }
  };

  useEffect(() => {
    calculateCompletionRate();
  }, [habits, completedToday]);

  const loadUserData = async () => {
    try {
      const user = await getUser();
      if (user) {
        setUserName(user.name);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadHabits = async () => {
    try {
      const habitsData = await getHabits();
      if (habitsData && habitsData.length > 0) {
        setHabits(habitsData);
      }

      const completed = await getTodayCompletedHabits();
      if (completed) {
        setCompletedToday(completed);
      }
    } catch (error) {
      console.log('Error loading habits:', error);
    }
  };

  const calculateCompletionRate = () => {
    if (habits.length === 0) return setCompletionRate(0);
    const completedCount = completedToday.length;
    const rate = Math.round((completedCount / habits.length) * 100);
    setCompletionRate(rate);
  };

  const handleMarkCompleted = async (habitId: string) => {
  try {
    await markHabitAsCompleted(habitId);
    const completed = await getTodayCompletedHabits();
    setCompletedToday(completed || []);

    // Find the completed habit and update its associated goal
    const completedHabit = habits.find(h => h.id === habitId);
    if (completedHabit?.goalId) {
      // Calculate the actual progress for this goal
      const goalToUpdate = goals.find(g => g.id === completedHabit.goalId);
      if (goalToUpdate) {
        // Get all completed habits for this goal across all days
        const completedHabits = await getCompletedHabits();
        const habitCompletionDates = new Set<string>();
        
        // Count unique days when this habit was completed
        Object.keys(completedHabits).forEach(date => {
          if (completedHabits[date].includes(habitId)) {
            habitCompletionDates.add(date);
          }
        });

        const updatedGoals = goals.map(goal => {
          if (goal.id === completedHabit.goalId) {
            return { 
              ...goal, 
              completed: Math.min(habitCompletionDates.size, goal.target)
            };
          }
          return goal;
        });

        // Save updated goals to AsyncStorage
        await saveGoals(updatedGoals);
        setGoals(updatedGoals);
      }
    }
  } catch (error) {
    console.log('Error marking habit as completed:', error);
  }
};

  const handleInfoPress = (habitId: string, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setSelectedHabitId(habitId);
    setDropdownPosition({ x: pageX - 55, y: pageY - 30 });
    setDropdownVisible(true);
  };

  const handleEditHabit = () => {
    if (selectedHabitId) {
      setDropdownVisible(false);
      navigation.navigate('EditHabit', { habitId: selectedHabitId });
    }
  };

  const handleDeleteHabit = () => {
    if (selectedHabitId) {
      const habitToDelete = habits.find(h => h.id === selectedHabitId);
      if (habitToDelete) {
        Alert.alert(
          'Confirm Delete',
          `Are you sure you want to delete "${habitToDelete.name}"? This action cannot be undone.`,
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
                  await deleteHabit(selectedHabitId);

                  // Also delete the associated goal if it exists
                  if (habitToDelete.goalId) {
                    const updatedGoals = goals.filter(g => g.id !== habitToDelete.goalId);
                    await saveGoals(updatedGoals);
                    setGoals(updatedGoals);
                  }

                  // Refresh habits list
                  await loadHabits();

                  Alert.alert('Success', 'Habit deleted successfully.');
                } catch (error) {
                  console.error('Error deleting habit:', error);
                  Alert.alert('Error', 'Could not delete habit. Please try again.');
                } finally {
                  setDropdownVisible(false);
                }
              },
            },
          ]
        );
      }
    }
  };
  const getFormattedDate = () => {
    const days = ['Sun,', 'Mon,', 'Tue,', 'Wed,', 'Thu,', 'Fri,', 'Sat,'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const now = new Date();
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${date} ${month} ${year}`;
  };

  const renderHabitItem = ({ item }: { item: Habit }) => {
    const isCompleted = completedToday.includes(item.id);

    return (
      <View
        style={[
          styles.habitItem,
          isCompleted && styles.completedHabitItem
        ]}
      >
        <Text
          style={[
            styles.habitName,
            isCompleted && styles.completedHabitName
          ]}
        >
          {item.name}
        </Text>
        <View style={styles.habitActions}>
          <TouchableOpacity

            onPress={() => !isCompleted && handleMarkCompleted(item.id)}
          >
            {isCompleted ? (
              <Image source={Icons.completed} style={styles.checkMark} />
            ) : (
              <Image source={Icons.checkbox} style={styles.checkBoxImage} />
            )}
          </TouchableOpacity>
          <TouchableOpacity

            onPress={(event) => handleInfoPress(item.id, event)}
          >
            <Image source={Icons.info} style={styles.infoIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGoalItem = ({ item }: { item: GoalProps }) => {
    const progress = item.completed / item.target;

    return (
      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <TouchableOpacity onPress={() => { }}>
            <Text style={styles.moreButton}>:</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {item.completed} from {item.target} days target
          </Text>
          <Text style={styles.goalFrequency}>{item.frequency}</Text>
        </View>
      </View>
    );
  };

  const displayedHabits = showAllHabits ? habits : habits.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.date}>{getFormattedDate()}</Text>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.highlight}>{userName}!</Text>
          </Text>
        </View>

        <LinearGradient
          colors={['#FF9C45', '#FF7831']}
          style={styles.progressCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View >
            <AnimatedCircularProgress
              size={117}
              width={15}
              fill={completionRate}
              tintColor="#FFFFFF"
              backgroundColor="#FFC6A6"
              rotation={0}
            >
              {() => (
                <Text style={styles.progressPercentage}>{completionRate}%</Text>
              )}
            </AnimatedCircularProgress>
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressStatText}>
              {completedToday.length} of {habits.length} habits
            </Text>
            <Text style={styles.progressSubText}>completed today!</Text>
            <Image source={Icons.progressCard} style={styles.progressImg} />
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today Habit</Text>
            <TouchableOpacity onPress={() => setShowAllHabits(!showAllHabits)}>
              <Text style={styles.seeAllText}>{showAllHabits ? 'Show less' : 'See all'}</Text>
            </TouchableOpacity>

          </View>

          <FlatList
            data={displayedHabits}
            renderItem={renderHabitItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.habitList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No habits found</Text>
                <Text style={styles.emptySubText}>Tap + to add a new habit</Text>
              </View>
            }
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            <TouchableOpacity onPress={() => setShowAllGoals(!showAllGoals)}>
              <Text style={styles.seeAllText}>{showAllGoals ? 'Show less' : 'See all'}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={goals}
            renderItem={renderGoalItem}
            keyExtractor={(item) => item.title}
            scrollEnabled={false}
            style={styles.goalList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No goals found</Text>
                <Text style={styles.emptySubText}>Tap + to add a new goal</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Edit/Delete Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdownMenu,
              { top: dropdownPosition.y, left: dropdownPosition.x },
            ]}
          >
            <TouchableOpacity style={styles.dropdownItem} onPress={handleEditHabit}>
              <Text style={styles.dropdownText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleDeleteHabit}>
              <Text style={[styles.dropdownText, { color: 'red' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>



      {/* Floating Action Button */}
      <TouchableOpacity

        onPress={() => navigation.navigate('CreateHabit')}
      >
        <Image source={Icons.fab} style={styles.addButton} />
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
        >
          <Image source={Icons.homeOn} style={styles.iconButton} />
        </TouchableOpacity>
        <TouchableOpacity

          onPress={() => navigation.navigate('Progress')}
        >
          <Image source={Icons.stat} style={styles.iconButton} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Image source={Icons.settings} style={styles.iconButton} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFF'
  },

  date: {
    marginTop: 59,
    marginLeft: 18,
    fontSize: 16,
    color: '#2F2F2F',
    marginBottom: 5,
    fontFamily: 'Nunito',
    fontWeight: 'bold',
  },
  greeting: {
    marginLeft: 18,
    fontSize: 28,
    fontWeight: '600',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FF5C00',
  },
  progressCard: {
    marginTop: 16,
    marginLeft: 13,
    marginRight: 13,
    borderRadius: 16,
    height: 189,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressPercentage: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 21,
    fontFamily: 'Nunito',
    textAlign: 'center',
  },
  progressTextContainer: {
    width: 171,
    height: 54,
    justifyContent: 'center',
    marginLeft: 20,
  },
  progressStatText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  progressSubText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Nunito',
    fontWeight: 'medium',
  },
  progressImg: {
    position: 'absolute',
    top: 75,
    right: -50,
    width: 115,
    height: 50,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginTop: 22,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF5C00',
    fontFamily: 'Nunito',
    fontWeight: 'bold',
  },
  habitList: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    height: 58,
    borderRadius: 5,
    backgroundColor: '#FBFBFB',
    marginBottom: 17,
  },
  habitName: {
    marginLeft: 14,
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedHabitItem: {
    backgroundColor: '#EDFFF4',
  },
  completedHabitName: {
    color: '#37C871',
  },


  checkBoxImage: {
    width: 30,
    height: 30,
  },
  checkMark: {
    width: 30,
    height: 30,
  },

  infoIcon: {
    marginRight: 14,
    width: 18,
    height: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptySubText: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 4,
  },
  goalList: {
    marginTop: 10,
  },
  goalItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  moreButton: {
    fontSize: 18,
    color: '#888',
    paddingHorizontal: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#FF7831',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
  },
  goalFrequency: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },




  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,

    width: 62,
    height: 62,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',

  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 21,
    paddingTop: 21,
    paddingLeft: 55,
    paddingRight: 55,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  iconHome: {
    width: 24,
    height: 24,

  },
  iconProgress: {
    width: 24,
    height: 24,
  },
  iconSettings: {
    width: 24,
    height: 24,
  },

  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    elevation: 5,
    width: 79,
    height: 60,
    zIndex: 999,
  },

  dropdownOption: {
    paddingVertical: 6,
    paddingHorizontal: 7,

  },

  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Nunito',
    color: '#838383',
  },

  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },



  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  dropdownText: {
    fontSize: 16,
    color: '#333',
  },

});

export default HomeScreen;