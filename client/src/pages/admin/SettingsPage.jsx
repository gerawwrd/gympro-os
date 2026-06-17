import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import api from '../../api/axios';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    gymName: '',
    email: '',
    phone: '',
    currency: 'PHP (P)',
    taxRate: 5,
    openingHour: '05:00 AM',
    closingHour: '11:00 PM',
    address: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data.settings);
      } catch {
        console.error('Failed to load settings');
      }
    };
    load();
  }, []);

  const showFeedback = (setter, type, message) => {
    setter({ type, message });
    setTimeout(() => setter(null), 4000);
  };

  const handleSettingsChange = (e) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      await api.put('/settings', settings);
      showFeedback(setSettingsFeedback, 'success', 'Configuration saved successfully');
    } catch (err) {
      showFeedback(setSettingsFeedback, 'error', err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdatePassword = async () => {
    try {
      setPasswordLoading(true);
      await api.put('/settings/password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      showFeedback(setPasswordFeedback, 'success', 'Password updated successfully');
    } catch (err) {
      showFeedback(setPasswordFeedback, 'error', err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminLayout moduleName="Settings">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Configuration Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Adjust check-in schedules, currency modes, tax indices, and manage admin credentials.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Ecosystem Meta Settings */}
        <div className="col-span-2 bg-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">⚙</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Ecosystem Meta Settings
              </p>
              <p className="text-xs text-gray-400">Define metadata used in print receipts and billing invoices.</p>
            </div>
          </div>

          {settingsFeedback && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              settingsFeedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {settingsFeedback.message}
            </div>
          )}

          <div className="space-y-4">
            {/* Gym Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Gymnasium Name
                </label>
                <input
                  name="gymName"
                  value={settings.gymName}
                  onChange={handleSettingsChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Primary Email Contact
                </label>
                <input
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleSettingsChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Phone + Currency + Tax */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Facility Phone Number
                </label>
                <input
                  name="phone"
                  value={settings.phone}
                  onChange={handleSettingsChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleSettingsChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option>PHP (P)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.taxRate}
                  onChange={handleSettingsChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Scan Hours */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">
                Biometric Scan Allowed Hours (Gate Thresholds)
              </label>
              <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-xl p-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">In-Scan Opening Hour</label>
                  <input
                    name="openingHour"
                    value={settings.openingHour}
                    onChange={handleSettingsChange}
                    placeholder="05:00 AM"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">In-Scan Sunset Gate</label>
                  <input
                    name="closingHour"
                    value={settings.closingHour}
                    onChange={handleSettingsChange}
                    placeholder="11:00 PM"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Primary Facility Physical Address
              </label>
              <textarea
                name="address"
                value={settings.address}
                onChange={handleSettingsChange}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={settingsLoading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {settingsLoading ? 'Saving...' : 'Save Configuration Keys'}
            </button>
          </div>
        </div>

        {/* Terminal Credentials */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">🔒</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Terminal Credentials
              </p>
              <p className="text-xs text-gray-400">Modify key phrase to secure systems.</p>
            </div>
          </div>

          {passwordFeedback && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              passwordFeedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {passwordFeedback.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Current Safety Password
              </label>
              <input
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Set Target Safety Password
              </label>
              <input
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={passwordLoading || !passwords.currentPassword || !passwords.newPassword}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {passwordLoading ? 'Updating...' : 'Commit Credential Update'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
