import { useState, useEffect } from 'react';
import { Settings, Save, MessageCircle, Power, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { updateAllRankings } from '../../lib/ranking-jobs';

interface SupportSettings {
  id: string;
  is_online: boolean;
  custom_message: string;
  updated_at: string;
  updated_by: string;
}

export default function ManageSettings() {
  const [settings, setSettings] = useState<SupportSettings | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [customMessage, setCustomMessage] = useState('Online - We\'ll respond soon');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingRankings, setUpdatingRankings] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('support_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
      }

      if (data) {
        setSettings(data);
        setIsOnline(data.is_online);
        setCustomMessage(data.custom_message);
      } else {
        const { data: user } = await supabase.auth.getUser();
        const { data: newSettings, error: insertError } = await supabase
          .from('support_settings')
          .insert({
            is_online: true,
            custom_message: 'Online - We\'ll respond soon',
            updated_by: user.user?.id
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating settings:', insertError);
        } else if (newSettings) {
          setSettings(newSettings);
          setIsOnline(newSettings.is_online);
          setCustomMessage(newSettings.custom_message);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('support_settings')
        .update({
          is_online: isOnline,
          custom_message: customMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
      } else {
        alert('Settings saved successfully!');
        loadSettings();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRankings = async () => {
    setUpdatingRankings(true);
    try {
      await updateAllRankings();
      alert('All rankings updated successfully! Changes will be visible on the Top Tools page.');
    } catch (error) {
      console.error('Error updating rankings:', error);
      alert('Failed to update rankings. Please try again.');
    } finally {
      setUpdatingRankings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Admin Settings
        </h1>
        <p className="text-slate-400">
          Configure platform settings and support chat availability
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-cyan-400" />
            Support Chat Settings
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  isOnline
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                    : 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
                }`}>
                  <Power className={`w-7 h-7 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Support Chat Status</h3>
                  <p className="text-slate-400 text-sm">
                    Toggle support chat availability for users
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`relative w-20 h-10 rounded-full transition-all duration-300 ${
                  isOnline
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                    isOnline ? 'transform translate-x-10' : ''
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Status Message
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter custom status message"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-slate-500">
                This message will be displayed to users in the support chat widget
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Rankings Management
          </h2>

          <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Update Tool Rankings</h3>
              <p className="text-slate-400 text-sm mb-4">
                Manually trigger a complete update of all ranking algorithms including: All-Time Popular, Tool of the Week, Tool of the Month, Trending Now, and Rising Stars.
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mb-4">
                <p className="text-cyan-400 text-sm">
                  <strong>Note:</strong> Rankings are calculated based on views, favorites, clicks, ratings, and engagement metrics. This process may take a few moments.
                </p>
              </div>
            </div>

            <button
              onClick={handleUpdateRankings}
              disabled={updatingRankings}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${updatingRankings ? 'animate-spin' : ''}`} />
              <span>{updatingRankings ? 'Updating Rankings...' : 'Update All Rankings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
