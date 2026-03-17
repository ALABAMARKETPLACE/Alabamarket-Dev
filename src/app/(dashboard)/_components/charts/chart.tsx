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
              "#F59E0B", // Pending       — amber
              "#3B82F6", // Processing    — blue
              "#8B5CF6", // Shipped       — purple
              "#06B6D4", // Out for delivery — cyan
              "#10B981", // Delivered     — green
              "#EF4444", // Cancelled     — red
              "#95A5A6", // fallback grey
              "#FF5F15", // fallback brand orange
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
                family: "'Poppins', sans-serif",
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
              family: "'Poppins', sans-serif",
            },
            bodyFont: {
              size: 12,
              family: "'Poppins', sans-serif",
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
    <div style={{ height: "220px", width: "100%", position: "relative" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PieChart;
