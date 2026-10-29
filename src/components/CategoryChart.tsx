'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data: { category: string; count: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const labels = data.length > 0 ? data.map((d) => d.category) : ['No Data'];
  const counts = data.length > 0 ? data.map((d) => d.count) : [0];

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: [
          '#173B57', // Primary navy
          '#246B67', // Secondary teal
          '#2DD4BF', // Dark accent teal
          '#17664F', // Success
          '#875B13', // Pending
          '#A12D32', // Critical
          '#0D9488', // Deep teal
          '#38BDF8', // Light sky
          '#526579', // Secondary slate
          '#FCD58A', // Warm amber
        ],
        borderWidth: 1,
        borderColor: 'transparent',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-64 relative">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

