import { useMemo } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";

import styles from "./Chart.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

const FALLBACK_THEME = {
  primary: "#1976d2",
  secondary: "#9c27b0",
  success: "#2e7d32",
  accentPurple: "#7c3aed",
  textSecondary: "rgba(0, 0, 0, 0.6)",
  textMuted: "rgba(0, 0, 0, 0.5)",
  border: "rgba(0, 0, 0, 0.12)",
};

const StatisticsChart = () => {
  const { growth } = useSelector((state) => state.adminDashboard);

  /* Read runtime design tokens once */
  const theme = useMemo(() => {
    const root = getComputedStyle(document.documentElement);

    return {
      primary: root.getPropertyValue("--primary").trim() || FALLBACK_THEME.primary,
      secondary:
        root.getPropertyValue("--secondary").trim() || FALLBACK_THEME.secondary,
      success:
        root.getPropertyValue("--success").trim() || FALLBACK_THEME.success,
      accentPurple:
        root.getPropertyValue("--accent-purple").trim() ||
        FALLBACK_THEME.accentPurple,
      textSecondary:
        root.getPropertyValue("--text-secondary").trim() ||
        FALLBACK_THEME.textSecondary,
      textMuted:
        root.getPropertyValue("--text-muted").trim() || FALLBACK_THEME.textMuted,
      border: root.getPropertyValue("--border").trim() || FALLBACK_THEME.border,
    };
  }, []);

  const studentsSeries = growth?.students || [];
  const coursesSeries = growth?.courses || [];
  const certificatesSeries = growth?.certificates || [];

  const labels = studentsSeries.map((point) => point.label);

  const hasData = labels.length > 0;

  const totals = {
    students: studentsSeries.reduce((sum, point) => sum + point.count, 0),
    courses: coursesSeries.reduce((sum, point) => sum + point.count, 0),
    certificates: certificatesSeries.reduce(
      (sum, point) => sum + point.count,
      0,
    ),
  };

  const datasets = useMemo(
    () => [
      {
        label: "Students Joined",
        data: studentsSeries.map((point) => point.count),
        borderColor: theme.primary,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;

          if (!chartArea) return "rgba(25, 118, 210, 0.08)";

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );

          gradient.addColorStop(0, "rgba(25, 118, 210, 0.28)");
          gradient.addColorStop(1, "rgba(25, 118, 210, 0)");

          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.primary,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: theme.accentPurple,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
      },

      {
        label: "Courses Created",
        data: coursesSeries.map((point) => point.count),
        borderColor: theme.secondary,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [6, 5],
        tension: 0.4,
        fill: false,
        pointBackgroundColor: theme.secondary,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      },

      {
        label: "Certificates Issued",
        data: certificatesSeries.map((point) => point.count),
        borderColor: theme.success,
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: theme.success,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
    [studentsSeries, coursesSeries, certificatesSeries, theme],
  );

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: "index",
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",

        titleColor: "#f8fafc",

        bodyColor: "#cbd5e1",

        borderColor: "rgba(148, 163, 184, 0.2)",

        borderWidth: 1,

        padding: 12,

        displayColors: true,

        boxWidth: 8,

        boxHeight: 8,

        boxPadding: 4,

        usePointStyle: true,
      },
    },

    scales: {
      x: {
        border: {
          display: false,
        },

        grid: {
          display: false,
        },

        ticks: {
          color: theme.textMuted,

          font: {
            size: 12,
            weight: "500",
          },

          padding: 8,
        },
      },

      y: {
        beginAtZero: true,

        border: {
          display: false,
        },

        grid: {
          color: "rgba(148, 163, 184, 0.10)",

          drawTicks: false,
        },

        ticks: {
          color: theme.textMuted,

          precision: 0,

          padding: 10,

          font: {
            size: 11,
          },
        },
      },
    },
  };

  const legendItems = [
    { label: "Students", value: totals.students, color: theme.primary },
    { label: "Courses", value: totals.courses, color: theme.secondary },
    {
      label: "Certificates",
      value: totals.certificates,
      color: theme.success,
    },
  ];

  return (
    <section className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <span className={styles.chartEyebrow}>GROWTH TRENDS</span>

          <h2>Last 6 Months</h2>

          <p>Students joining, courses created &amp; certificates issued</p>
        </div>

        <div className={styles.chartBadge}>
          <span />
          Live Data
        </div>
      </div>

      {hasData ? (
        <>
          <div className={styles.legendRow}>
            {legendItems.map((item) => (
              <div className={styles.legendItem} key={item.label}>
                <span
                  className={styles.legendDot}
                  style={{ background: item.color }}
                />

                <strong>{item.value}</strong>

                <small>{item.label}</small>
              </div>
            ))}
          </div>

          <div className={styles.chartWrapper}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      ) : (
        <div className={styles.chartPlaceholder}>
          <p>Growth data will appear once activity starts on the platform.</p>
        </div>
      )}
    </section>
  );
};

export default StatisticsChart;
