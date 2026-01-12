import { NavItem } from './types';

export const navigationItems: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: 'dashboard' },

  {
    title: 'Accounts',
    icon: 'account-balance-wallet',
    children: [
      { title: 'Overview', path: '/accounts/overview', icon: 'pie-chart' },
      { title: 'Personal', path: '/accounts/personal', icon: 'person' },
      { title: 'Family', path: '/accounts/family', icon: 'family-restroom' },
      { title: 'Tools', path: '/accounts/tools', icon: 'build' },
    ],
  },

  {
    title: 'Events',
    icon: 'event',
    children: [
      { title: 'Upcoming', path: '/events/upcoming', icon: 'upcoming' },
      { title: 'Calendar', path: '/events/calendar', icon: 'calendar-month' },
      { title: 'Tools', path: '/events/tools', icon: 'build' },
    ],
  },

  {
    title: 'Medbay',
    icon: 'local-hospital',
    children: [
      { title: 'Stocks', path: '/medbay/stocks', icon: 'inventory' },
      { title: 'Timetable', path: '/medbay/timetable', icon: 'schedule' },
      { title: 'Tools', path: '/medbay/tools', icon: 'build' },
    ],
  },

  { title: 'Settings', path: '/settings', icon: 'settings' },
];
