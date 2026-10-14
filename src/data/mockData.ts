import { ExpenseRecord, GoalItem, NotificationItem } from '../types';

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    name: 'Apartment Lease & Society Dues',
    category: 'Housing',
    date: 'Nov 18, 2025',
    nature: 'Need',
    channel: 'NetBanking',
    amount: 38000,
    icon: 'roofing',
  },
  {
    id: 'exp-2',
    name: 'Saffron Courtyard Family Dinner',
    category: 'Dining',
    date: 'Nov 17, 2025',
    nature: 'Want',
    channel: 'Credit Card',
    amount: 4250,
    icon: 'restaurant',
  },
  {
    id: 'exp-3',
    name: 'Organic Staples & Herbal Ghee',
    category: 'Ration',
    date: 'Nov 15, 2025',
    nature: 'Need',
    channel: 'UPI',
    amount: 5480,
    icon: 'shopping_cart',
  },
  {
    id: 'exp-4',
    name: 'EV Charging & Metro Card Reload',
    category: 'Transit',
    date: 'Nov 14, 2025',
    nature: 'Need',
    channel: 'UPI',
    amount: 2100,
    icon: 'directions_car',
  },
  {
    id: 'exp-5',
    name: 'Handcrafted Brass Diya Set',
    category: 'Decor',
    date: 'Nov 12, 2025',
    nature: 'Want',
    channel: 'UPI',
    amount: 1850,
    icon: 'spa',
  },
  {
    id: 'exp-6',
    name: 'Health Checkup & Herbal Consult',
    category: 'Healthcare',
    date: 'Nov 10, 2025',
    nature: 'Need',
    channel: 'UPI',
    amount: 3200,
    icon: 'medical_services',
  },
  {
    id: 'exp-7',
    name: 'Cloud Storage & Financial Journals',
    category: 'Digital',
    date: 'Nov 08, 2025',
    nature: 'Want',
    channel: 'Credit Card',
    amount: 1450,
    icon: 'subscriptions',
  },
];

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Family travel',
    categoryName: 'Family travel',
    horizonTag: 'Short-Term · 10 mos to go',
    badgeText: 'On Track',
    badgeType: 'auspicious',
    targetAmount: 350000,
    currentAmount: 280000,
    percent: 80,
    monthlyAllocation: 7000,
    projectedDate: 'September 2026',
    timelineDetails: 'Kashi, Rishikesh & Kedarnath pilgrimage for parents',
    icon: 'home_work',
  },
  {
    id: 'goal-2',
    title: 'Home down payment',
    categoryName: 'House purchase',
    horizonTag: 'Medium-Term · 18 mos to go',
    badgeText: 'On Track',
    badgeType: 'on-track',
    targetAmount: 2500000,
    currentAmount: 1840000,
    percent: 74,
    monthlyAllocation: 35000,
    projectedDate: 'May 2027 completion',
    timelineDetails: 'Securing 20% equity for ancestral terrace apartment in Pune',
    icon: 'home_work',
  },
  {
    id: 'goal-3',
    title: 'Higher Education Corpus',
    categoryName: 'Education',
    horizonTag: 'Long-Term · 7 yrs to go',
    badgeText: 'Equity Compounding',
    badgeType: 'compounding',
    targetAmount: 4000000,
    currentAmount: 1250000,
    percent: 31,
    monthlyAllocation: 22000,
    projectedDate: 'Target: Year 2032',
    timelineDetails: 'Higher secondary & global university study index pool',
    icon: 'school',
  },
  {
    id: 'goal-4',
    title: 'Financial independence',
    categoryName: 'Financial independence',
    horizonTag: 'Horizon Peak · Age 52',
    badgeText: 'Long-term independence',
    badgeType: 'horizon',
    targetAmount: 35000000,
    currentAmount: 9200000,
    percent: 26,
    monthlyAllocation: 51000,
    projectedDate: 'Safe Withdrawal 3.8%',
    timelineDetails: 'Perpetual inflation-hedged dividend & sovereign coupon stream',
    icon: 'spa',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Monthly savings allocation completed',
    message: '₹55,500 safely allocated across Nifty 50 Index, Sukanya, and Bharat Bond ETF.',
    time: '2 hours ago',
    type: 'auspicious',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Tax update: FY26 planning',
    message: 'New Tax regime retains ₹42,000 additional annual cashflow compared to Old Regime.',
    time: '1 day ago',
    type: 'system',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Emergency Reserve Milestone (90%)',
    message: 'Your emergency fund holds ₹5,40,000. Just 0.6 months left to hit the golden 6-month shield.',
    time: '3 days ago',
    type: 'auspicious',
    read: true,
  },
];

export const LEARNING_ARTICLES = [
  {
    id: 'vw-1',
    subtitle: 'Build wealth with purpose',
    englishTitle: 'Build Wealth with Purpose',
    author: 'ArthSetu Learning',
    readTime: '4 min read',
    excerpt: 'A clear plan helps you balance today’s needs with the goals and choices you want in the future.',
    fullContent: `A strong financial plan gives every part of your income a purpose. Start with essential expenses, build a safety buffer, and set aside money for your longer-term goals.

Three practical habits:
1. Save a set amount as soon as you receive your income.
2. Invest regularly and review your plan at a steady pace.
3. Keep emergency savings separate from money set aside for long-term goals.`,
  },
  {
    id: 'vw-2',
    subtitle: 'Spend with intention',
    englishTitle: 'Spend with Intention',
    author: 'ArthSetu Learning',
    readTime: '3 min read',
    excerpt: 'A realistic budget makes room for essential bills, personal priorities, and enjoyable spending.',
    fullContent: `A useful budget supports your life instead of making every purchase feel like a trade-off. Track where your money goes, cover essential bills first, and set a limit for flexible spending.

Try this each month:
- Separate essential expenses from optional purchases.
- Set aside savings before spending the rest.
- Review your plan and adjust it when your priorities change.`,
  },
  {
    id: 'vw-3',
    subtitle: 'Prepare for unexpected costs',
    englishTitle: 'Prepare for Unexpected Costs',
    author: 'ArthSetu Learning',
    readTime: '5 min read',
    excerpt: 'An emergency fund can help cover an unexpected bill or a gap in income without disrupting your other goals.',
    fullContent: `Start with a small, accessible reserve and build it over time. A common target is three to six months of essential expenses, adjusted for your income stability and household needs.

Keep your emergency money easy to access and separate from your regular spending account. Refill the fund after using it, and review the target when your expenses change.`,
  },
];
