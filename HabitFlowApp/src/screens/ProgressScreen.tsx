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
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Progress: undefined;
  Settings: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

interface GoalWithProgress extends Goal {
  progressPercentage: number;
  isAchieved: boolean;
}


const CircularProgress = ({
  size = 120,
  strokeWidth = 8,
  progress,
  color = '#FF5C00',
  backgroundColor = '#F0F0F0',
  children
}: {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
       
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
};

const SmallProgressCircle = ({
  progress,
  color,
  size = 40
}: {
  progress: number;
  color: string;
  size?: number;
}) => {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const center = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FBFBFB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={3}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <Text style={{
        fontSize: 11,
        fontWeight: 'bold',
        color: '#B0B0B0',
        fontFamily: 'Nunito',
      }}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
};

const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(60);
  const [achievedGoals, setAchievedGoals] = useState(0);
  const [unachievedGoals, setUnachievedGoals] = useState(0);

  const periodOptions = ['This Week', 'This Month', 'This Year'];

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const goalsData = await getGoals();
      
     
      const goalsWithProgress: GoalWithProgress[] = goalsData.map(goal => {
        const progressPercentage = Math.min((goal.completed / goal.target) * 100, 100);
        const isAchieved = progressPercentage >= 100;
        
        return {
          ...goal,
          progressPercentage,
          isAchieved
        };
      });

      setGoals(goalsWithProgress);
      calculateOverallProgress(goalsWithProgress);
    } catch (error) {
      console.log('Error loading progress data:', error);
    }
  };

  const calculateOverallProgress = (goalsData: GoalWithProgress[]) => {
    let achieved = 0;
    let unachieved = 0;
    let totalProgress = 0;

    goalsData.forEach(goal => {
      totalProgress += goal.progressPercentage;

      if (goal.isAchieved) {
        achieved++;
      } else {
        unachieved++;
      }
    });

    setAchievedGoals(achieved);
    setUnachievedGoals(unachieved);

    if (goalsData.length > 0) {
      const avgProgress = totalProgress / goalsData.length;
      setOverallProgress(Math.round(avgProgress));
    }
  };

  const renderGoalItem = ({ item }: { item: GoalWithProgress }) => (
    <TouchableOpacity style={styles.goalItem}>
      <View style={styles.goalLeft}>
        <SmallProgressCircle 
          progress={item.progressPercentage}
          color={item.isAchieved ? '#5FE394' : '#B0B0B0'}
         
        />
      </View>

      <View style={styles.goalContent}>
        <Text style={styles.goalTitle}>{item.title}</Text>
        <Text style={styles.goalSubtitle}>
          {item.completed} from {item.target} days target
        </Text>
      </View>

      <View style={styles.goalRight}>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: item.isAchieved ? '#D7FFE7' : '#FBFBFB',

            
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.isAchieved ? '#37C871' : '#FF7831' }
          ]}>
            {item.isAchieved ? 'Achieved' : 'Unachieved'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

     
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Report</Text>
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
        </View>

        
        <View style={styles.section}>
          <View style={styles.goalsHeader}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            
          </View>

        
          <View style={styles.progressChartContainer}>
            <View style={styles.circularProgressWrapper}>
              <CircularProgress
                size={150}
                strokeWidth={20}
                progress={overallProgress}
                color="#FF5C00"
                backgroundColor="#F0F0F0"

              >
                <View style={styles.progressCenter}>
                  <Text style={styles.progressPercentage}>{overallProgress}%</Text>
                </View>
              </CircularProgress>
            </View>
          </View>

          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <Text style={styles.statText}>
                {achievedGoals} Habits goal has achieved
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.crossIcon}>
                <Text style={styles.crossMark}>✕</Text>
              </View>
              <Text style={styles.statTextNotAchieved}>
                {unachievedGoals} Habits goal hasn't achieved
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
   marginLeft: 21,
    marginTop: 64,
    
  },
  title: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  section: {
    
    marginHorizontal: 21,
    marginVertical: 12,
    
    
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
  },
  pickerContainer: {
    backgroundColor: '#E7E7E7',
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 150,
  },
  picker: {
    height: 55,
   
    color: '#2F2F2F',
    
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
   
  },
  
  progressChartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  circularProgressWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 29,
    fontWeight: '800',
    color: '#FF5C00',
    fontFamily: 'Nunito',
  },
  statsContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  checkIcon: {
    width: 22,
    height: 22,
    
  
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  crossIcon: {
    width: 22,
    height: 22,
    
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkMark: {
    color: '#FF5C00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  crossMark: {
    color: '#A2A2A2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5C00',
    fontFamily: 'Nunito',
  },
  statTextNotAchieved: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A2A2A2',
    fontFamily: 'Nunito',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    borderRadius: 9,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
  },
  goalLeft: {
    marginRight: 12,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F2F2F',
    fontFamily: 'Nunito',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#2F2F2F',
    fontFamily: 'Nunito',
    fontWeight: '500',
  },
  goalRight: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    
  },
  statusText: {
    fontSize: 14,
    fontWeight: '400',
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
});

export default ProgressScreen;