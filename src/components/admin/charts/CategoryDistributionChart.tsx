import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Packet } from "@/types/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  packets: Packet[];
}

const CategoryDistributionChart = ({ packets }: Props) => {
  const categoryCounts = packets.reduce((acc: { [key: string]: number }, packet) => {
    acc[packet.category] = (acc[packet.category] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          "#3b82f6", // electronics - blue
          "#22c55e", // clothing - green
          "#eab308", // documents - yellow
          "#ef4444", // others - red
        ],
      },
    ],
  };

  return <Doughnut data={data} />;
};

export default CategoryDistributionChart;