import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Packet } from "@/types/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  packets: Packet[];
}

const WeightDistributionChart = ({ packets }: Props) => {
  // Create weight ranges
  const weightRanges = [
    "0-1kg",
    "1-2kg",
    "2-5kg",
    "5-10kg",
    ">10kg",
  ];

  const weightCounts = packets.reduce((acc: { [key: string]: number }, packet) => {
    const weight = packet.weight;
    if (weight <= 1) acc["0-1kg"] = (acc["0-1kg"] || 0) + 1;
    else if (weight <= 2) acc["1-2kg"] = (acc["1-2kg"] || 0) + 1;
    else if (weight <= 5) acc["2-5kg"] = (acc["2-5kg"] || 0) + 1;
    else if (weight <= 10) acc["5-10kg"] = (acc["5-10kg"] || 0) + 1;
    else acc[">10kg"] = (acc[">10kg"] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: weightRanges,
    datasets: [
      {
        label: "Number of Packets",
        data: weightRanges.map(range => weightCounts[range] || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return <Line options={options} data={data} />;
};

export default WeightDistributionChart;