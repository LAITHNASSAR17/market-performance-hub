
import { useState, useEffect } from 'react';

export interface PLDataPoint {
  time: string;
  value: number;
}

export const usePlData = (): PLDataPoint[] => {
  const [plData, setPLData] = useState<PLDataPoint[]>([]);
  
  useEffect(() => {
    setPLData(generatePLData());
  }, []);
  
  return plData;
};

// Generate Running P&L data
const generatePLData = (): PLDataPoint[] => {
  const hours = ['09:14', '09:16', '09:18', '09:20', '09:22', '09:24', '09:26', '09:28', '09:30', '09:32', '09:34', '09:36', '09:38', '09:40', '09:42'];
  const values = [-30, -250, -650, -680, -600, -400, -150, -300, -530, -550, -400, -550, -650, -150, 600];
  
  return hours.map((time, index) => ({
    time,
    value: values[index]
  }));
};
