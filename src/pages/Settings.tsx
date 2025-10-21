import { useState, useEffect } from 'react';
import { User, Mail, Bell, Shield, CreditCard, Save, Loader, Check, X, Settings as SettingsIcon, Palette } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  AppearancePreferences,
  DEFAULT_PREFERENCES,
  THEME_COLORS,
  getUserAppearancePreferences,
  saveAppearancePreferences
} from '../lib/appearance';

interface UserProfile {
  full_name: string;
  avatar_url: string;
  bio: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
}

interface Subscription {
  id: string;
  plan_name: string;
  plan_slug?: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'subscription' | 'appearance'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    avatar_url: '',
    bio: '',
    notification_preferences: {
      email: true,
      push: false
    }
  });

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [appearancePrefs, setAppearancePrefs] = useState<AppearancePreferences>({
    ...DEFAULT_PREFERENCES,
    user_id: user?.id || ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSubscription();
      loadAppearancePreferences();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
    } else if (data) {
      setProfile(data);
    }
  };

  const loadSubscription = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error loading subscription:', error);
    } else {
      setSubscription(data);
    }
  };

  const loadAppearancePreferences = async () => {
    if (!user) return;
    const prefs = await getUserAppearancePreferences(user.id);
    if (prefs) {
      setAppearancePrefs(prefs);
    }
  };

  const saveAppearance = async () => {
    if (!user) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const result = await saveAppearancePreferences(user.id, appearancePrefs);

    if (result.success) {
      setSuccessMessage('Appearance settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(result.error || 'Failed to save appearance settings');
    }

    setIsSaving(false);
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (error) {
      setErrorMessage('Failed to save profile');
      console.error('Error saving profile:', error);
    } else {
      setSuccessMessage('Profile saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    setIsSaving(false);
  };

  const updateEmail = async () => {
    if (!newEmail) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage('Email update initiated. Please check your inbox to confirm.');
      setNewEmail('');
      setTimeout(() => setSuccessMessage(''), 5000);
    }

    setIsSaving(false);
  };

  const updatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    setIsSaving(false);
  };

  const cancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', subscription.id);

    if (error) {
      setErrorMessage('Failed to cancel subscription');
    } else {
      setSuccessMessage('Subscription will be canceled at the end of the billing period');
      loadSubscription();
    }

    setIsSaving(false);
  };

  const reactivateSubscription = async () => {
    if (!subscription) return;

    setIsSaving(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: false })
      .eq('id', subscription.id);

    if (error) {
      setErrorMessage('Failed to reactivate subscription');
    } else {
      setSuccessMessage('Subscription reactivated successfully');
      loadSubscription();
    }

    setIsSaving(false);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'account' as const, label: 'Account', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'subscription' as const, label: 'Subscription', icon: CreditCard }
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-slate-400 ml-14">Manage your account preferences and settings</p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-sm">
            <div className="p-1 bg-green-500/20 rounded-lg">
              <Check className="w-5 h-5" />
            </div>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-sm">
            <div className="p-1 bg-red-500/20 rounded-lg">
              <X className="w-5 h-5" />
            </div>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-2 sticky top-24 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sm:p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
                    <p className="text-slate-400">Update your personal information and profile details</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Avatar URL</label>
                      <input
                        type="url"
                        value={profile.avatar_url}
                        onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <button
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                    >
                      {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
                    <p className="text-slate-400">Manage your account security and preferences</p>
                  </div>

                  <div className="border-b border-slate-700 pb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Change Email</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Current Email</label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">New Email</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder="new@example.com"
                        />
                      </div>
                      <button
                        onClick={updateEmail}
                        disabled={isSaving || !newEmail}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-cyan-500/30"
                      >
                        {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                        Update Email
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        onClick={updatePassword}
                        disabled={isSaving || !newPassword || newPassword !== confirmPassword}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-cyan-500/30"
                      >
                        {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                    <p className="text-slate-400">Choose how you want to be notified about updates</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-cyan-500/30 transition-all">
                      <div>
                        <h3 className="font-medium text-white mb-1">Email Notifications</h3>
                        <p className="text-sm text-slate-400">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() =>
                          setProfile({
                            ...profile,
                            notification_preferences: {
                              ...profile.notification_preferences,
                              email: !profile.notification_preferences.email
                            }
                          })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          profile.notification_preferences.email
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                            profile.notification_preferences.email ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-cyan-500/30 transition-all">
                      <div>
                        <h3 className="font-medium text-white mb-1">Push Notifications</h3>
                        <p className="text-sm text-slate-400">Receive push notifications in your browser</p>
                      </div>
                      <button
                        onClick={() =>
                          setProfile({
                            ...profile,
                            notification_preferences: {
                              ...profile.notification_preferences,
                              push: !profile.notification_preferences.push
                            }
                          })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          profile.notification_preferences.push
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                            profile.notification_preferences.push ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                  >
                    {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Preferences
                  </button>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Appearance Settings</h2>
                    <p className="text-slate-400">Customize the look and feel of the application</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['light', 'dark', 'auto'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setAppearancePrefs({ ...appearancePrefs, theme })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              appearancePrefs.theme === theme
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                                : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-lg font-semibold text-white capitalize mb-1">{theme}</div>
                              <div className="text-xs text-slate-400">
                                {theme === 'light' && 'Always use light mode'}
                                {theme === 'dark' && 'Always use dark mode'}
                                {theme === 'auto' && 'Match system preference'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Color Theme</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {THEME_COLORS.map((colorTheme) => (
                          <button
                            key={colorTheme.name}
                            onClick={() =>
                              setAppearancePrefs({
                                ...appearancePrefs,
                                primary_color: colorTheme.primary,
                                accent_color: colorTheme.accent
                              })
                            }
                            className={`p-4 rounded-xl border-2 transition-all ${
                              appearancePrefs.primary_color === colorTheme.primary
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                                : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-white">{colorTheme.name}</span>
                              {appearancePrefs.primary_color === colorTheme.primary && (
                                <Check className="w-4 h-4 text-cyan-400" />
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <div
                                className="flex-1 h-8 rounded-lg shadow-md"
                                style={{ backgroundColor: colorTheme.primary }}
                              />
                              <div
                                className="flex-1 h-8 rounded-lg shadow-md"
                                style={{ backgroundColor: colorTheme.accent }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Font Size</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setAppearancePrefs({ ...appearancePrefs, font_size: size })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              appearancePrefs.font_size === size
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                                : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                            }`}
                          >
                            <div className="text-center">
                              <div
                                className={`font-semibold text-white capitalize mb-1 ${
                                  size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-base'
                                }`}
                              >
                                {size}
                              </div>
                              <div className="text-xs text-slate-400">
                                {size === 'small' && '14px base size'}
                                {size === 'medium' && '16px base size'}
                                {size === 'large' && '18px base size'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-cyan-500/30 transition-all">
                      <div>
                        <h3 className="font-medium text-white mb-1">Reduced Motion</h3>
                        <p className="text-sm text-slate-400">Minimize animations for better accessibility</p>
                      </div>
                      <button
                        onClick={() =>
                          setAppearancePrefs({
                            ...appearancePrefs,
                            reduced_motion: !appearancePrefs.reduced_motion
                          })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          appearancePrefs.reduced_motion
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                            appearancePrefs.reduced_motion ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={saveAppearance}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                  >
                    {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Appearance Settings
                  </button>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Subscription Management</h2>
                    <p className="text-slate-400">Manage your subscription plan and billing</p>
                  </div>

                  {subscription ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/50 rounded-xl p-6 shadow-xl shadow-cyan-500/10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-1">{subscription.plan_name} Plan</h3>
                            <p className="text-sm text-slate-400">
                              Status: <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-400' : subscription.status === 'trialing' ? 'text-blue-400' : 'text-orange-400'}`}>
                                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                              </span>
                            </p>
                          </div>
                          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                            <CreditCard className="w-7 h-7 text-cyan-400" />
                          </div>
                        </div>
                        <div className="space-y-3 mt-4">
                          {subscription.current_period_end && (
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
                              <p className="text-sm text-slate-400 mb-1">Next Billing Date</p>
                              <p className="text-lg font-semibold text-white">
                                {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                          {subscription.cancel_at_period_end && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                              <p className="text-orange-400 font-medium text-sm">
                                Your subscription will be canceled at the end of the billing period. You'll continue to have access until {new Date(subscription.current_period_end).toLocaleDateString()}.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {subscription.plan_slug !== 'pro' && (
                          <button
                            onClick={() => navigate('/pricing')}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center gap-2 font-semibold"
                          >
                            <CreditCard className="w-5 h-5" />
                            Upgrade Plan
                          </button>
                        )}
                        {!subscription.cancel_at_period_end ? (
                          <button
                            onClick={cancelSubscription}
                            disabled={isSaving}
                            className="bg-slate-800 border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 font-semibold"
                          >
                            {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                            Cancel Subscription
                          </button>
                        ) : (
                          <button
                            onClick={reactivateSubscription}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center gap-2 font-semibold"
                          >
                            {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            Reactivate Subscription
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/pricing')}
                          className="bg-slate-800 border-2 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-cyan-500/50 px-6 py-3 rounded-lg transition-all flex items-center gap-2 font-semibold"
                        >
                          View All Plans
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-slate-900/30 border border-slate-700 rounded-xl">
                      <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl inline-flex mb-4">
                        <CreditCard className="w-16 h-16 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No Active Subscription</h3>
                      <p className="text-slate-400 mb-6">Upgrade to a premium plan to unlock all features</p>
                      <button
                        onClick={() => navigate('/pricing')}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all inline-flex items-center gap-2 font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                      >
                        <CreditCard className="w-5 h-5" />
                        View Plans
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
