export const getChallengeStatus = (c) => {
  const now = Date.now();
  const start = c.startDate ? new Date(c.startDate).getTime() : NaN;
  const end = c.endDate ? new Date(c.endDate).getTime() : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { label: "Active", tone: "emerald", dot: "#10B981" };
  }
  if (now < start) return { label: "Upcoming", tone: "sky", dot: "#0EA5E9" };
  if (now > end) return { label: "Ended", tone: "slate", dot: "#64748B" };
  return { label: "Active", tone: "emerald", dot: "#10B981" };
};

export const getProgress = (challenge) => {
    if (!challenge || !challenge.target) return 0;
    const cur = Number(challenge.current) || 0;
    const tgt = Number(challenge.target) || 0;
    if (tgt <= 0) return 0;
    return Math.min(100, Math.round((cur / tgt) * 100));
  };