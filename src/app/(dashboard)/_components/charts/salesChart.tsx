import { Line } from "react-chartjs-2";
import { Chart as ChartJS, ScriptableContext, registerables } from "chart.js";
import moment from "moment";

ChartJS.register(...registerables);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#111827",
      bodyColor: "#4B5563",
      titleFont: {
        size: 13,
        weight: "bold" as const,
        family: "'Poppins', sans-serif",
      },
      bodyFont: {
        size: 12,
        family: "'Poppins', sans-serif",
      },
      borderColor: "rgba(229, 231, 235, 0.5)",
      borderWidth: 1,
      padding: 10,
      boxPadding: 4,
      usePointStyle: true,
      displayColors: true,
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: function (context: any) {
          return ` Orders: ${context.parsed.y}`;
        },
        labelColor: function () {
          return {
            borderColor: "#FF5F15",
            backgroundColor: "#FF5F15",
            borderWidth: 2,
            borderRadius: 2,
          };
        },
      },
      cornerRadius: 8,
      caretSize: 6,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
          size: 11,
        },
        color: "#9CA3AF",
        padding: 10,
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "#F3F4F6",
        borderDash: [4, 4],
        drawBorder: false,
      },
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
          size: 11,
        },
        color: "#9CA3AF",
        padding: 10,
        maxTicksLimit: 6,
      },
      border: {
        display: false,
      },
      beginAtZero: true,
    },
  },
  interaction: {
    intersect: false,
    mode: "index" as const,
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 6,
    },
  },
};

interface SalesDataEntry {
  orderDate: string | Date;
  orderCount: number;
}

interface SalesChartProps {
  data?: SalesDataEntry[];
}

export default function SalesChart(props: SalesChartProps) {
  const labels = props?.data?.map((entry) =>
    moment(entry.orderDate).format("MMM D"),
  );

  const datas = props?.data?.map((entry) => entry.orderCount);

  const data = {
    labels,
    datasets: [
      {
        label: "Orders",
        data: datas,
        borderColor: "#FF5F15",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(255, 95, 21, 0.25)");
          gradient.addColorStop(1, "rgba(255, 95, 21, 0.0)");
          return gradient;
        },
        pointBackgroundColor: "#FF5F15",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4, // Smooth curve
      },
    ],
  };

  return (
    <div
      style={{
        height: 350,
        width: "100%",
        padding: "10px",
        background: "#fff",
        borderRadius: "12px",
      }}
    >
      <Line options={options} data={data} />
    </div>
  );
}
