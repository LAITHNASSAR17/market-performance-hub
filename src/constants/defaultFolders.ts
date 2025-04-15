
export const DEFAULT_FOLDERS = [
  {
    name: 'All notes',
    icon: '📝',
  },
  {
    name: 'Trade Notes',
    icon: '💹',
  },
  {
    name: 'Daily Journal',
    icon: '📓',
  },
  {
    name: 'Sessions Recap',
    icon: '📊',
  },
  {
    name: 'Quarterly Goals',
    icon: '🎯',
  },
  {
    name: 'Trading Plan',
    icon: '📋',
  },
  {
    name: '2023 Goals + Plan',
    icon: '🎆',
  },
  {
    name: 'Plan of Action',
    icon: '✍️',
  },
  {
    name: 'Templates',
    icon: '📑',
  }
];

export const DEFAULT_TAGS = [
  'FOMC',
  'Equities',
  'Futures',
  'Strategy',
  'Psychology',
  'Risk',
  'Plan',
  'Improvement',
  'Analysis'
];

export const DEFAULT_TEMPLATES = [
  {
    title: 'Pre-Market Plan',
    content: `Symbol\tGame Plan\n\nES\t\nMES\t\nCL\t`,
    category: 'trading',
    isDefault: true
  },
  {
    title: 'Trade Review',
    content: `Trade Details:\n- Symbol:\n- Direction:\n- Entry:\n- Exit:\n- P&L:\n\nWhat went well:\n\nWhat could be improved:\n\nLessons learned:`,
    category: 'trading',
    isDefault: true
  },
  {
    title: 'Daily Journal',
    content: `Date: ${new Date().toISOString().split('T')[0]}\n\nMarket Overview:\n\nEmotional State:\n\nGoals for Today:\n\nLessons Learned:`,
    category: 'journal',
    isDefault: true
  },
  {
    title: 'Weekly Review',
    content: `Week of: ${new Date().toISOString().split('T')[0]}\n\nPerformance Summary:\n\nStrengths:\n\nWeaknesses:\n\nAction Items for Next Week:`,
    category: 'review',
    isDefault: true
  }
];
