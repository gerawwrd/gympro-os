import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import api from '../../api/axios';

const ReceiptModal = ({ payment, gymSettings, onClose }) => {
  const subtotal = (payment.planPrice / 1.05).toFixed(2);
  const tax = (payment.planPrice - subtotal).toFixed(2);

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-80 p-6 text-center">
        <h2 className="text-lg font-bold text-blue-600 tracking-widest uppercase">
          {gymSettings?.name || 'GymPro Elite Fit'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{gymSettings?.address || '450 Strength Blvd, Metropolis'}</p>
        <p className="text-xs text-gray-500">{gymSettings?.phone || '+1 (555) 902-1200'}</p>

        <div className="border-t border-dashed border-gray-300 my-4"></div>

        <div className="text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase text-xs font-semibold">Receipt Ticket:</span>
            <span className="font-bold">{payment.referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase text-xs font-semibold">Issue Date:</span>
            <span>{new Date(payment.paidAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase text-xs font-semibold">Athlete Tag:</span>
            <span className="font-bold">{payment.memberName} ({payment.memberCode})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase text-xs font-semibold">Billing Route:</span>
            <span>{payment.paymentMethod}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 my-4"></div>

        <div className="text-left space-y-1 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Product subscription</span>
            <span>Amount code</span>
          </div>
          <div className="flex justify-between text-gray-600 font-mono">
            <span>{payment.planName}</span>
            <span>₱{Number(payment.planPrice).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 my-3"></div>

        <div className="text-sm space-y-1">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal:</span>
            <span>₱{subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Sales Tax (5%):</span>
            <span>₱{tax}</span>
          </div>
          <div className="flex justify-between font-bold text-blue-600 text-base mt-2">
            <span>Grand Total Bill:</span>
            <span>₱{Number(payment.planPrice).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 my-4"></div>

        <button
          onClick={handlePrint}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold mb-2 hover:bg-blue-700"
        >
          🖨 Issue / Print Receipt Paper
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200"
        >
          Close Ticket
        </button>
      </div>
    </div>
  );
};

const RecordPaymentModal = ({ onClose, onSuccess }) => {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    memberId: '',
    planId: '',
    paymentMethod: 'Cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [membersRes, plansRes] = await Promise.all([
          api.get('/members'),
          api.get('/plans'),
        ]);
        setMembers(membersRes.data.members);
        setPlans(plansRes.data.plans);
        if (membersRes.data.members.length > 0) {
          setForm((prev) => ({ ...prev, memberId: membersRes.data.members[0]._id }));
        }
        if (plansRes.data.plans.length > 0) {
          setForm((prev) => ({ ...prev, planId: plansRes.data.plans[0]._id }));
        }
      } catch {
        setError('Failed to load data');
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await api.post('/payments', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-1">
          Record Offline Payment
        </h2>
        <p className="text-xs text-gray-400 mb-5">Logs an external Cash/Check membership cycle.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Select Target Athlete
            </label>
            <select
              value={form.memberId}
              onChange={(e) => setForm((prev) => ({ ...prev, memberId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="">Select Member profile...</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.memberCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Choose Plan Product
            </label>
            <select
              value={form.planId}
              onChange={(e) => setForm((prev) => ({ ...prev, planId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} - ₱{p.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Payment Method / Channel
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              <option>Cash</option>
              <option>Credit Card</option>
              <option>Bank Transfer</option>
              <option>PayPal</option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700 font-mono">
            ⚠ Double-check selection before committing. Committing records a billing invoice, renews safety cycles, and posts ledger metrics immediately.
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.memberId || !form.planId}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Commit Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async (searchTerm = '') => {
    try {
      setLoading(true);
      const params = searchTerm ? `?search=${searchTerm}` : '';
      const res = await api.get(`/payments${params}`);
      setPayments(res.data.payments);
    } catch {
      console.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => { await fetchPayments(); };
    load();
  }, []);

  return (
    <AdminLayout moduleName="Payments">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finances Ledger Billing</h1>
          <p className="text-gray-500 text-sm mt-1">
            Audit incoming cash flows, log manual cash collections and print transaction checkout receipts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchPayments(search)}
            className="border border-gray-200 rounded-lg p-2 text-gray-600 hover:bg-gray-50"
          >
            ↻
          </button>
          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            + Record Manual Cash/Payment
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchPayments(e.target.value);
          }}
          placeholder="Search by ref number, member code, plan or name..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="grid grid-cols-6 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {['Reference ID Tag', 'Target Athlete', 'Contract Product', 'Payment Timestamp', 'Receipting Method', 'Gross Value', 'Receipt'].map((h) => (
            <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No payment records found.</div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment._id}
              className="grid grid-cols-6 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50"
            >
              <p className="text-sm font-semibold text-blue-600 font-mono">
                {payment.referenceId}
              </p>
              <div>
                <p className="text-sm font-medium text-gray-800">{payment.memberName}</p>
                <p className="text-xs text-gray-400 font-mono">{payment.memberCode}</p>
              </div>
              <p className="text-sm text-gray-700">{payment.planName}</p>
              <div>
                <p className="text-sm text-gray-700">
                  {new Date(payment.paidAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(payment.paidAt).toLocaleTimeString()}
                </p>
              </div>
              <span className="inline-block border border-gray-200 rounded px-2 py-0.5 text-xs font-semibold text-gray-600 uppercase">
                {payment.paymentMethod}
              </span>
              <p className="text-sm font-bold text-green-600">
                ₱{Number(payment.planPrice).toFixed(2)}
              </p>
              <button
                onClick={() => setSelectedPayment(payment)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="View Receipt"
              >
                🧾
              </button>
            </div>
          ))
        )}
      </div>

      {showRecordModal && (
        <RecordPaymentModal
          onClose={() => setShowRecordModal(false)}
          onSuccess={() => fetchPayments(search)}
        />
      )}

      {selectedPayment && (
        <ReceiptModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </AdminLayout>
  );
};
