export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  updatedAt?: string;
  goalId?: string;
}