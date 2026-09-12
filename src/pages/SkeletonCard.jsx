import React from 'react'

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
    <div className="flex items-start gap-3">
      <div className="h-12 w-12 rounded-xl bg-white/[0.06]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded bg-white/[0.06]" />
        <div className="h-3 w-3/4 rounded bg-white/[0.05]" />
      </div>
    </div>
    <div className="mt-6 space-y-2">
      <div className="h-3 w-full rounded bg-white/[0.05]" />
      <div className="h-2.5 w-full rounded-full bg-white/[0.06]" />
    </div>
    <div className="mt-6 h-3 w-2/3 rounded bg-white/[0.05]" />
  </div>
);

export default SkeletonCard