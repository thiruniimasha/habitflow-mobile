import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { getHabits, getHabitStats } from '../services/habitServices';
import { getGoals } from '../services/goalServices';
import { Habit } from '../types/Habit';
import { Goal } from '../types/Goal';
import { Icons } from '../utils/Icon';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Progress: undefined;
  Settings: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

type TabType = 'habits' | 'goals';

interface CalendarDay {
  date: number;
  isToday: boolean;
  isSelected: boolean;
  hasProgress: boolean;
  completionRate: number;
}

interface HabitProgress {
  id: string;
  title: string;
  isCompleted: boolean;
  completionTime?: string;
  streak: number;
}


const SimpleProgressCircle = ({
  size,
  progress,
  color,
  children
}: {
  size: number;
  progress: number;
  color: string;
  children: () => React.ReactNode;
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <View
        style={{
          width: size - 8,
          height: size - 8,
          borderRadius: (size - 8) / 2,
          backgroundColor: color,
          opacity: progress / 100,
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size - 16,
          height: size - 16,
          borderRadius: (size - 16) / 2,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children()}
      </View>
    </View>
  );
};

const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('habits');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [habitProgress, setHabitProgress] = useState<HabitProgress[]>([]);
  const [dailyProgressPercentage, setDailyProgressPercentage] = useState(0);
  const [overallProgress, setOverallProgress] = useState(60);
  const [achievedGoals, setAchievedGoals] = useState(0);
  const [unachievedGoals, setUnachievedGoals] = useState(0);

  const periodOptions = ['Daily', 'Weekly', 'Monthly'];

  useEffect(() => {
    loadData();
    generateCalendar();
  }, [selectedDate, selectedPeriod, activeTab]);

  const loadData = async () => {
    try {
      const habitsData = await getHabits();
      const goalsData = await getGoals();

      setHabits(habitsData);
      setGoals(goalsData);

      
      if (activeTab === 'habits') {
        loadHabitProgress(habitsData, selectedDate);
      } else {
        calculateGoalProgress(goalsData);
      }
    } catch (error) {
      console.log('Error loading progress data:', error);
    }
  };

  const loadHabitProgress = async (habitsData: Habit[], date: Date) => {
    try {
      const progressData: HabitProgress[] = habitsData.map(habit => {
        const isCompleted = checkIfCompleted(habit.id, date);
        return {
          id: habit.id,
          title: habit.name,
          isCompleted,
          completionTime: isCompleted ? '08:30 AM' : undefined,
          streak: isCompleted ? 1 : 0,
        };
      });

      setHabitProgress(progressData);
      
     
      if (progressData.length > 0) {
        const completedCount = progressData.filter(habit => habit.isCompleted).length;
        const percentage = Math.round((completedCount / progressData.length) * 100);
        setDailyProgressPercentage(percentage);
      } else {
        setDailyProgressPercentage(0);
      }
    } catch (error) {
      console.error('Failed to load habit progress:', error);
    }
  };

  const checkIfCompleted = (habitId: string, date: Date): boolean => {
   
    return Math.random() > 0.5;
  };

  const generateCalendar = () => {
    const today = new Date();
    const selected = selectedDate || today;

   
    const dayOfWeek = selected.getDay(); 
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - dayOfWeek);

    const days: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selected.toDateString();

      days.push({
        date: date.getDate(),
        isToday,
        isSelected,
        hasProgress: Math.random() > 0.3, 
        completionRate: Math.floor(Math.random() * 100),
      });
    }

    setCalendarDays(days);
  };

  const calculateGoalProgress = (goalsData: Goal[]) => {
    let achieved = 0;
    let unachieved = 0;
    let totalProgress = 0;

    goalsData.forEach(goal => {
      const progress = goal.completed / goal.target;
      totalProgress += progress;

      if (progress >= 1) {
        achieved++;
      } else {
        unachieved++;
      }
    });

    setAchievedGoals(achieved);
    setUnachievedGoals(unachieved);

    if (goalsData.length > 0) {
      const avgProgress = (totalProgress / goalsData.length) * 100;
      setOverallProgress(Math.round(avgProgress));
    }
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCalendarDay = ({ item }: { item: CalendarDay }) => (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        item.isSelected && styles.selectedCalendarDay,
        item.isToday && styles.todayCalendarDay,
      ]}
      onPress={() => {
        const newDate = new Date(selectedDate);
        newDate.setDate(item.date);
        setSelectedDate(newDate);
      }}
    >
      <Text style={[
        styles.calendarDayText,
        item.isSelected && styles.selectedCalendarDayText,
        item.isToday && styles.todayCalendarDayText,
      ]}>
        {item.date}
      </Text>
      {item.hasProgress && (
        <View style={[
          styles.progressDot,
          { backgroundColor: item.completionRate > 70 ? '#37C871' : '#FF7831' }
        ]} />
      )}
    </TouchableOpacity>
  );

  const renderHabitItem = ({ item }: { item: HabitProgress }) => (
    <View style={styles.habitItem}>
      <View style={styles.habitLeft}>
        <View style={[
          styles.habitCheckbox,
          item.isCompleted && styles.completedCheckbox
        ]}>
          {item.isCompleted && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </View>

      <View style={styles.habitContent}>
        <Text style={styles.habitTitle}>{item.title}</Text>
        <Text style={styles.habitSubtitle}>
          {item.isCompleted
            ? `Completed at ${item.completionTime || 'Unknown time'}`
            : 'Not completed today'
          }
        </Text>
        {item.streak > 0 && (
          <Text style={styles.habitStreak}>
            🔥 {item.streak} day streak
          </Text>
        )}
      </View>

      <View style={styles.habitRight}>
        <Text style={[
          styles.habitStatus,
          { color: item.isCompleted ? '#37C871' : '#FF7831' }
        ]}>
          {item.isCompleted ? 'Done' : 'Pending'}
        </Text>
      </View>
    </View>
  );

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = Math.min((item.completed / item.target) * 100, 100);
    const isAchieved = progress >= 100;

    return (
      <View style={styles.goalItem}>
        <View style={styles.goalLeft}>
          <SimpleProgressCircle
            size={50}
            progress={progress}
            color={isAchieved ? '#37C871' : '#FF7831'}
          >
            {() => (
              <Text style={[
                styles.goalProgressText,
                { color: isAchieved ? '#37C871' : '#FF7831' }
              ]}>
                {Math.round(progress)}%
              </Text>
            )}
          </SimpleProgressCircle>
        </View>

        <View style={styles.goalContent}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <Text style={styles.goalTarget}>
            {item.completed} from {item.target} target
          </Text>
        </View>

        <View style={styles.goalRight}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isAchieved ? '#E8F8ED' : '#FFF2E8' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isAchieved ? '#37C871' : '#FF7831' }
            ]}>
              {isAchieved ? 'Achieved' : 'In Progress'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHabitsTab = () => (
    <View style={styles.tabContent}>
     
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>
            {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        <FlatList
          data={calendarDays}
          renderItem={renderCalendarDay}
          keyExtractor={(item) => item.date.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarContainer}
        />
      </View>

      
      <View style={styles.dateInfoSection}>
        <Text style={styles.selectedDateText}>
          Progress for {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      </View>

      
      <View style={styles.dailyProgressSection}>
        <Text style={styles.sectionTitle}>Daily Progress</Text>
        <View style={styles.progressContainer}>
          <SimpleProgressCircle
            size={120}
            progress={dailyProgressPercentage}
            color={dailyProgressPercentage >= 70 ? '#37C871' : '#FF7831'}
          >
            {() => (
              <Text style={[
                styles.progressPercentage,
                { color: dailyProgressPercentage >= 70 ? '#37C871' : '#FF7831' }
              ]}>
                {dailyProgressPercentage}%
              </Text>
            )}
          </SimpleProgressCircle>
        </View>
        <Text style={styles.progressSummary}>
          {habitProgress.filter(h => h.isCompleted).length} of {habitProgress.length} habits completed
        </Text>
      </View>

     
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        <FlatList
          data={habitProgress}
          renderItem={renderHabitItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No habits for this day</Text>
              <Text style={styles.emptySubText}>Create habits to track daily progress</Text>
            </View>
          }
        />
      </View>
    </View>
  );

  const renderGoalsTab = () => (
    <View style={styles.tabContent}>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Goal Progress</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPeriod}
              onValueChange={setSelectedPeriod}
              style={styles.picker}
              mode="dropdown"
            >
              {periodOptions.map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        
        <View style={styles.progressContainer}>
          <SimpleProgressCircle
            size={120}
            progress={overallProgress}
            color="#FF7831"
          >
            {() => (
              <Text style={styles.progressPercentage}>{overallProgress}%</Text>
            )}
          </SimpleProgressCircle>
        </View>

      
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F8ED' }]}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.statText}>
              {achievedGoals} Goals achieved
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FFE8E8' }]}>
              <Text style={styles.crossMark}>✕</Text>
            </View>
            <Text style={styles.statText}>
              {unachievedGoals} Goals in progress
            </Text>
          </View>
        </View>

        
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No goals found</Text>
              <Text style={styles.emptySubText}>Create your first goal to track progress</Text>
            </View>
          }
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

     
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
      </View>

     
      <View style={styles.tabsContainer}>
        {renderTabButton('habits', 'Habits')}
        {renderTabButton('goals', 'Goals')}
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'habits' ? renderHabitsTab() : renderGoalsTab()}
      </ScrollView>

     
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image source={Icons.home} style={styles.iconButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
          <Image source={Icons.statOn} style={styles.iconButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Image source={Icons.settings} style={styles.iconButton} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#FF7831',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Nunito',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  calendarSection: {
    backgroundColor: '#fff',
    marginVertical: 5,
    paddingVertical: 20,
  },
  calendarHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  calendarContainer: {
    paddingHorizontal: 20,
  },
  calendarDay: {
    width: 45,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  selectedCalendarDay: {
    backgroundColor: '#FF7831',
  },
  todayCalendarDay: {
    borderWidth: 2,
    borderColor: '#FF7831',
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  selectedCalendarDayText: {
    color: '#fff',
  },
  todayCalendarDayText: {
    color: '#FF7831',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  dateInfoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 5,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  dailyProgressSection: {
    backgroundColor: '#fff',
    marginVertical: 5,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 5,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 100,
  },
  picker: {
    height: 40,
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  progressSummary: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Nunito',
    textAlign: 'center',
    marginTop: 10,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkMark: {
    color: '#37C871',
    fontSize: 12,
    fontWeight: 'bold',
  },
  crossMark: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Nunito',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  habitLeft: {
    marginRight: 15,
  },
  habitCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  completedCheckbox: {
    backgroundColor: '#37C871',
    borderColor: '#37C871',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
    marginBottom: 4,
  },
  habitSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Nunito',
    marginBottom: 2,
  },
  habitStreak: {
    fontSize: 12,
    color: '#FF7831',
    fontFamily: 'Nunito',
    fontWeight: '600',
  },
  habitRight: {
    marginLeft: 10,
  },
  habitStatus: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Nunito',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  goalLeft: {
    marginRight: 15,
  },
  goalProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Nunito',
  },
  goalRight: {
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Nunito',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Nunito',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BBB',
    fontFamily: 'Nunito',
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
    width: 24,
    height: 24,
  },
});

export default ProgressScreen;