import React, { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

interface PieChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const PieChart = ({ data }: PieChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstanceRef = useRef<Chart | null>(null);

  const labels = useMemo(() => {
    if (typeof data === "object" && data !== null) {
      const label = Object.keys(data);
      const dat = Object.values(data);
      return { labels: label, data: dat };
    }
    return { labels: [], data: [] };
  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy the previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create a new chart instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartInstanceRef.current = new Chart(ctx as any, {
      type: "doughnut",
      data: {
        labels: labels?.labels,
        datasets: [
          {
            label: "Order Count",
            data: labels?.data as number[],
            backgroundColor: [
              "#FF5F15", // Brand Orange
              "#FF8C42", // Light Orange
              "#2C3E50", // Dark Blue
              "#34495E", // Medium Blue
              "#95A5A6", // Grey
              "#E74C3C", // Red
              "#2ECC71", // Green
              "#F1C40F", // Yellow
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                family: "'DMSans-Medium', sans-serif",
                size: 12,
              },
              color: "#6B7280",
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#111827",
            bodyColor: "#4B5563",
            titleFont: {
              size: 13,
              family: "'DMSans-Bold', sans-serif",
            },
            bodyFont: {
              size: 12,
              family: "'DMSans-Regular', sans-serif",
            },
            borderColor: "rgba(229, 231, 235, 0.5)",
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            displayColors: true,
            callbacks: {
              label: function (tooltipItem) {
                return ` ${tooltipItem.label}: ${tooltipItem.raw}`;
              },
              labelColor: function (context) {
                return {
                  borderColor: context.element.options.backgroundColor as string,
                  backgroundColor: context.element.options.backgroundColor as string,
                  borderWidth: 2,
                  borderRadius: 2,
                };
              },
            },
          },
        },
      },
    });

    // Clean up the chart instance on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [labels]);

  return (
    <div style={{ height: "300px", width: "100%", position: "relative" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PieChart;
