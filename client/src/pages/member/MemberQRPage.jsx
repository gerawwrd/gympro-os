import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { MemberLayout } from '../../components/layout/MemberLayout';

export const MemberQRPage = () => {
  const { user } = useAuth();

  return (
    <MemberLayout moduleName="Member-QR" activeTab="qr">
      <div className="flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-80 text-center">
          <span className="text-xs font-bold tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
            GYMPRO ATHLETE PASS
          </span>

          <div className="mt-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 overflow-hidden mx-auto mb-3">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <p className="text-lg font-bold text-gray-900">{user?.name}</p>
            <p className="text-xs font-mono text-gray-400 uppercase">{user?.email}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <QRCodeSVG
              value={user?.memberCode || 'GP-0000'}
              size={180}
              level="H"
              className="mx-auto"
            />
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Scans Pass Code:</p>
          <p className="text-lg font-bold font-mono text-gray-900">{user?.memberCode}</p>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Hold this graphical identification ticket in front of the GymPro access lens to log entry automatically.
          </p>
        </div>
      </div>
    </MemberLayout>
  );
};
