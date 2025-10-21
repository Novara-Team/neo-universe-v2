import { useState, useEffect } from 'react';
import { User, Mail, Bell, Shield, CreditCard, Save, Loader, Check, X } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'subscription'>('profile');
  const [isLoading, setIsLoading] = useState(false);
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSubscription();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setIsLoading(true);
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
    setIsLoading(false);
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
      setCurrentPassword('');
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
    { id: 'subscription' as const, label: 'Subscription', icon: CreditCard }
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64">
          <nav className="bg-white rounded-lg shadow-md p-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                <p className="text-gray-600 mb-6">Update your personal information and profile details.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                <input
                  type="url"
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                onClick={saveProfile}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h2>
                <p className="text-gray-600 mb-6">Manage your account security and preferences.</p>
              </div>

              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Email</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Email</label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="new@example.com"
                    />
                  </div>
                  <button
                    onClick={updateEmail}
                    disabled={isSaving || !newEmail}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                    Update Email
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={updatePassword}
                    disabled={isSaving || !newPassword || newPassword !== confirmPassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
                <p className="text-gray-600 mb-6">Choose how you want to be notified about updates.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profile.notification_preferences.email ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.notification_preferences.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profile.notification_preferences.push ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.notification_preferences.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Management</h2>
                <p className="text-gray-600 mb-6">Manage your subscription plan and billing.</p>
              </div>

              {subscription ? (
                <div className="space-y-6">
                  <div className="border-2 border-blue-500 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{subscription.plan_name} Plan</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Status: <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-600' : subscription.status === 'trialing' ? 'text-blue-600' : 'text-orange-600'}`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </p>
                      </div>
                      <div className="bg-blue-600 p-3 rounded-full">
                        <CreditCard className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3 mt-4">
                      {subscription.current_period_end && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Next Billing Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      {subscription.cancel_at_period_end && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-orange-800 font-medium text-sm">
                            Your subscription will be canceled at the end of the billing period. You'll continue to have access until {new Date(subscription.current_period_end).toLocaleDateString()}.
                          </p>
                        </div>
                      )}
                      {subscription.plan_slug !== 'pro' && !subscription.cancel_at_period_end && (
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-amber-900 font-medium text-sm">
                            Upgrade to Universe Master plan for advanced analytics, priority support, and exclusive features!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {subscription.plan_slug !== 'pro' && (
                      <button
                        onClick={() => navigate('/pricing')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
                      >
                        <CreditCard className="w-5 h-5" />
                        Upgrade Plan
                      </button>
                    )}
                    {!subscription.cancel_at_period_end ? (
                      <button
                        onClick={cancelSubscription}
                        disabled={isSaving}
                        className="bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold"
                      >
                        {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                        Cancel Subscription
                      </button>
                    ) : (
                      <button
                        onClick={reactivateSubscription}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 font-semibold"
                      >
                        {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Reactivate Subscription
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/pricing')}
                      className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold"
                    >
                      View All Plans
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-6">Upgrade to a premium plan to unlock all features.</p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
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
  );
}
