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

  if (isLoading) return <div className="text-neutral-500 animate-pulse p-4 border border-neutral-800 rounded mt-6 text-center">Memuat grafik historis...</div>;
  if (data.length === 0) return <div className="text-neutral-500 p-4 border border-neutral-800 rounded mt-6 text-center">Belum ada data di basis data Neon.</div>;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mt-6">
      <h2 className="text-lg font-bold mb-6 text-neutral-200">Tren Muka Air & Logika Fuzzy (100 Siklus Terakhir)</h2>
      <div className="h-80 w-full text-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis dataKey="displayTime" stroke="#737373" tick={{fill: '#737373'}} tickMargin={10} minTickGap={30} />
            <YAxis yAxisId="left" stroke="#737373" tick={{fill: '#737373'}} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="#737373" tick={{fill: '#737373'}} domain={[0, 1]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px' }}
              itemStyle={{ color: '#e5e5e5' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Line yAxisId="left" type="monotone" dataKey="distanceUpper" stroke="#10b981" name="Tandon Atas (cm)" dot={false} strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="distanceLower" stroke="#3b82f6" name="Tandon Bawah (cm)" dot={false} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="fuzzyOutput" stroke="#f59e0b" name="Fuzzy Output" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}