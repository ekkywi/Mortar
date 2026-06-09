"use client";

import { useRouter } from 'next/navigation';
import { useMqttTelemetry } from '@/hooks/useMqttTelemetry';
import TelemetryChart from '@/components/TelemetryChart';

const TANDON_CONFIG = {
  maxCapacityLiters: 650,
  totalHeight: 135.5,
};

function calculateMetrics(rawDistance: number | undefined) {
  if (rawDistance === undefined) return { percentage: 0, liters: 0, validDistance: 0 };
  
  const validDistance = Math.max(0, Math.min(rawDistance, TANDON_CONFIG.totalHeight));
  const waterHeight = TANDON_CONFIG.totalHeight - validDistance;
  const percentage = (waterHeight / TANDON_CONFIG.totalHeight) * 100;
  const liters = (percentage / 100) * TANDON_CONFIG.maxCapacityLiters;

  return {
    percentage: Number(percentage.toFixed(1)),
    liters: Math.round(liters),
    validDistance: validDistance.toFixed(1)
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { payload, connectionStatus } = useMqttTelemetry('tandon/telemetry');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const lowerMetrics = calculateMetrics(payload?.distanceLower);
  const upperMetrics = calculateMetrics(payload?.distanceUpper);
  const isPumpOn = payload?.isPumpOn || false;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-mono">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="border-b border-neutral-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Mortar Dashboard
              <span className={`text-xs px-2 py-1 rounded border ${
                connectionStatus === 'Connected' ? 'bg-emerald-950 border-emerald-800 text-emerald-400' : 
                'bg-rose-950 border-rose-800 text-rose-400'
              }`}>
                {connectionStatus}
              </span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Sistem Monitoring Tinggi Air Real-Time</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded transition-colors"
          >
            Logout
          </button>
        </header>

        <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center">
            <h2 className="text-neutral-400 font-bold mb-4">Tandon Bawah (Sumur)</h2>
            <div className="relative w-32 h-48 border-4 border-neutral-600 rounded-b-xl bg-neutral-950 overflow-hidden shadow-inner">
              <div 
                className="absolute bottom-0 w-full bg-blue-600/60 border-t-2 border-blue-400 transition-all duration-700 ease-in-out"
                style={{ height: `${lowerMetrics.percentage}%` }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center font-bold drop-shadow-md">
                <span className="text-2xl">{lowerMetrics.percentage}%</span>
                <span className="text-xs text-neutral-300">{lowerMetrics.liters} L</span>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-neutral-500">
              <p>Jarak Sensor: {payload ? `${lowerMetrics.validDistance} cm` : '--'}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 w-full relative h-32 md:h-auto">
            <div className={`absolute w-full h-0 border-t-4 border-dashed transition-colors duration-300 ${
              isPumpOn ? 'border-blue-400 animate-[pulse_1s_ease-in-out_infinite]' : 'border-neutral-700'
            }`} />
            
            <div className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all ${
              isPumpOn 
                ? 'bg-neutral-900 border-blue-500 shadow-blue-900/50' 
                : 'bg-neutral-900 border-neutral-700'
            }`}>
              <div className={`w-12 h-12 border-t-4 border-b-4 rounded-full flex items-center justify-center ${
                isPumpOn ? 'border-blue-400 animate-spin [animation-duration:0.5s]' : 'border-neutral-700'
              }`}>
                <span className="text-xs font-bold text-neutral-400">PUMP</span>
              </div>
              <span className={`text-[10px] mt-1 font-bold ${isPumpOn ? 'text-blue-400' : 'text-neutral-500'}`}>
                {isPumpOn ? 'AKTIF' : 'MATI'}
              </span>
            </div>
            
            <div className="absolute -bottom-8 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded text-xs">
              <span className="text-neutral-500">Fuzzy Output: </span>
              <span className="font-bold text-amber-500">{payload ? payload.fuzzyOutput.toFixed(2) : '--'}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-neutral-400 font-bold mb-4">Tandon Atas (Distribusi)</h2>
            <div className="relative w-32 h-48 border-4 border-neutral-600 rounded-b-xl bg-neutral-950 overflow-hidden shadow-inner">
              <div 
                className="absolute bottom-0 w-full bg-blue-600/60 border-t-2 border-blue-400 transition-all duration-700 ease-in-out"
                style={{ height: `${upperMetrics.percentage}%` }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center font-bold drop-shadow-md">
                <span className="text-2xl">{upperMetrics.percentage}%</span>
                <span className="text-xs text-neutral-300">{upperMetrics.liters} L</span>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-neutral-500">
              <p>Jarak Sensor: {payload ? `${upperMetrics.validDistance} cm` : '--'}</p>
            </div>
          </div>

        </section>

        <TelemetryChart />

      </div>
    </main>
  );
}