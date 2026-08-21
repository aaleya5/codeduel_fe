// Mock data for development - Replace with actual API calls

import { User, Challenge, LeaderboardEntry, Stats, ActivityData, ChartData } from '@/types';

export const currentUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  leetcodeUsername: 'alexchen'
};

export const mockStats: Stats = {
  todayStatus: 'completed',
  todaySolved: 2,
  todayTarget: 2,
  currentStreak: 14,
  longestStreak: 30,
  totalPenalties: 25,
  activeChallenges: 3,
  totalSolved: 156
};

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    name: 'January Grind',
    dailyTarget: 2,
    difficulty: 'medium',
    penaltyAmount: 5,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    createdBy: '1',
    isActive: true,
    members: [
      {
        userId: '1',
        userName: 'Alex Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        status: 'completed',
        streak: 14,
        totalPenalty: 10,
        dailyProgress: []
      },
      {
        userId: '2',
        userName: 'Sarah Miller',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        status: 'completed',
        streak: 12,
        totalPenalty: 15,
        dailyProgress: []
      },
      {
        userId: '3',
        userName: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        status: 'failed',
        streak: 5,
        totalPenalty: 45,
        dailyProgress: []
      }
    ]
  },
  {
    id: '2',
    name: 'Hard Mode Warriors',
    dailyTarget: 1,
    difficulty: 'hard',
    penaltyAmount: 10,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    createdBy: '2',
    isActive: true,
    members: [
      {
        userId: '1',
        userName: 'Alex Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        status: 'pending',
        streak: 8,
        totalPenalty: 20,
        dailyProgress: []
      },
      {
        userId: '4',
        userName: 'Mike Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        status: 'completed',
        streak: 10,
        totalPenalty: 10,
        dailyProgress: []
      }
    ]
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '4', userName: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', totalSolved: 245, currentStreak: 28, missedDays: 2, penaltyAmount: 10 },
  { rank: 2, userId: '2', userName: 'Sarah Miller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', totalSolved: 198, currentStreak: 21, missedDays: 5, penaltyAmount: 25 },
  { rank: 3, userId: '1', userName: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', totalSolved: 156, currentStreak: 14, missedDays: 5, penaltyAmount: 25 },
  { rank: 4, userId: '5', userName: 'Emily Wang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', totalSolved: 134, currentStreak: 7, missedDays: 8, penaltyAmount: 40 },
  { rank: 5, userId: '3', userName: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', totalSolved: 89, currentStreak: 3, missedDays: 15, penaltyAmount: 75 },
  { rank: 6, userId: '6', userName: 'David Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', totalSolved: 67, currentStreak: 0, missedDays: 20, penaltyAmount: 100 }
];

// Generate activity data for heatmap (last 365 days)
export const generateActivityData = (): ActivityData[] => {
  const data: ActivityData[] = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random activity level (0-4)
    const random = Math.random();
    let count = 0;
    if (random > 0.3) count = 1;
    if (random > 0.5) count = 2;
    if (random > 0.7) count = 3;
    if (random > 0.9) count = 4;
    
    data.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  return data;
};

export const mockActivityData = generateActivityData();

// Chart data for last 30 days
export const generateChartData = (): ChartData[] => {
  const data: ChartData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      solved: Math.floor(Math.random() * 4) + 1,
      target: 2
    });
  }
  
  return data;
};

export const mockChartData = generateChartData();
