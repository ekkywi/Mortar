"use client";

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
  const { payload, connectionStatus } = useMqttTelemetry('tandon/telemetry');

  const lowerMetrics = calculateMetrics(payload?.distanceLower);
  const upperMetrics = calculateMetrics(payload?.distanceUpper);
  const isPumpOn = payload?.isPumpOn || false;

  return (
    <main className="space-y-6 text-slate-900 font-mono">
      <header className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Dashboard
          <span className={`text-xs px-2 py-1 rounded border ${
            connectionStatus === 'Connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
            'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {connectionStatus}
          </span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">Sistem Monitoring Tinggi Air Real-Time</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="flex flex-col items-center">
          <h3 className="text-slate-600 font-bold mb-4">Tandon Bawah (Sumur)</h3>
          <div className="relative w-32 h-48 border-4 border-slate-300 rounded-b-xl bg-slate-50 overflow-hidden shadow-inner">
            <div 
              className="absolute bottom-0 w-full bg-blue-500/70 border-t-2 border-blue-300 transition-all duration-700 ease-in-out"
              style={{ height: `${lowerMetrics.percentage}%` }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-slate-800">
              <span className="text-2xl">{lowerMetrics.percentage}%</span>
              <span className="text-xs text-slate-500">{lowerMetrics.liters} L</span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">
            <p>Jarak Sensor: {payload ? `${lowerMetrics.validDistance} cm` : '--'}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 w-full relative h-32 md:h-auto">
          <div className={`absolute w-full h-0 border-t-4 border-dashed transition-colors duration-300 ${
            isPumpOn ? 'border-blue-400 animate-[pulse_1s_ease-in-out_infinite]' : 'border-slate-300'
          }`} />
          
          <div className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all ${
            isPumpOn 
              ? 'bg-white border-blue-500 shadow-blue-200' 
              : 'bg-white border-slate-300 shadow-slate-200'
          }`}>
            <div className={`w-12 h-12 border-t-4 border-b-4 rounded-full flex items-center justify-center ${
              isPumpOn ? 'border-blue-400 animate-spin [animation-duration:0.5s]' : 'border-slate-300'
            }`}>
              <span className="text-xs font-bold text-slate-500">PUMP</span>
            </div>
            <span className={`text-[10px] mt-1 font-bold ${isPumpOn ? 'text-blue-600' : 'text-slate-500'}`}>
              {isPumpOn ? 'AKTIF' : 'MATI'}
            </span>
          </div>
          
          <div className="absolute -bottom-8 bg-white border border-slate-200 px-3 py-1 rounded text-xs shadow-sm">
            <span className="text-slate-500">Fuzzy Output: </span>
            <span className="font-bold text-amber-600">{payload ? payload.fuzzyOutput.toFixed(2) : '--'}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-slate-600 font-bold mb-4">Tandon Atas (Distribusi)</h3>
          <div className="relative w-32 h-48 border-4 border-slate-300 rounded-b-xl bg-slate-50 overflow-hidden shadow-inner">
            <div 
              className="absolute bottom-0 w-full bg-blue-500/70 border-t-2 border-blue-300 transition-all duration-700 ease-in-out"
              style={{ height: `${upperMetrics.percentage}%` }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-slate-800">
              <span className="text-2xl">{upperMetrics.percentage}%</span>
              <span className="text-xs text-slate-500">{upperMetrics.liters} L</span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">
            <p>Jarak Sensor: {payload ? `${upperMetrics.validDistance} cm` : '--'}</p>
          </div>
        </div>
      </section>

      <TelemetryChart />
    </main>
  );
}
