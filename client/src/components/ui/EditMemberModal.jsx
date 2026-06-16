import { useState } from 'react';
import api from '../../api/axios';

export const EditMemberModal = ({ member, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: member.name?.split(' ')[0] || '',
    lastName: member.name?.split(' ').slice(1).join(' ') || '',
    email: member.email || '',
    phone: member.phone || '',
    gender: member.gender || 'male',
    profileImage: member.profileImage || '',
    address: member.address || '',
    password: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await api.put(`/members/${member._id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        profileImage: form.profileImage,
        address: form.address,
        ...(form.password && { password: form.password }),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Modify Member Parameters</h2>
            <p className="text-sm text-gray-500 mt-0.5">Make targeted tweaks to the athlete contact info.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light ml-4">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Mobile Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Photo Path (URL)</label>
              <input name="profileImage" value={form.profileImage} onChange={handleChange} placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Residence Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-3">
              🔒 Account & Security Management (Admin Only)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Passcode / Reset Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="Enter new account password"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white" />
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep existing password keys unchanged.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Athlete Login ID (Read-only)</label>
                <input value={member.memberCode || 'GP-XXXX'} readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Members login with their Member Code or Email address.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Discard Changes
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Saving...' : 'Apply Profile Modifications'}
          </button>
        </div>
      </div>
    </div>
  );
};
