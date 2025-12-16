import React, { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ data }: { data: any }) => {
  const chartRef = useRef<any>(null);
  const chartInstanceRef = useRef<any>(null);

  const labels = useMemo(() => {
    if (typeof data == "object") {
      const label = Object.keys(data)?.map((item, key) => item);
      const dat = Object.keys(data)?.map((item, key) => data[item]);
      return { labels: label, data: dat };
    }
    return { labels: [], data: [] };
  }, [data]);
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Destroy the previous chart instance if it exists
    if (chartInstanceRef?.current) {
      chartInstanceRef.current?.destroy();
    }

    // Create a new chart instance
    chartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels?.labels,
        datasets: [
          {
            label: "Order Count",
            data: labels?.data,
            backgroundColor: [
              "#e5e7e9",
              "#abebc6",
              "#d6eaf8",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "#f9e79f",
              "#f5b7b1",
              "#aeb6bf",
            ],
            borderColor: [
              "#ccd1d1",
              "#2ecc71",
              "#85c1e9",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "#f4d03f",
              "#ec7063",
              "#5d6d7e",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false, // Disable the legend
          },
          tooltip: {
            enabled: true, // Enable tooltips
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw}`;
              },
            },
          },
        },
      },
    });

    // Clean up the chart instance on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current?.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default PieChart;
