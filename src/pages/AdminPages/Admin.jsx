import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaTrash, FaPlusCircle, FaTrophy, FaUsers, FaCalendarAlt,
  FaRunning, FaClock, FaEye, FaCalendarCheck, FaCalendarDay, FaFire
} from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import { Navbar } from "../../components/layout/Navbar";
import { BottomNav } from "../../components/layout/BottomNav";
import CreateChallengeDrawer from './CreateChallengeDrawer';
import EditChallengeDrawer from './EditChallengeDrawer';
import { Button } from "../../components/ui/Button";
import { useGetChallenge, useDeleteChallenge } from '../../api/track';
import { getChallengeStatus, getProgress } from '../../utils/data';
import { formatChallengeDate } from '../../utils/formatters';
import SkeletonCard from '../SkeletonCard';
import KpiCard from './KpiCard';

const Admin = () => {
  const navigate = useNavigate();
  const { data: challengeData, isPending, isError, refetch } = useGetChallenge();
  const { mutateAsync: deleteChallenge, isPending: isDeleting } = useDeleteChallenge();
  const [editingChallenge, setEditingChallenge] = useState(null);

  const list = useMemo(() => {
    if (!challengeData) return [];
    if (Array.isArray(challengeData)) return challengeData;
    if (Array.isArray(challengeData.data)) return challengeData.data;
    if (Array.isArray(challengeData.challenges)) return challengeData.challenges;
    return [];
  }, [challengeData]);

  const kpis = useMemo(() => {
    let active = 0, upcoming = 0, ended = 0, joinedCount = 0;
    const now = Date.now();
    list.forEach((c) => {
      joinedCount += Number(c.joinedCount) || 0;
      const start = c.startDate ? new Date(c.startDate).getTime() : NaN;
      const end = c.endDate ? new Date(c.endDate).getTime() : NaN;
      if (!Number.isFinite(start) || !Number.isFinite(end)) { active++; return; }
      if (now < start) upcoming++;
      else if (now > end) ended++;
      else active++;
    });
    return {
      total: list.length,
      active,
      upcoming,
      ended,
      joinedCount,
    };
  }, [list]);

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    navigate(`/admin?action=edit&id=${challenge.id ?? challenge._id}`);
  };

  const handleView = (challenge) => {
    toast.message(`Viewing "${challenge.name}"`, {
      description: `${challenge.joinedCount || 0} participants · Ends ${formatChallengeDate(challenge.endDate)}`,
    });
  };

  const handleDelete = async (challenge) => {
    const id = challenge.id ?? challenge._id;
    if (!id) {
      toast.error("Cannot delete: missing challenge id");
      return;
    }
    const ok = window.confirm(`Delete challenge "${challenge.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteChallenge(id);
      toast.success(`Challenge "${challenge.name}" deleted.`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(msg);
    }
  };

  const handleCreateNew = () => {
    navigate('/admin?action=create');
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <Toaster position="top-right" richColors closeButton />

      <div className="border-b border-white/[0.06] bg-gradient-to-b from-[#FF6B00]/[0.04] to-transparent mx-10 md:mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <span className="text-[#FF6B00] text-[0.65rem] font-semibold tracking-[0.3em] uppercase block mb-2">
                Admin · Dashboard
              </span>
              <h1 className="md:text-3xl text-xl font-extrabold text-white tracking-tight">
                Challenge Management
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                Create, edit and monitor every community challenge in one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => refetch()}
                className="cursor-pointer"
              >
                Refresh
              </Button>
              <Button
                type="button"
                onClick={handleCreateNew}
                className="cursor-pointer bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white px-4 py-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2"
                id="add-challenge-btn"
              >
                <FaPlusCircle size={14} />
                <span>Create Challenge</span>
              </Button>
            </div>
          </div>  

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <KpiCard icon={FaTrophy} label="Total" value={kpis.total} accent="#FF6B00" sub="challenges" />
            <KpiCard icon={FaFire} label="Active" value={kpis.active} accent="#10B981" sub="running now" />
            <KpiCard icon={FaCalendarDay} label="Upcoming" value={kpis.upcoming} accent="#0EA5E9" sub="scheduled" />
            <KpiCard icon={FaUsers} label="Participants" value={kpis.joinedCount.toLocaleString()} accent="#E040FB" sub="joined across all" />
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 mx-10 md:mx-auto">
        <div className="border border-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.015]">
          <div className="px-6 md:px-8 py-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaTrophy className="text-[#FF6B00]" size={16} />
                All Challenges
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {list.length} {list.length === 1 ? 'challenge' : 'challenges'}
                {kpis.active > 0 && ` · ${kpis.active} active`}
                {kpis.upcoming > 0 && ` · ${kpis.upcoming} upcoming`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Active</span>
              <span className="flex items-center gap-1.5 text-sky-400"><span className="h-2 w-2 rounded-full bg-sky-400" /> Upcoming</span>
              <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-full bg-slate-500" /> Ended</span>
            </div>
          </div>

          {isError && (
            <div className="p-10 text-center">
              <p className="text-red-400 text-sm">Couldn't load challenges. Check connection or refresh.</p>
              <button onClick={() => refetch()} className="mt-3 text-xs underline text-slate-400 hover:text-white cursor-pointer">
                Try again
              </button>
            </div>
          )}

          {isPending && !isError && (
            <div className="grid gap-5 p-6 md:p-8 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!isPending && !isError && list.length === 0 && (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] mb-4">
                <FaTrophy size={22} />
              </div>
              <p className="text-slate-300 text-base font-medium">No challenges yet</p>
              <p className="text-slate-500 text-sm mt-1">Create your first challenge for the community.</p>
              <Button className="mt-5 cursor-pointer" onClick={handleCreateNew}>
                <FaPlusCircle size={14} className="mr-2" /> Create Challenge
              </Button>
            </div>
          )}

          {!isPending && !isError && list.length > 0 && (
            <div className="divide-y divide-white/[0.04]">
              {list.map((challenge) => {
                const progress = getProgress(challenge);
                const status = getChallengeStatus(challenge);
                const distanceKm = Number(challenge.distanceKm);
                const id = challenge.id ?? challenge._id;
                const joinedCount = Number(challenge.joinedCount) || 0;
                const maxParticipants = Number(challenge.maxParticipants) || 0;
                return (
                  <div
                    key={id ?? challenge.name}
                    className="group relative flex flex-col lg:flex-row lg:items-stretch gap-5 p-6 md:p-7 hover:bg-white/[0.025] transition-all duration-300"
                  >
                    <div
                      className="absolute left-0 top-0 h-full w-1 rounded-r-full"
                      style={{ backgroundColor: challenge.color || "#FF6B00" }}
                    />

                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className="flex-shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-sm"
                        style={{ backgroundColor: `${challenge.color || "#FF6B00"}18` }}
                      >
                        {challenge.badge || "🏅"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-base md:text-lg font-bold text-white truncate">{challenge.name}</h3>
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide"
                            style={{ backgroundColor: `${status.dot}1A`, color: status.dot }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                            {status.label}
                          </span>
                          {Number.isFinite(distanceKm) && distanceKm > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.65rem] font-semibold text-slate-300">
                              <FaRunning size={9} />
                              {distanceKm} km
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{challenge.description}</p>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <FaCalendarAlt size={11} className="text-slate-500" />
                            <span><span className="text-slate-500">Start:</span> <span className="text-slate-300 font-medium">{formatChallengeDate(challenge.startDate)}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaCalendarCheck size={11} className="text-slate-500" />
                            <span><span className="text-slate-500">End:</span> <span className="text-slate-300 font-medium">{formatChallengeDate(challenge.endDate)}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2 md:col-span-1 mt-5">
                            <FaClock size={11} className="text-slate-500" />
                            <span>
                              <span className="text-slate-500">Days left:</span>{' '}
                              <span className="text-slate-300 font-medium">
                                {Number.isFinite(Number(challenge.daysRemaining)) ? challenge.daysRemaining : "—"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col justify-between gap-3 lg:min-w-[200px] lg:border-l lg:border-white/[0.05] lg:pl-5 pt-3 lg:pt-0 sm:items-center">
                      <div className="flex sm:flex-col gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <FaUsers size={11} className="text-slate-500" />
                          <span>
                            <span className="text-slate-200 font-semibold">{joinedCount.toLocaleString()}</span>
                            {maxParticipants > 0 && (
                              <span className="text-slate-500"> / {maxParticipants.toLocaleString()}</span>
                            )}
                            <span className="text-slate-500 ml-1">joined</span>
                          </span>
                        </div>
                        {maxParticipants > 0 && (
                          <div className="sm:mt-1">
                            <div className="h-1 w-full sm:w-24 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, Math.round((joinedCount / maxParticipants) * 100))}%`,
                                  backgroundColor: challenge.color || "#FF6B00",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(challenge)}
                          className="cursor-pointer !py-1.5 !bg-white"
                          title="View details"
                        >
                          <FaEye size={20} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(challenge)}
                          className="cursor-pointer !py-1.5"
                          title="Edit challenge"
                        >
                          <FaEdit size={20} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleDelete(challenge)}
                          disabled={isDeleting}
                          className="cursor-pointer !py-1.5 !bg-red-500/10 !text-white hover:!bg-red-500/20 hover:!text-red-300 !shadow-none"
                          title="Delete challenge"
                        >
                          <FaTrash size={20} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <CreateChallengeDrawer />
        <EditChallengeDrawer challenges={list} editingChallenge={editingChallenge} setEditingChallenge={setEditingChallenge} />
      </div>

      <BottomNav />
    </div>
  );
};

export default Admin;
