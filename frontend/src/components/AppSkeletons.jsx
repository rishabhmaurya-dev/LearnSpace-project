export const CardGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="
            relative
            overflow-hidden
            flex flex-col
            rounded-2xl
            border border-slate-200/80
            bg-white
            p-3.5
            shadow-sm
          "
        >
          {/* =========================================
              SHIMMER OVERLAY
          ========================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              -translate-x-full
              animate-[shimmer_1.8s_infinite]
              bg-gradient-to-r
              from-transparent
              via-white/70
              to-transparent
            "
          />

          {/* =========================================
              THUMBNAIL
          ========================================= */}

          <div
            className="
              relative
              w-full
              aspect-video
              overflow-hidden
              rounded-xl
              bg-gradient-to-br
              from-slate-200
              via-slate-100
              to-slate-200
              mb-4
            "
          >
            <div
              className="
                absolute
                inset-0
                -translate-x-full
                animate-[shimmer_1.8s_infinite]
                bg-gradient-to-r
                from-transparent
                via-white/80
                to-transparent
              "
            />

            {/* Fake image icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-slate-300/70" />
            </div>
          </div>

          {/* =========================================
              CATEGORY + STATUS
          ========================================= */}

          <div className="flex items-center justify-between gap-2 mb-3">
            <div
              className="
                relative
                overflow-hidden
                h-5
                w-24
                rounded-md
                bg-slate-100
              "
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </div>

            <div
              className="
                relative
                overflow-hidden
                h-5
                w-16
                rounded-full
                bg-slate-100
              "
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </div>
          </div>

          {/* =========================================
              TITLE
          ========================================= */}

          <div
            className="
              relative
              overflow-hidden
              h-5
              w-[82%]
              rounded-md
              bg-slate-200
              mb-2.5
            "
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>

          {/* =========================================
              DESCRIPTION
          ========================================= */}

          <div className="space-y-2 mb-4">
            <div
              className="
                relative
                overflow-hidden
                h-3.5
                w-full
                rounded
                bg-slate-100
              "
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </div>

            <div
              className="
                relative
                overflow-hidden
                h-3.5
                w-[68%]
                rounded
                bg-slate-100
              "
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </div>
          </div>

          {/* =========================================
              STATS
          ========================================= */}

          <div
            className="
              relative
              overflow-hidden
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-slate-100
              bg-slate-50/80
              px-3
              py-2.5
              mb-4
            "
          >
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col items-center gap-1">
                <div className="h-3.5 w-8 rounded bg-slate-200" />
                <div className="h-2.5 w-12 rounded bg-slate-100" />
              </div>
            ))}

            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>

          {/* =========================================
              BUTTON
          ========================================= */}

          <div
            className="
              relative
              overflow-hidden
              h-10
              w-full
              rounded-xl
              bg-slate-200
              mt-auto
            "
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>
        </div>
      ))}
    </div>
  );
};
// 2. TABLE SKELETON (Admin Review, Submissions, User List)
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
    {/* Table Header */}
    <div className="flex gap-4 pb-3 border-b border-slate-100 mb-3">
      {[...Array(cols)].map((_, i) => (
        <div key={i} className="h-4 flex-1 bg-slate-200 rounded" />
      ))}
    </div>
    {/* Table Rows */}
    <div className="flex flex-col gap-3">
      {[...Array(rows)].map((_, r) => (
        <div
          key={r}
          className="flex gap-4 py-2 border-b border-slate-50 items-center"
        >
          {[...Array(cols)].map((_, c) => (
            <div key={c} className="h-4 flex-1 bg-slate-100 rounded" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// 3. STATS WIDGET SKELETON (Admin/Student Dashboard Top Stats)
export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white animate-pulse"
      >
        <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
        <div className="flex flex-col gap-1.5 w-full">
          <div className="h-5 w-12 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// 4. LEARN / VIDEO PLAYER SKELETON (Course Player + Sidebar)
export const LearnPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-6 p-4 animate-pulse">
    {/* Video Player Area */}
    <div className="flex-1 flex flex-col gap-4">
      <div className="w-full aspect-video bg-slate-200 rounded-2xl" />
      <div className="h-6 w-2/3 bg-slate-200 rounded" />
      <div className="h-4 w-full bg-slate-100 rounded" />
    </div>
    {/* Sidebar Lesson List */}
    <div className="w-full lg:w-80 flex flex-col gap-3">
      <div className="h-6 w-1/2 bg-slate-200 rounded mb-2" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 w-full bg-slate-100 rounded-xl" />
      ))}
    </div>
  </div>
);
