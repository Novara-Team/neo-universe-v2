import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Wifi } from 'lucide-react';

export default function Offline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [attempting, setAttempting] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      window.location.reload();
    }
  }, [isOnline]);

  const handleRetry = () => {
    setAttempting(true);
    setTimeout(() => {
      setAttempting(false);
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-950 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-slate-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-3xl mb-8 backdrop-blur-xl border border-slate-500/30">
            <WifiOff className="w-16 h-16 text-slate-400 animate-pulse" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          You're Offline
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-lg mx-auto">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>

        <button
          onClick={handleRetry}
          disabled={attempting}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          <RefreshCw className={`w-5 h-5 ${attempting ? 'animate-spin' : ''}`} />
          {attempting ? 'Checking Connection...' : 'Try Again'}
        </button>

        <div className="mt-16 p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Troubleshooting Tips</h3>
          <ul className="space-y-3 text-left text-slate-400">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-400 text-sm font-bold">1</span>
              </div>
              <p>Check if your Wi-Fi or mobile data is turned on</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-400 text-sm font-bold">2</span>
              </div>
              <p>Try turning airplane mode on and off</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-400 text-sm font-bold">3</span>
              </div>
              <p>Restart your router or modem</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-400 text-sm font-bold">4</span>
              </div>
              <p>Move closer to your Wi-Fi router for a stronger signal</p>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {isOnline ? (
            <span className="flex items-center gap-2 text-green-400">
              <Wifi className="w-4 h-4" />
              Connection restored! Refreshing...
            </span>
          ) : (
            <span>Connection Status: Offline</span>
          )}
        </div>
      </div>
    </div>
  );
}
