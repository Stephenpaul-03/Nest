import { NavItem } from './types';

export const navigationItems: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: 'dashboard', accentColor: '#3b82f6' },

  {
    title: 'Finances',
    icon: 'account-balance-wallet',
    accentColor: '#10b981',
    children: [
      { title: 'Transactions', path: '/finance/transactions', icon: 'trending-up', accentColor: '#10b981' },
      { title: 'History', path: '/finance/history', icon: 'history', accentColor: '#10b981' },
      { title: 'Reports', path: '/finance/report', icon: 'pie-chart', accentColor: '#10b981' }
    ],
  },

  {
    title: 'Events',
    icon: 'event',
    accentColor: '#f59e0b',
    children: [
      { title: 'Calendar', path: '/events/calendar', icon: 'calendar-month', accentColor: '#f59e0b' },
      { title: 'Timeline', path: '/events/timeline', icon: 'upcoming', accentColor: '#f59e0b' },
    ],
  },

  {
    title: 'Medicals',
    icon: 'local-hospital',
    accentColor: '#ef4444',
    children: [
      { title: 'Inventory', path: '/medicals/inventory', icon: 'inventory', accentColor: '#ef4444' },
      { title: 'Schedules', path: '/medicals/schedule', icon: 'schedule', accentColor: '#ef4444' },
    ],
  },

  { title: 'Settings', path: '/settings', icon: 'settings', accentColor: '#8b5cf6' },
];

