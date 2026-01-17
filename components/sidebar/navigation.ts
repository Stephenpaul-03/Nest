import { NavItem } from './types';

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    accentColor: '#5b8def', // soft blue (darker pastel)
  },

  {
    title: 'Finances',
    icon: 'account-balance-wallet',
    accentColor: '#3fb6a8', // muted teal
    children: [
      {
        title: 'Transactions',
        path: '/finance/transactions',
        icon: 'trending-up',
        accentColor: '#e0b84a', // muted yellow
      },
      {
        title: 'History',
        path: '/finance/history',
        icon: 'history',
        accentColor: '#e38cb7', // muted pink
      },
      {
        title: 'Reports',
        path: '/finance/report',
        icon: 'pie-chart',
        accentColor: '#7a8fe8', // muted indigo
      },
    ],
  },

  {
    title: 'Events',
    icon: 'event',
    accentColor: '#e28a3b', // muted orange
    children: [
      {
        title: 'Calendar',
        path: '/events/calendar',
        icon: 'calendar-month',
        accentColor: '#4fbfa5', // muted mint
      },
      {
        title: 'Timeline',
        path: '/events/timeline',
        icon: 'upcoming',
        accentColor: '#9a7fdc', // muted violet
      },
    ],
  },

  {
    title: 'Medicals',
    icon: 'local-hospital',
    accentColor: '#e06666', // muted red
    children: [
      {
        title: 'Inventory',
        path: '/medicals/inventory',
        icon: 'inventory',
        accentColor: '#6aa8e6', // muted sky blue
      },
      {
        title: 'Schedules',
        path: '/medicals/schedule',
        icon: 'schedule',
        accentColor: '#c67ce6', // muted lavender
      },
    ],
  },

  {
    title: 'Settings',
    path: '/settings',
    icon: 'settings',
    accentColor: '#6bbf7a', // muted green
  },
];
