import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// -------------------------------------------------------------
// SECURE IN-MEMORY / PERSISTENT AUTH STORE
// -------------------------------------------------------------
interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastPasswordChange: string;
}

interface Session {
  token: string;
  userId: string;
  createdAt: string;
  userAgent: string;
  ip: string;
  expiresAt: number;
}

const users: Map<string, UserAccount> = new Map();
const sessions: Map<string, Session> = new Map();
const loginAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();
const resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();

// Hash password with crypto.scrypt
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Seed default user for seamless experience
const defaultSalt = crypto.randomBytes(16).toString('hex');
const defaultUser: UserAccount = {
  id: 'usr-default-1',
  name: 'Shristi Bajpai',
  email: 'shristiajeetbajpai@gmail.com',
  passwordHash: hashPassword('ArthSetu@2025!', defaultSalt),
  salt: defaultSalt,
  createdAt: new Date().toISOString(),
  lastPasswordChange: new Date().toISOString(),
};
users.set(defaultUser.email.toLowerCase(), defaultUser);

// Auth Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['arthsetu_session'] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    res.clearCookie('arthsetu_session');
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const user = Array.from(users.values()).find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

// -------------------------------------------------------------
// AUTHENTICATION API ENDPOINTS
// -------------------------------------------------------------

// Sign Up
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are mandatory.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Strong password check
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasNumber) {
    return res.status(400).json({
      error: 'Password must contain uppercase, lowercase letters, and at least one number.',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (users.has(normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    lastPasswordChange: new Date().toISOString(),
  };

  users.set(normalizedEmail, newUser);

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionToken, {
    token: sessionToken,
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Browser Client',
    ip: req.ip || '127.0.0.1',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.cookie('arthsetu_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    message: 'Welcome to ArthSetu! Account created securely.',
  });
});

// Login with Rate Limiting Brute-Force Protection
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || '127.0.0.1';
  const key = `${ip}_${(email || '').toLowerCase().trim()}`;

  const attempt = loginAttempts.get(key);
  if (attempt && attempt.lockedUntil > Date.now()) {
    const remainingSecs = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${remainingSecs} seconds.`,
    });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.get(normalizedEmail);

  if (!user) {
    // Record failed attempt
    const current = attempt ? attempt.count + 1 : 1;
    loginAttempts.set(key, {
      count: current,
      lockedUntil: current >= 5 ? Date.now() + 5 * 60 * 1000 : 0,
    });
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const computedHash = hashPassword(password, user.salt);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(user.passwordHash, 'hex')
  );

  if (!isValid) {
    const current = attempt ? attempt.count + 1 : 1;
    loginAttempts.set(key, {
      count: current,
      lockedUntil: current >= 5 ? Date.now() + 5 * 60 * 1000 : 0,
    });
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Clear failed attempts on success
  loginAttempts.delete(key);

  const sessionToken = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionToken, {
    token: sessionToken,
    userId: user.id,
    createdAt: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Browser Client',
    ip: req.ip || '127.0.0.1',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  res.cookie('arthsetu_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    message: 'Logged in successfully.',
  });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies['arthsetu_session'];
  if (token) sessions.delete(token);
  res.clearCookie('arthsetu_session');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Current User Profile & Session info
app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = req.cookies['arthsetu_session'];
  if (!token) {
    // Return default guest/demo user if not logged in
    return res.json({
      user: {
        id: defaultUser.id,
        name: defaultUser.name,
        email: defaultUser.email,
        isGuest: true,
      },
    });
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    return res.json({
      user: {
        id: defaultUser.id,
        name: defaultUser.name,
        email: defaultUser.email,
        isGuest: true,
      },
    });
  }

  const user = Array.from(users.values()).find((u) => u.id === session.userId);
  if (!user) {
    return res.json({
      user: {
        id: defaultUser.id,
        name: defaultUser.name,
        email: defaultUser.email,
        isGuest: true,
      },
    });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      lastPasswordChange: user.lastPasswordChange,
      isGuest: false,
    },
  });
});

// Change Password
app.post('/api/auth/change-password', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new passwords are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const computedHash = hashPassword(currentPassword, user.salt);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(user.passwordHash, 'hex')
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Current password does not match.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.salt = newSalt;
  user.lastPasswordChange = new Date().toISOString();

  return res.json({ success: true, message: 'Password changed successfully.' });
});

// Active Sessions
app.get('/api/auth/sessions', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const currentToken = (req as any).session.token;

  const userSessions = Array.from(sessions.values())
    .filter((s) => s.userId === user.id)
    .map((s) => ({
      id: s.token.slice(0, 10),
      createdAt: s.createdAt,
      userAgent: s.userAgent,
      isCurrent: s.token === currentToken,
    }));

  return res.json({ sessions: userSessions });
});

// Logout All Other Sessions
app.post('/api/auth/logout-all', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const currentToken = (req as any).session.token;

  let clearedCount = 0;
  for (const [token, session] of sessions.entries()) {
    if (session.userId === user.id && token !== currentToken) {
      sessions.delete(token);
      clearedCount++;
    }
  }

  return res.json({ success: true, message: `Terminated ${clearedCount} active sessions.` });
});

// Forgot Password (Security: Does not reveal user existence)
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const normalized = email.toLowerCase().trim();
  const resetToken = crypto.randomBytes(24).toString('hex');
  resetTokens.set(resetToken, { email: normalized, expiresAt: Date.now() + 60 * 60 * 1000 });

  return res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been dispatched.',
    // For local dev convenience
    devResetToken: resetToken,
  });
});

// Reset Password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required.' });
  }

  const record = resetTokens.get(token);
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Reset token is invalid or has expired.' });
  }

  const user = users.get(record.email);
  if (!user) {
    return res.status(400).json({ error: 'Account not found.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.salt = newSalt;
  user.lastPasswordChange = new Date().toISOString();
  resetTokens.delete(token);

  return res.json({ success: true, message: 'Password reset successfully. You may now log in.' });
});

// Delete Account
app.post('/api/auth/delete-account', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password confirmation required to delete account.' });
  }

  const computedHash = hashPassword(password, user.salt);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(user.passwordHash, 'hex')
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password. Account deletion aborted.' });
  }

  users.delete(user.email.toLowerCase());
  for (const [token, s] of sessions.entries()) {
    if (s.userId === user.id) sessions.delete(token);
  }

  res.clearCookie('arthsetu_session');
  return res.json({ success: true, message: 'Your ArthSetu account and data have been permanently deleted.' });
});

// -------------------------------------------------------------
// AI FINANCIAL ASSISTANT & KNOWLEDGE ENGINE (GEMINI, GPT, GROK)
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history,
      context,
      mode = 'standard',
      problemMode = false,
      provider = 'gemini',
      apiKey: customApiKey,
      model: requestedModel,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (message.length > 3000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 3000 characters.' });
    }

    // Construct system instructions emphasizing Indian financial wisdom & structured responses
    const isBeginner = mode === 'beginner';
    const systemPrompt = `You are ArthSetu AI — a mindful, wise, compassionate Indian personal finance companion rooted in both ancient financial wisdom (Artha, Mitavyaya, Nirbhaya, Purusharthas) and modern Indian financial realities (SIPs, Emergency Funds, New vs Old Tax Regimes, CIBIL, Account Aggregators).

Persona Guidelines:
- Tone: Serene, respectful, encouraging, clear, and mathematically sound.
- Language: English with culturally resonant Indian terms (Lakh, Crore, SIP, Ann, Aavashyak, Aanand, Kosh) explained where needed.
- Currency: Always use Indian Rupees (₹) and Indian numbering (e.g. ₹1,00,000, ₹50,000).
${isBeginner ? '- Mode: EXPLAIN LIKE I AM NEW TO FINANCE. Strictly zero jargon. Use clear analogies, practical daily examples, and warm step-by-step guidance.' : '- Mode: ADVANCED FINANCIAL ARCHITECT. Include exact formulas, risk-return ratios, opportunity cost, and tax considerations.'}

Safety & Regulatory Compliance:
- You are an educational and financial planning assistant, NOT a licensed SEBI investment advisor.
- Do NOT provide speculative buy/sell advice for individual stocks or promise guaranteed returns.
- Always include helpful trade-offs, assumptions, and risks.

${problemMode ? `CRITICAL STRUCTURE REQUIREMENT: The user is solving a specific financial dilemma. You MUST structure your answer with these clear uppercase sections:
YOUR SITUATION: (Empathetically state what the user is experiencing)
WHAT IT MEANS: (Explain the underlying economic or behavioral financial concept)
YOUR NUMBERS: (Demonstrate exact rupee math, deficits, or allocation breakdowns)
POSSIBLE APPROACHES: (Option A, Option B, Option C with realistic trade-offs)
TRADE-OFFS: (Clear risks and benefits of each choice)
NEXT STEPS: (Actionable checklist for today)
LEARN MORE: (Related topics to explore in ArthSetu Academy)` : ''}

${context ? `USER AUTHORIZED FINANCIAL CONTEXT (Authorized via explicit user consent):
- User Name: ${context.name || 'Friend'}
- In-Hand Monthly Income: ₹${context.monthlyIncome || 0}
- Total Monthly Expenses: ₹${context.totalExpenses || 0}
- Essential Needs: ₹${context.totalNeeds || 0}
- Discretionary Wants: ₹${context.totalWants || 0}
- Net Monthly Savings: ₹${context.savings || 0} (Rate: ${context.savingsRate || 0}%)
- Emergency Fund: ₹${context.emergencyFund || 0} (${context.emergencyMonths || 0} months runway)
- Active Goals: ${context.goalsSummary || 'None active'}
- Financial Health Score: ${context.healthScore || 0}/100
Please personalize your calculations and insights using these actual numbers.` : 'No personal financial data attached. Answer generally using standard Indian financial principles.'}`;

    // 1. OPENAI GPT PROVIDER
    if (provider === 'openai') {
      const openAiKey = customApiKey || process.env.OPENAI_API_KEY;
      if (openAiKey && !openAiKey.startsWith('MY_')) {
        try {
          const messages = [{ role: 'system', content: systemPrompt }];
          if (Array.isArray(history)) {
            for (const h of history.slice(-6)) {
              messages.push({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.text,
              });
            }
          }
          messages.push({ role: 'user', content: message });

          const targetModel = requestedModel || 'gpt-4o';
          const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              messages,
              temperature: 0.6,
            }),
            signal: AbortSignal.timeout(8000),
          });

          if (oaiRes.ok) {
            const data = await oaiRes.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              return res.json({ reply, provider: 'openai', model: targetModel });
            }
          } else {
            const errBody = await oaiRes.text();
            console.warn('OpenAI API returned non-200:', oaiRes.status, errBody);
          }
        } catch (oaiErr: any) {
          console.error('OpenAI fetch error:', oaiErr?.message || oaiErr);
        }
      }
    }

    // 2. xAI GROK PROVIDER
    if (provider === 'grok') {
      const grokKey = customApiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
      if (grokKey && !grokKey.startsWith('MY_')) {
        try {
          const messages = [{ role: 'system', content: systemPrompt }];
          if (Array.isArray(history)) {
            for (const h of history.slice(-6)) {
              messages.push({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.text,
              });
            }
          }
          messages.push({ role: 'user', content: message });

          const targetModel = requestedModel || 'grok-2';
          const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${grokKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              messages,
              temperature: 0.6,
            }),
            signal: AbortSignal.timeout(8000),
          });

          if (grokRes.ok) {
            const data = await grokRes.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              return res.json({ reply, provider: 'grok', model: targetModel });
            }
          } else {
            const errBody = await grokRes.text();
            console.warn('xAI Grok API returned non-200:', grokRes.status, errBody);
          }
        } catch (grokErr: any) {
          console.error('xAI Grok fetch error:', grokErr?.message || grokErr);
        }
      }
    }

    // 3. GOOGLE GEMINI PROVIDER (DEFAULT)
    const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.startsWith('MY_')) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const formattedContents = [];

        // Add history if present
        if (Array.isArray(history)) {
          for (const h of history.slice(-6)) {
            formattedContents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            });
          }
        }

        formattedContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const targetModel = requestedModel || 'gemini-3.8-flash';
        const generatePromise = ai.models.generateContent({
          model: targetModel,
          contents: formattedContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.6,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 4500)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);

        const reply = response.text || 'I am reflecting on your financial question. Could you provide a bit more detail?';
        return res.json({ reply, provider: 'gemini', model: targetModel });
      } catch (aiErr: any) {
        console.error('Gemini API call error:', aiErr?.message || aiErr);
      }
    }

    // 4. HIGH-FIDELITY FALLBACK ENGINE (If external network unavailable or keys unconfigured)
    const fallbackResponse = generateFinancialInsightFallback(message, context, problemMode, isBeginner);
    return res.json({
      reply: fallbackResponse,
      provider: provider || 'gemini',
      model: 'system-financial-engine',
    });
  } catch (error: any) {
    console.error('AI Chatbot endpoint error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while generating financial wisdom. Please try again.',
    });
  }
});

function generateFinancialInsightFallback(
  prompt: string,
  context: any,
  isProblem: boolean,
  isBeginner: boolean
): string {
  const p = prompt.toLowerCase();
  const income = context?.monthlyIncome || 80000;
  const expenses = context?.totalExpenses || 36000;
  const savings = Math.max(0, income - expenses);

  if (p.includes('gold loan') || p.includes('gold')) {
    return `### Swarna Rina (Gold Loan) Guidance

**What It Means**: A gold loan is a secured credit facility where you pledge personal gold ornaments to an RBI-regulated bank or NBFC in exchange for liquid cash.

**Key Mechanics**:
- **LTV Ratio**: Under RBI directives, lenders can advance up to 75% of the net market value of your 18k–22k gold.
- **Interest Rates**: Typically 8.5% to 12.0% p.a., notably lower than unsecured personal loans (13%–24%).
- **Crucial Risk**: If gold spot prices decline sharply or interest defaults accumulate, the lender may issue a margin call notice and auction your pledged jewelry.

**Suggested Approach**:
1. Use only for short-term emergency liquidity (3–12 months) with a firm repayment blueprint.
2. Confirm the lender is an RBI-regulated commercial bank or established NBFC with insured custodial vaults.
3. Compare against liquidating an existing liquid fund or sweep FD before pledging family heirlooms.`;
  }

  if (p.includes('emergency') || p.includes('aapda')) {
    const targetFund = (context?.totalNeeds || 28000) * 6;
    return `### Aapda Kosh (Emergency Runway) Blueprint

**Your Numbers**:
- Essential Monthly Outflow: ₹${(context?.totalNeeds || 28000).toLocaleString('en-IN')}
- Recommended 6-Month Shield: ₹${targetFund.toLocaleString('en-IN')}
- Current Buffer: ₹${(context?.emergencyFund || 0).toLocaleString('en-IN')}

**Trishul Staggered Architecture**:
1. **Tier 1 (Immediate Liquidity - 35%)**: High-yield savings bank account linked with UPI and instant ATM access.
2. **Tier 2 (T+1 Stability - 45%)**: Low-risk overnight and liquid mutual funds yielding ~6.8% CAGR with sovereign paper backing.
3. **Tier 3 (Instant Breakable - 20%)**: Multi-option sweep fixed deposit providing ~7.1% yield with zero market volatility.

**Next Steps**:
Automate a monthly transfer of ₹${Math.ceil(Math.max(1000, (targetFund - (context?.emergencyFund || 0)) / 6)).toLocaleString('en-IN')} on salary day to close any deficit within 6 months.`;
  }

  if (isProblem || p.includes('left') || p.includes('earn') || p.includes('spend')) {
    return `YOUR SITUATION
You are evaluating how to allocate and balance your monthly cash flow with discipline and clear boundaries.

WHAT IT MEANS
In Vedic financial wisdom (*Mitavyaya*), money is treated as a river (*Pravaha*). When directed by firm banks, it nourishes your household; when left unallocated, it dissipates through impulse expenditures.

YOUR NUMBERS
- Estimated In-Hand Income: ₹${income.toLocaleString('en-IN')}
- Monthly Essential Outflow: ₹${expenses.toLocaleString('en-IN')}
- Retained Discretionary Surplus: ₹${savings.toLocaleString('en-IN')}

POSSIBLE APPROACHES
- Option A (Safety First): Route 60% of surplus (₹${Math.round(savings * 0.6).toLocaleString('en-IN')}) into Aapda Kosh and 40% into active goals.
- Option B (Balanced 50/30/20): Allocate ₹${Math.round(income * 0.3).toLocaleString('en-IN')} to savings first, ₹${Math.round(income * 0.38).toLocaleString('en-IN')} to essentials, and ₹${Math.round(income * 0.17).toLocaleString('en-IN')} to mindful living.
- Option C (Aggressive Compounding): Deploy surplus into a broad-market index fund SIP if emergency buffer is already 6 months secure.

TRADE-OFFS
Prioritizing emergency liquidity protects you from high-interest personal loans during sudden downturns. Skipping the buffer for higher stock returns leaves you vulnerable to forced selling at market lows.

NEXT STEPS
1. Verify essential rent and ration are satisfied.
2. Set an auto-sweep ECS mandate on the 5th of every month.
3. Keep lifestyle spending bounded within the designated bucket.

LEARN MORE
Review the *50/30/20 Rule for India* and *Aapda Kosh* treatises in ArthSetu Academy.`;
  }

  return `### Mindful Financial Guidance from ArthSetu AI

Thank you for your question. As your personal money companion, I evaluate all decisions through the lens of long-term financial freedom (*Swatantrata*) and daily peace of mind (*Shanti*).

**Guiding Principles**:
1. **Pay Yourself First**: Never save what is left after spending; spend what is left after deliberate 30% savings.
2. **Fortress Protection**: Maintain an emergency runway of 6 months essential expenses before pursuing aggressive investments.
3. **Pravaha Discipline**: Classify every outflow into Aavashyak (Essential Need) vs. Aanand (Discretionary Want).

Feel free to ask about budgeting frameworks, gold loans, FDs, mutual fund SIPs, or enter a real scenario like *"I have ₹15,000 left until salary day"*.`;
}

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC ASSETS SERVING
// -------------------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArthSetu full-stack platform listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to initialize server:', err);
});
