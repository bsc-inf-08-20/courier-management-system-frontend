"use client";

import React, { useEffect, useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, ChartOptions } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";

// Define types for your data
interface WeightRange {
  range: string;
  count: number;
}

interface GoodsData {
  weightRanges: WeightRange[];
  weightHistogram: WeightRange[];
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
)

const Dashboard = () => {
  const [goodsData, setGoodsData] = useState<GoodsData | null>(null);
  const [dailyGoodsData, setDailyGoodsData] = useState<GoodsData | null>(null);
  const [lastResetDate, setLastResetDate] = useState<string>('');

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get<GoodsData>("https://your-api-url.com/goods");
      setGoodsData(response.data);
      setDailyGoodsData(response.data); // Set daily data initially as well
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 
  // this data is for testing only, when i connect with the backend its when i will remove this data, sice the information will be retreived from the database
  useEffect(() => {
    const initialData: GoodsData = {
      weightRanges: [
        { range: '0.1-20', count: 10 },
        { range: '20.1-40', count: 7 },
        { range: '40.1-60', count: 4 },
        { range: '60.1-80', count: 2 },
        { range: '80.1-100', count: 2 },
        { range: '0.1-20', count: 10 },
        { range: '20.1-40', count: 7 },
        { range: '40.1-60', count: 4 },
        { range: '60.1-80', count: 2 },
        { range: '80.1-100', count: 2 },
      ],
      weightHistogram: [
        { range: '0.1-5', count: 8 },
        { range: '5.1-10', count: 5 },
        { range: '10.1-15', count: 3 },
        { range: '15.1-20', count: 1 },
        { range: '20.1-25', count: 15 },
        { range: '25.1-30', count: 25 },
        { range: '20.1-25', count: 15 },
        { range: '25.1-30', count: 25 },
        { range: '20.1-25', count: 15 },
        { range: '25.1-30', count: 25 },
        { range: '20.1-25', count: 15 },
        { range: '25.1-30', count: 25 },
      ],
    };

    setGoodsData(initialData);
    setDailyGoodsData(initialData); // Initially, daily data is the same as overall data

    const intervalId = setInterval(() => {
      const currentDate = new Date().toISOString().split('T')[0];

      if (currentDate !== lastResetDate) {
        setLastResetDate(currentDate);
        setDailyGoodsData(initialData);
      }
    }, 60000); // Check and reset every minute

    return () => clearInterval(intervalId);
  }, [lastResetDate]);

  useEffect(() => {
    // Fetch data when the component mounts and set up daily reset
    fetchData();

    // Auto-reset daily data every 24 hours
    const intervalId = setInterval(() => {
      const currentDate = new Date().toISOString().split("T")[0];

      if (currentDate !== lastResetDate) {
        setLastResetDate(currentDate);
        fetchData(); // Refresh data for daily tracking
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [lastResetDate]);

  if (!goodsData || !dailyGoodsData) {
    return <div>Loading...</div>;
  }

  // Pie Chart Data (Weight Range Distribution)
  const pieChartData = {
    labels: goodsData.weightRanges.map((item) => item.range),
    datasets: [
      {
        data: goodsData.weightRanges.map((item) => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF5733'],
      },
    ],
  };

  // Bar Chart Data (Weight Distribution Histogram)
  const barChartData = {
    labels: goodsData.weightHistogram.map((item) => item.range),
    datasets: [
      {
        label: 'Goods Count',
        data: goodsData.weightHistogram.map((item) => item.count),
        backgroundColor: '#4BC0C0',
      },
    ],
  };

  // Line Chart Data (Trend of Goods in Weight Ranges)
  const lineChartData = {
    labels: goodsData.weightRanges.map((item) => item.range),
    datasets: [
      {
        label: 'Goods Weight Range (kg)',
        data: goodsData.weightRanges.map((item) => item.count),
        borderColor: '#FF5733',
        backgroundColor: 'rgba(255, 87, 51, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Daily Data Pie Chart
  const dailyPieChartData = {
    labels: dailyGoodsData.weightRanges.map((item) => item.range),
    datasets: [
      {
        data: dailyGoodsData.weightRanges.map((item) => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF5733'],
      },
    ],
  };

  // Daily Data Bar Chart
  const dailyBarChartData = {
    labels: dailyGoodsData.weightHistogram.map((item) => item.range),
    datasets: [
      {
        label: 'Goods Count (Daily)',
        data: dailyGoodsData.weightHistogram.map((item) => item.count),
        backgroundColor: '#4BC0C0',
      },
    ],
  };

  // Chart options to customize axis labels
  const chartOptions: ChartOptions<'line'|'bar'> = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: 'black',
        font: {
          weight: 'bold',
        },
        align: 'center',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Weight Range (kg)',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Amount of Goods',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <h1 className="text-3xl font-semibold text-center">Agent Dashboard</h1>

      {/* Daily Data Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daily Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-72 md:h-96">
            <Pie data={dailyPieChartData} />
          </div>
          <div className="h-72 md:h-96">
            <Line data={lineChartData} options={chartOptions} />
          </div>
          <div className="h-72 md:h-96">
            <Bar data={dailyBarChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* All-Time Data Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All-Time Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-72 md:h-96">
            <Pie data={pieChartData} />
          </div>
          <div className="h-72 md:h-96">
            <Line data={lineChartData} options={chartOptions} />
          </div>
          <div className="h-72 md:h-96">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;