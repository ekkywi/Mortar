import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

export interface TelemetryPayload {
  deviceTime: number;
  distanceUpper: number;
  distanceLower: number;
  isPumpOn: boolean;
  fuzzyOutput: number;
}

export const useMqttTelemetry = (topic: string = 'tandon/telemetry') => {
  const [payload, setPayload] = useState<TelemetryPayload | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Error'>('Connecting');

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_MQTT_URL;
    const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
    const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

    if (!url) {
      console.error('[MQTT] Kredensial URL tidak ditemukan.');
      setConnectionStatus('Error');
      return;
    }

    const client = mqtt.connect(url, {
      username,
      password,
      clientId: `nextjs_client_${Math.random().toString(16).slice(3)}`,
      protocol: 'wss',
    });

    client.on('connect', () => {
      setConnectionStatus('Connected');
      client.subscribe(topic, (err) => {
        if (err) console.error('[MQTT] Gagal subscribe ke topik:', err);
      });
    });

    client.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        try {
          const parsedMessage = JSON.parse(message.toString()) as TelemetryPayload;
          setPayload(parsedMessage);
        } catch (err) {
          console.error('[MQTT] Gagal melakukan parsing JSON dari ESP32:', err);
        }
      }
    });

    client.on('error', (err) => {
      console.error('[MQTT] Kesalahan koneksi:', err);
      setConnectionStatus('Error');
      client.end();
    });

    client.on('close', () => {
      setConnectionStatus('Disconnected');
    });

    return () => {
      client.end();
    };
  }, [topic]);

  return { payload, connectionStatus };
};