import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useSelector } from "react-redux";
import styles from "./CategoryDonut.module.css";

ChartJS.register(ArcElement, Tooltip);

const FALLBACK_PALETTE = [
  "#2563eb",
  "#6366f1",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#d97706",
];

const CategoryDonut = () => {
  const { categories = [], statistics } = useSelector(
    (state) => state.adminDashboard,
  );

  const hasData = Array.isArray(categories) && categories.length > 0;

  const totalCourses =
    statistics?.courses?.total ||
    categories.reduce((sum, category) => sum + (category.count || 0), 0) ||
    0;

  /* Resolve Theme Tokens Dynamically */
  const theme = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      bgCard: root.getPropertyValue("--bg-card").trim() || "#c1d0e0",
      borderSubtle:
        root.getPropertyValue("--border-subtle").trim() ||
        "rgba(228, 238, 248, 0.24)",
      textPrimary: root.getPropertyValue("--text-primary").trim() || "#090e17",
      textMuted: root.getPropertyValue("--text-muted").trim() || "#475569",
      slate900: root.getPropertyValue("--slate-900").trim() || "#0f172a",
      tintHighlight:
        root.getPropertyValue("--tint-highlight").trim() || "#e4eef8",
      palette: [
        root.getPropertyValue("--primary").trim() || FALLBACK_PALETTE[0],
        root.getPropertyValue("--secondary").trim() || FALLBACK_PALETTE[1],
        root.getPropertyValue("--accent-purple").trim() || FALLBACK_PALETTE[2],
        root.getPropertyValue("--accent-cyan").trim() || FALLBACK_PALETTE[3],
        root.getPropertyValue("--accent-pink").trim() || FALLBACK_PALETTE[4],
        root.getPropertyValue("--accent-amber").trim() || FALLBACK_PALETTE[5],
      ],
    };
  }, []);

  const chartData = useMemo(
    () => ({
      labels: categories.map((c) => c.name),
      datasets: [
        {
          data: categories.map((c) => c.count),
          backgroundColor: theme.palette.slice(0, categories.length),
          borderColor: theme.bgCard, // Replaces #ffffff with tactile card tint
          borderWidth: 4,
          hoverOffset: 6,
          spacing: 3,
          borderRadius: 8,
        },
      ],
    }),
    [categories, theme],
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        titleColor: "#dbe6f2",
        bodyColor: "#9cb0c9",
        borderColor: "rgba(228, 238, 248, 0.2)",
        borderWidth: 1,
        padding: 12,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          label: (context) =>
            ` ${context.label}: ${context.parsed} course${
              context.parsed === 1 ? "" : "s"
            }`,
        },
      },
    },
  };

  return (
    <section className={styles.donutCard}>
      <div className={styles.donutHeader}>
        <div>
          <span className={styles.donutEyebrow}>COURSE CATALOG</span>
          <h2>Categories</h2>
        </div>
        <div className={styles.totalChip}>{totalCourses} Total</div>
      </div>

      {hasData ? (
        <>
          <div className={styles.donutWrapper}>
            <Doughnut data={chartData} options={chartOptions} />
            <div className={styles.donutCenter}>
              <strong>{totalCourses}</strong>
              <small>Courses</small>
            </div>
          </div>

          <ul className={styles.categoryList}>
            {categories.map((category, index) => (
              <li key={category.name} className={styles.categoryItem}>
                <span
                  className={styles.categoryDot}
                  style={{
                    background: theme.palette[index % theme.palette.length],
                  }}
                />
                <span className={styles.categoryName} title={category.name}>
                  {category.name}
                </span>
                <strong>{category.count}</strong>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className={styles.donutPlaceholder}>
          <p>No courses yet — categories will show up here.</p>
        </div>
      )}
    </section>
  );
};

export default CategoryDonut;
