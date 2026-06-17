import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import api from '../../api/axios';
import { Html5Qrcode } from 'html5-qrcode';

export const AttendancePage = () => {
  const [mode, setMode] = useState('checkin');
  const [manualCode, setManualCode] = useState('');
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const qrRef = useRef(null);
  const html5QrRef = useRef(null);

  const fetchLogs = async (searchTerm = '') => {
    try {
      const params = searchTerm ? `?search=${searchTerm}` : '';
      const res = await api.get(`/attendance${params}`);
      setLogs(res.data.logs);
    } catch {
      console.error('Failed to fetch logs');
    }
  };

  useEffect(() => {
    const load = async () => { await fetchLogs(); };
    load();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSimulate = async (code = manualCode) => {
    if (!code.trim()) return;
    try {
      const endpoint = mode === 'checkin' ? '/attendance/checkin' : '/attendance/checkout';
      const res = await api.post(endpoint, { memberCode: code.trim() });
      showFeedback('success', res.data.message);
      setManualCode('');
      await fetchLogs(search);
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Operation failed');
    }
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const html5Qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        async (decodedText) => {
          await html5Qr.stop();
          setCameraActive(false);
          await handleSimulate(decodedText);
        },
        () => {}
      );
    } catch {
      setCameraActive(false);
      showFeedback('error', 'Camera access denied or not available');
    }
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
    }
    setCameraActive(false);
  };

  return (
    <AdminLayout moduleName="Attendance">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biometric Gates Access Terminal</h1>
          <p className="text-gray-500 text-sm mt-1">
            Clock check-in times, audit active workout indices and inspect facility attendance patterns.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(search)}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          ↻ Sync logs
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Gate Simulator */}
        <div className="bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Facility Gate Simulator
            </p>
            <div className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
          </div>

          {/* QR Scanner Area */}
          <div className="bg-gray-900 rounded-xl overflow-hidden mb-4 relative" style={{ height: '200px' }}>
            <div id="qr-reader" className="w-full h-full"></div>
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="border-2 border-dashed border-gray-600 rounded-lg w-24 h-24 flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-3xl">▣</span>
                </div>
                <span className="text-xs text-red-400 font-mono">● CAMERA FEED OFFLINE</span>
              </div>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setMode('checkin')}
              className={`py-2.5 rounded-lg text-sm font-bold border transition-colors ${
                mode === 'checkin'
                  ? 'border-green-400 text-green-600 bg-green-50'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              → CHECK-IN
            </button>
            <button
              onClick={() => setMode('checkout')}
              className={`py-2.5 rounded-lg text-sm font-bold border transition-colors ${
                mode === 'checkout'
                  ? 'border-red-400 text-red-500 bg-red-50'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              → CHECK-OUT
            </button>
          </div>

          {/* Manual Input */}
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
              Member Tag / Input Code
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                placeholder="E.g. GP-1001"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 font-mono"
              />
              <button
                onClick={() => handleSimulate()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Simulate
              </button>
            </div>
          </div>

          {/* Camera Button */}
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
              cameraActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {cameraActive ? '⏹ Stop Camera' : '📷 Start QR Scanner'}
          </button>

          {/* Feedback */}
          {feedback && (
            <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {feedback.type === 'success' ? '✓' : '✗'} {feedback.message}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-500 space-y-1">
            <p className="font-bold text-gray-400">TESTING INSTRUCTIONS</p>
            <p>1. Toggle scan mode to Check-In or Out.</p>
            <p>2. Enter code e.g. <span className="text-blue-500">GP-1001</span> (Active) or <span className="text-red-400">GP-XXXX</span> (Expired).</p>
            <p>3. Tap "Simulate" or use QR Scanner.</p>
          </div>
        </div>

        {/* Attendance Ledger */}
        <div className="bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900">Chronological Biometric Ledger</p>
              <p className="text-xs text-gray-400">Real-time facility usage and authentication clock-ins register.</p>
            </div>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchLogs(e.target.value);
            }}
            placeholder="Search ledger logs..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400"
          />

          <div className="grid grid-cols-4 pb-2 border-b border-gray-100 mb-2">
            {['Athlete Code / Name', 'Gate In Stamp', 'Gate Out Stamp', 'Duration'].map((h) => (
              <p key={h} className="text-xs font-semibold text-gray-400 uppercase">{h}</p>
            ))}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No attendance records yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="grid grid-cols-4 items-center py-2 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {log.member?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{log.member?.name}</p>
                      <p className="text-xs text-blue-500 font-mono">{log.memberCode}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-700">
                      {new Date(log.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.checkInTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    {log.status === 'active' ? (
                      <span className="text-xs font-semibold text-green-500">● Workout In-Progress</span>
                    ) : (
                      <>
                        <p className="text-xs text-gray-700">
                          {new Date(log.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.checkOutTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    {log.status === 'active' ? '—' : `${log.duration} minutes`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
