'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatusChartProps {
  data: { status: string; count: number }[];
}

export function StatusChart({ data }: StatusChartProps) {
  const labels = data.length > 0 ? data.map((d) => d.status) : ['No Data'];
  const counts = data.length > 0 ? data.map((d) => d.count) : [0];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Complaints',
        data: counts,
        backgroundColor: '#246B67',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="h-64 relative">
      <Bar data={chartData} options={options} />
    </div>
  );
}

