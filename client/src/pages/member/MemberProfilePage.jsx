import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberLayout } from '../../components/layout/MemberLayout';
import api from '../../api/axios';

export const MemberProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
    email: user?.email || '',
    profileImage: user?.profileImage || '',
    address: user?.address || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoaded, setInvoicesLoaded] = useState(false);

  const showFeedback = (setter, type, message) => {
    setter({ type, message });
    setTimeout(() => setter(null), 4000);
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'invoices' && !invoicesLoaded) {
      try {
        const res = await api.get('/payments/my');
        setInvoices(res.data.payments);
        setInvoicesLoaded(true);
      } catch {
        console.error('Failed to load invoices');
      }
    }
  };

  const handleProfileSave = async () => {
    try {
      setProfileLoading(true);
      await refreshUser();
      await api.put('/auth/profile', profileForm);
      showFeedback(setProfileFeedback, 'success', 'Profile updated successfully');
    } catch (err) {
      showFeedback(setProfileFeedback, 'error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setPasswordLoading(true);
      await api.put('/auth/password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      showFeedback(setPasswordFeedback, 'success', 'Password updated successfully');
    } catch (err) {
      showFeedback(setPasswordFeedback, 'error', err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const planIsActive = user?.currentPlan && user?.planExpiresAt && new Date(user.planExpiresAt) > new Date();
  const daysRemaining = user?.planExpiresAt
    ? Math.max(0, Math.ceil((new Date(user.planExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <MemberLayout moduleName="Profile">
      <div className="bg-white rounded-xl p-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Welcome Back, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-xs text-gray-400">
              Athlete ID: <span className="text-blue-500 font-mono font-semibold">{user?.memberCode}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-gray-400 uppercase">Subscription Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${planIsActive ? 'bg-green-500' : 'bg-red-400'}`}></div>
              <p className="text-sm font-semibold text-gray-700">
                {planIsActive ? 'Active' : 'Expired'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Cycle Remaining</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{daysRemaining} Training days</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-1 flex mb-4">
        {[
          { key: 'profile', label: 'My Profile' },
          { key: 'invoices', label: 'Invoices' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">👤</div>
              <div>
                <p className="text-sm font-bold text-gray-900">Update Contact Card</p>
                <p className="text-xs text-gray-400">Edit contact phone lines and residence address.</p>
              </div>
            </div>

            {profileFeedback && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                profileFeedback.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>{profileFeedback.message}</div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Telephone Number</label>
                  <input value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email Address</label>
                  <input type="email" value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Profile Image Path / URL</label>
                <input value={profileForm.profileImage}
                  onChange={(e) => setProfileForm((p) => ({ ...p, profileImage: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Primary Residence Address</label>
                <textarea value={profileForm.address}
                  onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              </div>
              <button onClick={handleProfileSave} disabled={profileLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {profileLoading ? 'Saving...' : 'Save Profile Particulars'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">⚙</div>
              <div>
                <p className="text-sm font-bold text-gray-900">Adjust Safety Password</p>
                <p className="text-xs text-gray-400">Change authentication passcode keys.</p>
              </div>
            </div>

            {passwordFeedback && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                passwordFeedback.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>{passwordFeedback.message}</div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Current Safety Password</label>
                <input type="password" value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Set Target Safety Password</label>
                <input type="password" value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <button onClick={handlePasswordUpdate}
                disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50">
                {passwordLoading ? 'Updating...' : 'Confirm Passphrase Updating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Invoice Billing Ledger</p>
            <p className="text-xs text-gray-400 mt-0.5">Summary index of past billing tickets and dues matches.</p>
          </div>
          <div className="grid grid-cols-5 px-6 py-3 bg-gray-50 border-b border-gray-100">
            {['Receipt Ref No', 'Billed Contract Plan', 'Billed Date', 'Billing Route', 'Invoice Sum'].map((h) => (
              <p key={h} className="text-xs font-semibold text-gray-400 uppercase">{h}</p>
            ))}
          </div>
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No invoices found.</div>
          ) : (
            invoices.map((inv) => (
              <div key={inv._id} className="grid grid-cols-5 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50">
                <p className="text-sm font-semibold text-blue-600 font-mono">{inv.referenceId}</p>
                <p className="text-sm text-gray-700">{inv.planName}</p>
                <p className="text-sm text-gray-700">{new Date(inv.paidAt).toLocaleDateString()}</p>
                <span className="inline-block border border-gray-200 rounded px-2 py-0.5 text-xs font-semibold text-gray-600 uppercase w-fit">
                  {inv.paymentMethod}
                </span>
                <p className="text-sm font-bold text-green-600">₱{inv.planPrice}</p>
              </div>
            ))
          )}
        </div>
      )}
    </MemberLayout>
  );
};
