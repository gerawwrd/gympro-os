import { useAuth } from '../../context/AuthContext';
import { MemberLayout } from '../../components/layout/MemberLayout';
import api from '../../api/axios';
import { useState } from 'react';

export const MemberDashboardPage = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleGate = async (action) => {
    if (!user?.memberCode) {
      showFeedback('error', 'Member code not found. Please contact admin.');
      return;
    }
    try {
      setLoading(true);
      const endpoint = action === 'checkin' ? '/attendance/checkin' : '/attendance/checkout';
      const res = await api.post(endpoint, { memberCode: user.memberCode });
      showFeedback('success', res.data.message);
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberLayout moduleName="Settings">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
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
      </div>

      {/* Gate Buttons */}
      <div className="bg-white rounded-xl p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">Gate Access Terminal System</p>
        <p className="text-xs text-gray-400 mb-4">Simulate swiping your unique QR Badge in front of GymPro scanners.</p>

        {feedback && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleGate('checkin')}
            disabled={loading}
            className="py-6 rounded-xl border-2 border-green-400 text-green-600 bg-green-50 font-bold text-sm hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            → CHECK-IN GATE
          </button>
          <button
            onClick={() => handleGate('checkout')}
            disabled={loading}
            className="py-6 rounded-xl border-2 border-red-400 text-red-500 bg-red-50 font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            → CHECK-OUT GATE
          </button>
        </div>
      </div>
    </MemberLayout>
  );
};
