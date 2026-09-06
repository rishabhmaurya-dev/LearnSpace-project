export const CardGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden flex flex-col rounded-2xl border border-[var(--border)] bg-white p-3.5 shadow-sm"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-convex-sm)",
          }}
        >
          <div
            className="relative w-full aspect-video overflow-hidden rounded-xl bg-slate-100 mb-4"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--bg-surface-sunken)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-10 h-10 rounded-xl"
                style={{ backgroundColor: "var(--primary-soft)" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-3">
            <div
              className="relative overflow-hidden h-5 w-24 rounded-md bg-slate-100"
              style={{ backgroundColor: "var(--bg-surface-sunken)" }}
            />
            <div
              className="relative overflow-hidden h-5 w-16 rounded-full bg-slate-100"
              style={{ backgroundColor: "var(--bg-surface-sunken)" }}
            />
          </div>

          <div
            className="relative overflow-hidden h-5 w-[82%] rounded-md bg-slate-200 mb-2.5"
            style={{ backgroundColor: "var(--bg-surface-sunken)" }}
          />

          <div className="space-y-2 mb-4">
            <div
              className="relative overflow-hidden h-3.5 w-full rounded bg-slate-100"
              style={{ backgroundColor: "var(--bg-surface-sunken)" }}
            />
            <div
              className="relative overflow-hidden h-3.5 w-[68%] rounded bg-slate-100"
              style={{ backgroundColor: "var(--bg-surface-sunken)" }}
            />
          </div>

          <div
            className="relative overflow-hidden flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 mb-4"
            style={{
              borderRadius: "var(--radius-md)",
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-surface-sunken)",
            }}
          >
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col items-center gap-1">
                <div
                  className="h-3.5 w-8 rounded"
                  style={{ backgroundColor: "var(--primary-soft)" }}
                />
                <div
                  className="h-2.5 w-12 rounded"
                  style={{ backgroundColor: "var(--bg-surface-sunken)" }}
                />
              </div>
            ))}
          </div>

          <div
            className="relative overflow-hidden h-10 w-full rounded-xl bg-slate-200 mt-auto"
            style={{
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface-sunken)",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div
    className="w-full rounded-xl border border-slate-200 bg-white p-4 animate-pulse"
    style={{
      backgroundColor: "var(--bg-card)",
      borderColor: "var(--border)",
      borderRadius: "var(--radius-lg)",
    }}
  >
    <div
      className="flex gap-4 pb-3 border-b border-slate-100 mb-3"
      style={{ borderColor: "var(--border)" }}
    >
      {[...Array(cols)].map((_, i) => (
        <div
          key={i}
          className="h-4 flex-1 bg-slate-200 rounded"
          style={{ backgroundColor: "var(--bg-surface-sunken)" }}
        />
      ))}
    </div>
    <div className="flex flex-col gap-3">
      {[...Array(rows)].map((_, r) => (
        <div
          key={r}
          className="flex gap-4 py-2 border-b border-slate-50 items-center"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {[...Array(cols)].map((_, c) => (
            <div
              key={c}
              className="h-4 flex-1 bg-slate-100 rounded"
              style={{ backgroundColor: "var(--bg-surface-sunken)" }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white animate-pulse"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: "var(--bg-surface-sunken)" }}
        />
        <div className="flex flex-col gap-1.5 w-full">
          <div
            className="h-5 w-12 rounded"
            style={{ backgroundColor: "var(--bg-surface-sunken)" }}
          />
          <div
            className="h-3 w-20 rounded"
            style={{ backgroundColor: "var(--bg-surface-sunken)" }}
          />
        </div>
      </div>
    ))}
  </div>
);

export const LearnPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-6 p-4 animate-pulse">
    <div className="flex-1 flex flex-col gap-4">
      <div
        className="w-full aspect-video rounded-2xl"
        style={{ backgroundColor: "var(--bg-surface-sunken)" }}
      />
      <div
        className="h-6 w-2/3 rounded"
        style={{ backgroundColor: "var(--bg-surface-sunken)" }}
      />
      <div
        className="h-4 w-full rounded"
        style={{ backgroundColor: "var(--bg-surface-sunken)" }}
      />
    </div>
    <div className="w-full lg:w-80 flex flex-col gap-3">
      <div
        className="h-6 w-1/2 rounded mb-2"
        style={{ backgroundColor: "var(--bg-surface-sunken)" }}
      />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-12 w-full rounded-xl"
          style={{ backgroundColor: "var(--bg-surface-sunken)" }}
        />
      ))}
    </div>
  </div>
);

export const CapstoneSubmissionsSkeleton = ({ count = 3 }) => {
  const block = (width, height, radius = "var(--radius-md)", color = "var(--bg-surface-sunken)") => ({
    width,
    height,
    borderRadius: radius,
    backgroundColor: color,
  });

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="relative flex flex-col w-full overflow-hidden animate-pulse"
          style={{
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
            boxShadow: "var(--shadow-convex-sm)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0"
            style={{ height: 3, background: "var(--primary)" }}
          />

          <div className="flex items-start justify-between gap-3 p-5 pb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div style={block(46, 46, "var(--radius-md)")} />
              <div className="flex flex-col gap-2 min-w-0">
                <div style={block(128, 13, "var(--radius-md)")} />
                <div
                  style={{ ...block(160, 10, "var(--radius-md)", "var(--border)") }}
                />
              </div>
            </div>
            <div
              style={{ ...block(78, 24, "var(--radius-full)", "var(--primary-soft)") }}
            />
          </div>

          <div className="flex flex-col gap-2 px-5 pb-3">
            <div style={{ ...block("72%", 12, "var(--radius-md)") }} />
            <div style={{ ...block("46%", 10, "var(--radius-md)", "var(--border)") }} />
          </div>

          <div className="flex gap-3 px-5 pb-3">
            <div style={{ ...block(112, 28, "var(--radius-sm)") }} />
            <div style={{ ...block(112, 28, "var(--radius-sm)") }} />
          </div>

          <div className="flex items-center justify-between px-5 pb-5">
            <div style={{ ...block(110, 10, "var(--radius-md)", "var(--border)") }} />
            <div style={{ ...block(64, 32, "var(--radius-sm)", "var(--primary-soft)") }} />
          </div>
        </div>
      ))}
    </>
  );
};

export const CourseCardSkeleton = ({ count = 6 }) => {
  const block = (width, height, radius = "var(--radius-xs)", color = "var(--bg-surface-sunken)") => ({
    width,
    height,
    borderRadius: radius,
    backgroundColor: color,
  });

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="relative flex flex-row w-full overflow-hidden animate-pulse"
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
            boxShadow: "var(--card-shadow)",
            minHeight: 200,
          }}
        >
          {/* thumbnail rail */}
          <div
            className="relative flex-shrink-0"
            style={{
              width: 240,
              backgroundColor: "var(--bg-surface-sunken)",
              minHeight: 200,
            }}
          >
            <div
              className="absolute"
              style={{
                top: 12,
                left: 12,
                padding: "0.3rem 0.65rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
              }}
            >
              <div style={block(56, 8, "var(--radius-full)")} />
            </div>
          </div>

          {/* body */}
          <div
            className="flex flex-col gap-3 flex-1 min-w-0"
            style={{ padding: "1.25rem 1.5rem" }}
          >
            <div className="flex items-end justify-between gap-4">
              <div style={block("38%", 16)} />
              <div
                style={{ ...block(64, 12, "var(--radius-full)", "var(--primary-soft)") }}
              />
            </div>
            <div style={block("70%", 12, "var(--radius-xs)", "var(--border)")} />
            <div style={block("55%", 12, "var(--radius-xs)", "var(--border)")} />

            <div
              className="flex items-center gap-2"
              style={{
                borderTop: "1px solid var(--divider)",
                paddingTop: "0.85rem",
                marginTop: "auto",
              }}
            >
              <div style={block(86, 11, "var(--radius-xs)", "var(--border)")} />
              <div style={block(86, 11, "var(--radius-xs)", "var(--border)")} />
              <div style={block(104, 11, "var(--radius-xs)", "var(--border)")} />
            </div>
          </div>

          {/* footer rail */}
          <div
            className="flex flex-col gap-2 justify-center flex-shrink-0 px-4"
            style={{
              width: 160,
              borderLeft: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-secondary)",
              padding: "0 1rem",
            }}
          >
            <div style={{ ...block(116, 30, "var(--radius-full)", "var(--primary-soft)") }} />
            <div style={block(116, 30, "var(--radius-full)")} />
            <div style={block(116, 30, "var(--radius-full)")} />
            <div
              style={{ ...block(60, 30, "var(--radius-full)", "var(--danger-soft)") }}
            />
          </div>
        </div>
      ))}
    </>
  );
};
