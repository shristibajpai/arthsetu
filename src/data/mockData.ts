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
    name: 'Organic Staples & Ayurvedic Ghee',
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
    name: 'Health Checkup & Ayurvedic Consult',
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
    title: 'Teerth & Family Sabbatical',
    categoryName: 'Teerth & Parivar Yatra',
    horizonTag: 'Short-Term · 10 mos to go',
    badgeText: 'Auspicious',
    badgeType: 'auspicious',
    targetAmount: 350000,
    currentAmount: 280000,
    percent: 80,
    monthlyAllocation: 7000,
    projectedDate: 'September 2026',
    timelineDetails: 'Kashi, Rishikesh & Kedarnath pilgrimage for parents',
    icon: 'temple_hindu',
  },
  {
    id: 'goal-2',
    title: 'Ghar Downpayment',
    categoryName: 'Ghar Prapti',
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
    categoryName: 'Bachhon Ki Shiksha',
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
    title: 'Swatantrata (Financial Independence)',
    categoryName: 'Moksha Horizon',
    horizonTag: 'Horizon Peak · Age 52',
    badgeText: 'Lifelong Moksha',
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
    title: 'Kartik Month Priority Sanchay Debited',
    message: '₹55,500 safely allocated across Nifty 50 Index, Sukanya, and Bharat Bond ETF.',
    time: '2 hours ago',
    type: 'auspicious',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Tax Sanchay Alert: FY26 Slab Optimization',
    message: 'New Tax regime retains ₹42,000 additional annual cashflow compared to Old Regime.',
    time: '1 day ago',
    type: 'system',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Emergency Reserve Milestone (90%)',
    message: 'Your Aapda Kosh holds ₹5,40,000. Just 0.6 months left to hit the golden 6-month shield.',
    time: '3 days ago',
    type: 'auspicious',
    read: true,
  },
];

export const VEDIC_WISDOM_ARTICLES = [
  {
    id: 'vw-1',
    sanskritTitle: 'धर्मार्थकाममोक्षाणां शरीरं साधनम्',
    englishTitle: 'The Four Purusharthas of Mindful Wealth',
    author: 'Chanakya Neeti & Ancient Darshana',
    readTime: '4 min read',
    excerpt: 'True prosperity (Artha) exists not in frantic accumulation, but as a deliberate stepping stone that enables Dharma (duty), Kama (noble joy), and ultimately Moksha (inner freedom).',
    fullContent: `In Indian classical thought, Artha is considered one of the four essential human pursuits (Purusharthas), bounded on one side by Dharma (ethical conduct) and on the other by Moksha (spiritual freedom).
    
Key Lessons for Modern Wealth:
1. Pratham Sankalp: Pay yourself first. In ancient royal treasury architecture, 1/6th of revenues were committed to the grain and gold fortress before discretionary disbursement.
2. Nishkama Sanchay: Invest with steady discipline without panic over daily market tremors. The river finds the ocean not by force, but by persistence.
3. The 3-Basket Rule: Artha must be divided into Immediate Sustenance (Bhojana), Protective Buffer (Suraksha), and Generational Growth (Vridhi).`,
  },
  {
    id: 'vw-2',
    sanskritTitle: 'मितव्ययः सुखस्य मूलम्',
    englishTitle: 'Mitavyaya: Spending Without Greed, Conserving Without Poverty',
    author: 'Sage Vidura in Mahabharata',
    readTime: '3 min read',
    excerpt: 'Mitavyaya is the golden equilibrium between stinginess and reckless extravagance. It transforms spending into an act of reverence and conscious awareness.',
    fullContent: `Sage Vidura remarked that reckless spending exhausts fortune like water flowing through unbaked clay, whereas excessive miserliness starves the soul and strains familial harmony.

Applying Mitavyaya Today:
- Recognize the difference between Aavashyak (Essential needs) and Aanand (Wants that nourish mind and relationships).
- Avoid conspicuous debt (Karna-Rina) incurred purely for social display.
- Every Rupee spent on quality nutrition, family health, and education compounds as sacred human capital.`,
  },
  {
    id: 'vw-3',
    sanskritTitle: 'आपत्काले धनं रक्षेत्',
    englishTitle: 'Aapatkale Dhanam Rakshet: The Architecture of the Emergency Fortress',
    author: 'Kautilya Arthashastra (Book II)',
    readTime: '5 min read',
    excerpt: 'Even the most prosperous kingdom collapses if a sudden drought finds the grain silos empty. Why your liquid runway is your family’s most sacred insurance.',
    fullContent: `Chanakya advised King Chandragupta that before any military campaign or public monument, the state must possess three years of grain reserves and twelve months of liquid bullion.

The Modern Aapda Kosh Blueprint:
- Tier 1: 2 Months living burn in high-yield instant savings for instant medical or domestic urgencies.
- Tier 2: 2.5 Months in Sovereign Overnight & Liquid mutual funds (T+1 access, zero equity volatility).
- Tier 3: 1.5 Months in breakable auto-sweep Fixed Deposits yielding guaranteed sovereign rates.`,
  },
];
