import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
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
  Legend,
  Filler,
);

const StudentActivityChart = () => {
  const { dashboard } = useSelector((state) => state.studentProfile);

  const stats = dashboard?.stats || {};
  const capstoneSummary = stats?.capstoneSummary || {};

  const labels = ["Enrolled", "Completed", "Certificates", "Capstones"];

  const dataValues = [
    stats.enrolledCourses || 0,
    stats.completedCourses || 0,
    stats.certificatesCount || 0,
    capstoneSummary.APPROVED || 0,
  ];

  const totalInView = dataValues.reduce((acc, curr) => acc + curr, 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Progress Metrics",
        data: dataValues,
        borderColor: "#1976d2",
        borderWidth: 3,
        tension: 0.42,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, "rgba(25, 118, 210, 0.28)");
          gradient.addColorStop(0.65, "rgba(109, 40, 217, 0.08)");
          gradient.addColorStop(1, "rgba(25, 118, 210, 0.00)");
          return gradient;
        },
        pointBackgroundColor: "#9c27b0",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2.5,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: "#7c3aed",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1100,
      easing: "easeOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#ffffff",
        titleFont: { size: 12, weight: "700" },
        bodyColor: "#93c5fd",
        bodyFont: { size: 12, weight: "600" },
        borderColor: "rgba(255, 255, 255, 0.12)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => ` Total: ${context.parsed.y} achieved`,
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
          font: { size: 12, weight: "600", family: "inherit" },
          padding: 10,
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
          drawTicks: false,
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.5)",
          stepSize: 1,
          padding: 10,
          font: { size: 11, weight: "500", family: "inherit" },
        },
      },
    },
  };

  return (
    <section className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <span className={styles.chartEyebrow}>LEARNING OVERVIEW</span>
          <h2>Your Progress Summary</h2>
          <p>Visual timeline of your key achievements and milestones</p>
        </div>

        <div className={styles.chartBadge}>
          <span className={styles.pulseDot} />
          {totalInView} Total Items
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </section>
  );
};

export default StudentActivityChart;
