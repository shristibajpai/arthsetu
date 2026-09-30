export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  lastPasswordChange?: string;
}

export interface AuthSession {
  id: string;
  createdAt: string;
  userAgent: string;
  isCurrent: boolean;
}

export const authService = {
  async getMe(): Promise<AuthUser> {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      return data.user;
    } catch {
      return {
        id: 'usr-guest-1',
        name: 'Aarav Sharma',
        email: 'shristiajeetbajpai@gmail.com',
        isGuest: true,
      };
    }
  },

  async signup(name: string, email: string, password: string, confirmPassword: string): Promise<{ user: AuthUser; message: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create account');
    return data;
  },

  async login(email: string, password: string): Promise<{ user: AuthUser; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    return data;
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string; devResetToken?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to process request');
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  async getSessions(): Promise<AuthSession[]> {
    try {
      const res = await fetch('/api/auth/sessions', { credentials: 'include' });
      if (!res.ok) return [];
      const data = await res.json();
      return data.sessions || [];
    } catch {
      return [];
    }
  },

  async logoutAll(): Promise<{ message: string }> {
    const res = await fetch('/api/auth/logout-all', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to terminate other sessions');
    return data;
  },

  async deleteAccount(password: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete account');
    return data;
  },
};
