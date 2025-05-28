import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Packet } from "@/types/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  packets: Packet[];
}

const StatusDistributionChart = ({ packets }: Props) => {
  const statusCounts = packets.reduce((acc: { [key: string]: number }, packet) => {
    acc[packet.status] = (acc[packet.status] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "#22c55e", // delivered - green
          "#3b82f6", // in transit - blue
          "#eab308", // pending - yellow
          "#ef4444", // others - red
        ],
      },
    ],
  };

  return <Pie data={data} />;
};

export default StatusDistributionChart;