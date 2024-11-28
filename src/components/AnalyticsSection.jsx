// AnalyticsSection.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, // Import CategoryScale
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsSection = ({ totalTips, transactionCount, topSupporters }) => {
  // Prepare data for the chart
  const chartData = {
    labels:
      topSupporters.length > 0
        ? topSupporters.map((supporter) => supporter.address)
        : [],
    datasets: [
      {
        label: "Top Supporters",
        data:
          topSupporters.length > 0
            ? topSupporters.map((supporter) => supporter.amount)
            : [],
        backgroundColor: "#ff9800",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Supporters",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (ETH)",
        },
      },
    },
  };

  return (
    <div className="analytics-section">
      <h2>Analytics</h2>
      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>Total Tips</h3>
          <p>{totalTips.toFixed(4)} ETH</p>
        </div>
        <div className="analytics-card">
          <h3>Transactions</h3>
          <p>{transactionCount}</p>
        </div>
      </div>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AnalyticsSection;
