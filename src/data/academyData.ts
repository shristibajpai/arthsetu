export interface AcademyConcept {
  id: string;
  category:
    | 'Money Basics'
    | 'Budgeting'
    | 'Savings'
    | 'Banking'
    | 'Investing'
    | 'Loans'
    | 'Gold Loans'
    | 'Insurance'
    | 'Taxes'
    | 'Credit'
    | 'Retirement'
    | 'Fraud & Security';
  title: string;
  sanskritTitle?: string;
  readTime: string;
  summary: string;
  simpleExplanation: string;
  howItWorks: string;
  example: string;
  formula?: string;
  commonMistakes: string;
  risks?: string;
  keyTakeaway: string;
  relatedConcepts: string[];
  beginnerFriendly: boolean;
  suggestedPrompt: string;
}

export const ACADEMY_CATEGORIES = [
  'All',
  'Money Basics',
  'Budgeting',
  'Savings',
  'Banking',
  'Investing',
  'Loans',
  'Gold Loans',
  'Insurance',
  'Taxes',
  'Credit',
  'Retirement',
  'Fraud & Security',
] as const;

export const ACADEMY_CONCEPTS: AcademyConcept[] = [
  // 1. MONEY BASICS
  {
    id: 'mb-compounding',
    category: 'Money Basics',
    title: 'Compounding & Compound Interest (Chakravriddhi)',
    sanskritTitle: 'Chakravriddhi Vyaja',
    readTime: '4 min',
    summary: 'The mathematical wonder where your interest earns interest over time, accelerating wealth creation.',
    simpleExplanation:
      'Compounding means your earnings start earning their own earnings. Instead of withdrawing your returns, you let them stay invested so the base amount grows larger with every cycle.',
    howItWorks:
      'In year one, interest is paid on your principal. In year two, interest is paid on both your principal AND your year-one interest. Over decades, this snowball effect generates the vast majority of your final wealth.',
    formula: 'A = P(1 + r/n)^(nt)',
    example:
      'If you invest ₹10,000 monthly for 20 years at an expected 12% annual return, your total invested amount is ₹24 Lakhs, but your final corpus swells to approximately ₹1 Crore due to compounding.',
    commonMistakes:
      'Waiting until age 35+ to start investing because you think your savings are "too small". A ₹2,000 SIP started at 22 often beats a ₹15,000 SIP started at 35.',
    risks: 'Compounding works against you on credit card debt and high-interest loans.',
    keyTakeaway:
      'Time in the market is vastly more powerful than timing the market. Start early, even with humble amounts.',
    relatedConcepts: ['Inflation', 'SIP', 'Pay-Yourself-First'],
    beginnerFriendly: true,
    suggestedPrompt: 'Explain how compounding works with ₹5,000 monthly SIP over 15 years',
  },
  {
    id: 'mb-inflation',
    category: 'Money Basics',
    title: 'Inflation & Purchasing Power (Mulya Hrāsa)',
    sanskritTitle: 'Mulya Hrāsa',
    readTime: '3 min',
    summary: 'Why ₹100 today buys less than ₹100 ten years ago, and how to protect your family from silent devaluation.',
    simpleExplanation:
      'Inflation is the steady rise in the price of goods and services over time. As prices increase, every rupee you possess buys a smaller percentage of a good or service.',
    howItWorks:
      'If India’s inflation averages 6% per year, an item that costs ₹1,00,000 today will cost approximately ₹1,79,000 in 10 years, and ₹3,20,000 in 20 years. Keeping cash under a mattress or in a 3% savings account actually destroys purchasing power.',
    formula: 'Future Cost = Present Cost × (1 + inflation)^years',
    example:
      'A college education costing ₹15 Lakhs today will require nearly ₹36 Lakhs when your 6-year-old child turns 18 at 7% education inflation.',
    commonMistakes:
      'Measuring investment success by nominal balance instead of real purchasing power. 7% return minus 6% inflation leaves only 1% real gain.',
    risks: 'Inflation risk affects fixed-income retirees the hardest.',
    keyTakeaway:
      'Equity and productive assets are mandatory to outpace inflation and safeguard your family’s real standard of living.',
    relatedConcepts: ['Compounding', 'Retirement', 'Purchasing Power'],
    beginnerFriendly: true,
    suggestedPrompt: 'How will 6% inflation affect my ₹50,000 monthly retirement target in 20 years?',
  },
  {
    id: 'mb-networth',
    category: 'Money Basics',
    title: 'Assets, Liabilities & True Net Worth (Artha Sanchay)',
    sanskritTitle: 'Sampatti & Rina',
    readTime: '4 min',
    summary: 'Understanding the clear distinction between what puts money in your pocket and what extracts it.',
    simpleExplanation:
      'Your net worth is your financial scoreboard: total value of what you own (assets) minus what you owe to lenders (liabilities).',
    howItWorks:
      'Assets include cash, mutual funds, gold, EPF, and real estate. Liabilities include home loans, credit card balances, car loans, and personal borrowings.',
    formula: 'Net Worth = Total Assets - Total Liabilities',
    example:
      'Aarav owns ₹70L in equity, ₹10L in bank/gold, and an apartment valued at ₹85L (Total assets: ₹1.65 Cr). He owes ₹45L on his home loan. His net worth is ₹1.20 Crore.',
    commonMistakes:
      'Assuming high salary equals high net worth. A person earning ₹30 Lakhs who spends ₹29 Lakhs on luxury EMIs has lower financial security than someone earning ₹12 Lakhs who saves diligently.',
    keyTakeaway:
      'Wealth is what you do not see: the unspent savings, growing compounding accounts, and zero toxic debt.',
    relatedConcepts: ['Cash Flow', 'Budgeting', 'Debt Management'],
    beginnerFriendly: true,
    suggestedPrompt: 'Help me calculate my personal net worth and evaluate if it is balanced',
  },

  // 2. BUDGETING
  {
    id: 'bg-50-30-20',
    category: 'Budgeting',
    title: 'The Indian 50/30/20 & Modified 30/38/15/17 Rule',
    sanskritTitle: 'Mitavyaya Vidhi',
    readTime: '4 min',
    summary: 'A disciplined framework balancing essential shelter, long-term security, and guilt-free celebration.',
    simpleExplanation:
      'Traditional budgeting allocates 50% to Needs, 30% to Wants, and 20% to Savings. In ArthSetu, we prioritize savings first (30% Savings, 38% Needs, 15% Long-term Goals, 17% Lifestyle).',
    howItWorks:
      'On salary day, the savings and goal allocations are automated before you have an opportunity to spend. Daily expenses operate within the remaining perimeter.',
    formula: 'Income = Savings (30%) + Essentials (38%) + Goals (15%) + Joy (17%)',
    example:
      'On a ₹1,00,000 salary: ₹30,000 routes into savings/buffer, ₹38,000 handles rent/ration/bills, ₹15,000 funds home purchase SIP, and ₹17,000 is available for dining and entertainment.',
    commonMistakes:
      'Trying to save whatever is left at the end of the month. Parkinson’s Law ensures that expenses rise to meet available cash unless redirected first.',
    keyTakeaway:
      'Do not save what is left after spending; spend what is left after deliberate savings.',
    relatedConcepts: ['Pay-Yourself-First', 'Zero-Based Budgeting', 'Impulse Spending'],
    beginnerFriendly: true,
    suggestedPrompt: 'Help me divide my ₹60,000 monthly income using the 50/30/20 framework',
  },

  // 3. SAVINGS
  {
    id: 'sv-emergency-fund',
    category: 'Savings',
    title: 'Aapda Kosh: Emergency Fund Calculation & Tiering',
    sanskritTitle: 'Aapda Kosh (Suraksha)',
    readTime: '5 min',
    summary: 'How to build an impenetrable 6-month safety runway structured across immediate and near-term liquidity.',
    simpleExplanation:
      'An emergency fund is money set aside strictly for true unexpected crises: sudden medical hospitalization, job transition, or urgent vehicle repairs.',
    howItWorks:
      'Calculated as 6 to 12 months of non-negotiable living expenses (rent, groceries, basic utilities, insurance premiums, essential EMIs). Divided into 3 tiers: Tier 1 (Immediate savings), Tier 2 (Liquid funds T+1), and Tier 3 (Instant sweep FDs).',
    formula: 'Aapda Kosh = Monthly Essential Expenses × (6 to 9 Months)',
    example:
      'If your essential monthly burn is ₹40,000, your 6-month emergency fund is ₹2,40,000. Keep ₹80,000 in your savings bank account and ₹1,60,000 in a low-risk overnight mutual fund.',
    commonMistakes:
      'Investing your emergency fund in stocks or crypto for higher returns. When market crashes and layoffs coincide, you are forced to sell at heavy losses.',
    keyTakeaway:
      'The purpose of an emergency fund is return OF capital, not return ON capital.',
    relatedConcepts: ['Banking', 'FD', 'Liquid Funds'],
    beginnerFriendly: true,
    suggestedPrompt: 'How much emergency fund should I keep if my salary is ₹75,000 and expenses are ₹45,000?',
  },

  // 4. BANKING
  {
    id: 'bk-fd-vs-rd',
    category: 'Banking',
    title: 'Fixed Deposits (FD) vs. Recurring Deposits (RD)',
    sanskritTitle: 'Sthira Sanchaya',
    readTime: '3 min',
    summary: 'Guaranteed capital preservation instruments under RBI deposit insurance.',
    simpleExplanation:
      'A Fixed Deposit (FD) lets you invest a lump sum for a fixed period at a locked interest rate. A Recurring Deposit (RD) lets you deposit a fixed monthly installment over a tenure.',
    howItWorks:
      'Both are protected up to ₹5,00,000 per depositor per bank by DICGC (a subsidiary of the Reserve Bank of India). Interest is taxable at your applicable income tax slab rate.',
    example:
      'Deposit ₹1,00,000 in a 1-year FD at 7.0% to receive ₹1,07,186 at maturity (compounded quarterly).',
    commonMistakes:
      'Using FDs for 15-year wealth creation goals. After tax (e.g. 30% slab) and 6% inflation, the real return of an FD is close to zero or negative.',
    keyTakeaway:
      'FDs are excellent for short-term targets under 3 years and emergency safety, but not for beat-the-clock retirement compounding.',
    relatedConcepts: ['Emergency Fund', 'Savings Account', 'Taxes'],
    beginnerFriendly: true,
    suggestedPrompt: 'Explain FD vs RD to me with real examples and tax impact',
  },

  // 5. INVESTING
  {
    id: 'inv-sip-mutual-funds',
    category: 'Investing',
    title: 'Systematic Investment Plan (SIP) in Index & Mutual Funds',
    sanskritTitle: 'Kramasho Nivesha',
    readTime: '5 min',
    summary: 'The disciplined vehicle to harness India’s economic growth without market timing anxiety.',
    simpleExplanation:
      'A Systematic Investment Plan (SIP) automatically invests a predetermined sum into a mutual fund or index fund on a chosen calendar date each month.',
    howItWorks:
      'Through Rupee Cost Averaging, when markets fall, your ₹5,000 buys more fund units. When markets rise, your accumulated units grow in value.',
    example:
      'Investing ₹5,000 monthly in a Nifty 50 Index Fund over 15 years at an annualized 12% yield generates an estimated corpus of ₹25.2 Lakhs on an outlay of ₹9 Lakhs.',
    commonMistakes:
      'Stopping your SIP when the market drops. Market corrections are the exact times your rupee buys the maximum units at a discount.',
    keyTakeaway:
      'Discipline beats genius. Set up automated ECS mandate on your salary date and let the broader economy compound for you.',
    relatedConcepts: ['Compounding', 'Index Funds', 'Equity'],
    beginnerFriendly: true,
    suggestedPrompt: 'How should a beginner start their first SIP in mutual funds?',
  },

  // 6. LOANS
  {
    id: 'ln-emi-debt',
    category: 'Loans',
    title: 'Understanding EMI, Principal, Interest & Debt-to-Income',
    sanskritTitle: 'Rina Niyama',
    readTime: '4 min',
    summary: 'The true cost of borrowing and keeping your monthly obligations under the safe 40% threshold.',
    simpleExplanation:
      'Equated Monthly Installment (EMI) consists of two parts: interest on the outstanding loan and principal repayment. In the early years, the majority of your payment goes towards interest.',
    howItWorks:
      'Your Debt-to-Income (DTI) ratio is your total monthly EMI payments divided by your gross monthly income. Lenders consider DTI above 40-50% high risk.',
    formula: 'DTI Ratio = (Total Monthly EMIs / Gross Monthly Income) × 100',
    example:
      'If you earn ₹1,00,000 and pay ₹28,000 home loan EMI plus ₹7,000 car EMI, your DTI is 35% (Healthy range).',
    commonMistakes:
      'Borrowing personal loans or credit card EMIs for depreciating lifestyle items like gadgets and vacations.',
    keyTakeaway:
      'Keep your total EMIs well below 40% of income to avoid financial strangulation during emergencies.',
    relatedConcepts: ['Credit Score', 'Gold Loans', 'Foreclosure'],
    beginnerFriendly: true,
    suggestedPrompt: 'My salary is ₹50,000 and I have ₹18,000 EMIs. How can I manage my debt?',
  },

  // 7. GOLD LOANS (Detailed section)
  {
    id: 'gl-gold-loan-guide',
    category: 'Gold Loans',
    title: 'What is a Gold Loan and How Does It Work? (Swarna Rina)',
    sanskritTitle: 'Swarna Rina Vidhana',
    readTime: '5 min',
    summary: 'A complete, transparent guide to securing liquid cash against gold jewelry without falling into auction traps.',
    simpleExplanation:
      'A gold loan is a secured loan where you pledge your gold jewelry or coins to a regulated bank or NBFC as collateral in exchange for instant funds.',
    howItWorks:
      'The lender tests the purity (usually 18 to 22 carats) and weighs the gold (excluding gemstones). By RBI guidelines, lenders can loan up to 75% of the market value of the gold. This is known as Loan-to-Value (LTV).',
    formula: 'Maximum Loan = Gold Weight (Net) × Current Gold Rate × LTV (Max 75%)',
    example:
      'If your 22-carat gold jewelry has a net gold value of ₹2,00,000, a bank can offer you a loan of up to ₹1,50,000 (75% LTV) at 8.5% to 11% annual interest.',
    commonMistakes:
      'Ignoring the auction clause. If gold prices fall sharply and you do not pay interest on time, the lender issues a notice and auctions your family jewelry to recover the balance.',
    risks: 'Loss of heirloom jewelry if repayments are neglected; margin calls during sharp gold market drops.',
    keyTakeaway:
      'Gold loans offer cheaper and faster access to emergency funds than uncollateralized personal loans, but you must have a clear repayment plan to protect your pledged jewelry.',
    relatedConcepts: ['Loans', 'Collateral', 'Interest Rates'],
    beginnerFriendly: true,
    suggestedPrompt: 'Explain gold loans, how interest is calculated, and what happens if I cannot pay on time',
  },

  // 8. INSURANCE
  {
    id: 'ins-term-vs-endowment',
    category: 'Insurance',
    title: 'Term Life vs. Endowment Plans: Protection vs. Investment',
    sanskritTitle: 'Bima Siddhantha',
    readTime: '4 min',
    summary: 'Why you should never mix insurance with investment, and why Pure Term Insurance is the only true shield.',
    simpleExplanation:
      'Insurance is protection, not an investment. Its sole purpose is to replace your economic value for your family if you pass away prematurely.',
    howItWorks:
      'A Pure Term Plan gives massive cover (e.g. ₹1 to 2 Crore) for a modest annual premium (e.g. ₹12,000/yr). If you survive the term, there is no maturity payout. Endowment or ULIP plans return your money with low yields (~4-5%) while giving minimal life cover.',
    example:
      'A 30-year-old non-smoker can secure ₹1.5 Crore term life cover until age 60 for approximately ₹1,100 per month. The remaining money can be invested in index funds to create wealth.',
    commonMistakes:
      'Buying an endowment/money-back policy with a ₹5 Lakh cover thinking "at least I get my money back". ₹5 Lakhs is insufficient to support a family for more than two years.',
    keyTakeaway:
      'Buy pure term insurance for 15-20x your annual income, pure health insurance for medical emergencies, and invest the rest separately.',
    relatedConcepts: ['Emergency Fund', 'Health Insurance', 'Retirement'],
    beginnerFriendly: true,
    suggestedPrompt: 'Explain term insurance vs endowment plans in simple terms with calculations',
  },

  // 9. TAXES
  {
    id: 'tx-new-vs-old-regime',
    category: 'Taxes',
    title: 'New vs. Old Income Tax Regime (Section 115BAC)',
    sanskritTitle: 'Kara Niyojana',
    readTime: '5 min',
    summary: 'Navigating India’s income tax slabs, standard deductions, and selecting the optimal regime.',
    simpleExplanation:
      'The New Tax Regime offers lower slab rates and a ₹75,000 standard deduction with zero documentation hassle. The Old Tax Regime allows deductions under 80C (PPF/ELSS), 80D (Health Insurance), and HRA.',
    howItWorks:
      'For most salaried professionals earning up to ₹25-30 Lakhs without massive home loan interest, the New Tax Regime provides superior net take-home pay and simpler compliance.',
    example:
      'On a CTC of ₹15 Lakhs, the New Regime taxes approximately ₹1,05,000. Under the Old Regime, you would need over ₹3.75 Lakhs in eligible deductions to match the New Regime’s savings.',
    commonMistakes:
      'Locking money into suboptimal insurance policies or lock-in products purely for 80C tax saving without checking the net return.',
    keyTakeaway:
      'Evaluate your deductions mathematically before choosing. For most taxpayers, the New Tax Regime is simpler and more lucrative.',
    relatedConcepts: ['Salary', 'Deductions', 'EPF'],
    beginnerFriendly: true,
    suggestedPrompt: 'Should I choose the New Tax Regime or Old Tax Regime for my ₹12 Lakh salary?',
  },

  // 10. CREDIT
  {
    id: 'cr-cibil-score',
    category: 'Credit',
    title: 'CIBIL & Credit Score: Building and Protecting a 750+ Rating',
    sanskritTitle: 'Rina Vishvasata',
    readTime: '4 min',
    summary: 'How credit utilization and repayment track records determine your loan eligibility and interest rates.',
    simpleExplanation:
      'Your credit score is a 3-digit number (300 to 900) that indicates your creditworthiness to lenders. A score above 750 unlocks lower interest rates on home and vehicle loans.',
    howItWorks:
      'Determined by 5 factors: 1. Payment history (35%), 2. Credit utilization under 30% (30%), 3. Credit history length (15%), 4. Credit mix (10%), and 5. Recent hard inquiries (10%).',
    example:
      'If your credit card limit is ₹1,00,000, spending less than ₹30,000 per billing cycle keeps your credit utilization healthy.',
    commonMistakes:
      'Paying only the "Minimum Amount Due" on credit card bills. The remaining unpaid balance incurs 36% to 44% annual interest compounding daily.',
    keyTakeaway:
      'Always pay your total credit card bill in full on time. Treat a credit card as a convenience tool, not an emergency loan.',
    relatedConcepts: ['Credit Cards', 'Loans', 'Debt Management'],
    beginnerFriendly: true,
    suggestedPrompt: 'How can I improve my CIBIL score from 680 to 750+ quickly?',
  },

  // 11. RETIREMENT
  {
    id: 'rt-swatantrata-corpus',
    category: 'Retirement',
    title: 'Retirement Corpus Calculation (Swatantrata)',
    sanskritTitle: 'Moksha & Swatantrata',
    readTime: '5 min',
    summary: 'Using the 25x and 30x rule adjusted for Indian inflation to achieve lifelong financial independence.',
    simpleExplanation:
      'Retirement does not mean stopping work; it means reaching the stage where working is an intentional choice rather than an economic survival requirement.',
    howItWorks:
      'Calculate your expected annual expenses at retirement. Multiply by 25 to 30 to determine your target corpus. Utilizing a safe withdrawal rate of 3.5% to 4% preserves capital indefinitely.',
    formula: 'Target Corpus = (Current Annual Expenses × Inflation Factor) × 30',
    example:
      'If you spend ₹60,000/mo today, in 20 years at 6% inflation your monthly need will be ₹1,92,000 (Annual: ₹23 Lakhs). A 30x corpus requires approximately ₹6.9 Crore.',
    commonMistakes:
      'Relying solely on EPF without personal equity mutual funds or NPS allocations.',
    keyTakeaway:
      'Retirement is the only goal you cannot get an education loan for. Prioritize it early alongside your children’s education.',
    relatedConcepts: ['Compounding', 'EPF', 'NPS'],
    beginnerFriendly: false,
    suggestedPrompt: 'Calculate my retirement corpus if I am 32 and spend ₹50,000 per month',
  },

  // 12. FRAUD & SECURITY
  {
    id: 'fr-upi-phishing-safety',
    category: 'Fraud & Security',
    title: 'Protecting Yourself from UPI, OTP & Digital Banking Scams',
    sanskritTitle: 'Suraksha & Satarkata',
    readTime: '4 min',
    summary: 'The cardinal rules of digital financial hygiene to protect your hard-earned bank balances.',
    simpleExplanation:
      'Digital scammers rely on social engineering, fear, and urgency to trick victims into sharing secret credentials or authorizing fraudulent transfers.',
    howItWorks:
      'Scammers impersonate electricity boards, bank officials, courier delivery agents, or police officers on fake video calls. They ask you to enter your UPI PIN to "receive a lottery" or "unblock your electricity connection".',
    example:
      'Remember: You NEVER enter your UPI PIN to receive money. UPI PIN is exclusively entered to DEBIT money from your bank account.',
    commonMistakes:
      'Sharing an OTP or clicking remote screen-sharing apps (AnyDesk, TeamViewer) at the request of an unknown caller.',
    keyTakeaway:
      'NEVER share your OTP, UPI PIN, ATM PIN, CVV, or passwords with ANYONE, including your bank manager.',
    relatedConcepts: ['Banking', 'UPI', 'Cyber Hygiene'],
    beginnerFriendly: true,
    suggestedPrompt: 'What are the most common financial scams in India and how can I stay protected?',
  },
];
