import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Packet } from "@/types/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  packets: Packet[];
}

const DeliveryTypeChart = ({ packets }: Props) => {
  const typeCounts = packets.reduce((acc: { [key: string]: number }, packet) => {
    acc[packet.delivery_type] = (acc[packet.delivery_type] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: ["Delivery", "Pickup"],
    datasets: [
      {
        label: "Number of Packets",
        data: [typeCounts["delivery"] || 0, typeCounts["pickup"] || 0],
        backgroundColor: ["#3b82f6", "#22c55e"],
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

  return <Bar options={options} data={data} />;
};

export default DeliveryTypeChart;