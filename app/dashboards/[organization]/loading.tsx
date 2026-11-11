export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] px-5 py-10 text-[#1d1d1f] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1280px] animate-pulse">
        <div className="h-10 w-72 rounded-xl bg-black/[0.08]" />
        <div className="mt-3 h-5 w-96 max-w-full rounded-lg bg-black/[0.06]" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 rounded-[22px] bg-white ring-1 ring-black/[0.04]" />
          ))}
        </div>
        <div className="mt-5 h-[390px] rounded-[26px] bg-white ring-1 ring-black/[0.04]" />
        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 rounded-[26px] bg-white ring-1 ring-black/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}
