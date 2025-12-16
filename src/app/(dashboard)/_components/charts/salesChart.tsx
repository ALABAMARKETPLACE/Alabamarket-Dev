import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import moment from "moment";
Chart.register(...registerables);
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    title: { display: true },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        display: true,
      },
    },
  },
  bezierCurve: false,
};

export default function SalesChart(props: any) {
  const labels = props?.data?.map((entry: any) =>
    moment(entry.orderDate).format("l")
  );

  const datas = props?.data?.map((entry: any) => entry.orderCount);

  const data = {
    labels,
    datasets: [
      {
        label: "Orders",
        data: datas,
        borderColor: "rgba(64, 194, 103,0.9)",
        pointHoverRadius: 10,
        pointRadius: 4,
        lineTension: 0.2,
      },
    ],
  };
  return (
    <div style={{ overflow: "hidden", height: 400 }}>
      <Line options={options} data={data} />
    </div>
  );
}
