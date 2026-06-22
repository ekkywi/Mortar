"use client";

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface TelemetryData {
  id: string;
  deviceTime: string;
  distanceUpper: number;
  distanceLower: number;
  fuzzyOutput: number;
  displayTime?: string;
}

export default function TelemetryChart() {
  const [data, setData] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/telemetry');
        if (!response.ok) throw new Error('Gagal menarik data');
        
        const result = await response.json();
        
        const formattedData = result.map((item: any) => ({
          ...item,
          displayTime: new Date(Number(item.deviceTime)).toLocaleTimeString('id-ID'),
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error("[CHART_ERROR]", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="text-slate-500 animate-pulse p-4 border border-slate-200 bg-white rounded-2xl mt-6 text-center shadow-sm">Memuat grafik historis...</div>;
  if (data.length === 0) return <div className="text-slate-500 p-4 border border-slate-200 bg-white rounded-2xl mt-6 text-center shadow-sm">Belum ada data di basis data Neon.</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6 shadow-sm">
      <h2 className="text-lg font-bold mb-6 text-slate-800">Tren Muka Air & Logika Fuzzy (100 Siklus Terakhir)</h2>
      <div className="h-80 w-full text-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
            <XAxis dataKey="displayTime" stroke="#64748b" tick={{fill: '#64748b'}} tickMargin={10} minTickGap={30} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b'}} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fill: '#64748b'}} domain={[0, 1]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
              itemStyle={{ color: '#0f172a' }}
              labelStyle={{ color: '#334155' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#334155' }} />
            
            <Line yAxisId="left" type="monotone" dataKey="distanceUpper" stroke="#10b981" name="Tandon Atas (cm)" dot={false} strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="distanceLower" stroke="#3b82f6" name="Tandon Bawah (cm)" dot={false} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="fuzzyOutput" stroke="#f59e0b" name="Fuzzy Output" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
