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
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#84cc16',
          '#64748b',
          '#d97706',
        ],
        borderWidth: 1,
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

