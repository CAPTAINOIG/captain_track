import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Drawer, ConfigProvider, theme } from "antd";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FaTimes, FaSave } from "react-icons/fa";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useUpdateChallenge } from "../../api/track";

const toDateInput = (d) => {
  if (!d) return "";
  try {
    const dt = typeof d === "string" ? new Date(d) : d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  } catch (_) {
    return "";
  }
};

const EditChallengeDrawer = ({ challenges, setChallenges, editingChallenge, setEditingChallenge }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOpen = searchParams.get('action') === 'edit';
  const challengeId = searchParams.get('id');

  const { mutateAsync: updateChallenge, isPending: isUpdateLoading } = useUpdateChallenge();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const challenge = challenges.find(c => String(c.id ?? c._id) === String(challengeId));
  const startDateVal = watch("startDate");

  useEffect(() => {
    if (!isOpen || !challenge) return;
    setEditingChallenge(challenge);
    reset({
      name: challenge.name || "",
      description: challenge.description || "",
      target: challenge.target !== undefined ? String(challenge.target) : "",
      current: challenge.current !== undefined ? String(challenge.current) : "",
      distanceKm: challenge.distanceKm !== undefined ? String(challenge.distanceKm) : "",
      participants: challenge.participants !== undefined ? String(challenge.participants) : "",
      maxParticipants: challenge.maxParticipants?.toString() ?? (challenge.participants?.toString() ?? ""),
      daysRemaining: challenge.daysRemaining?.toString() ?? "",
      badge: challenge.badge || "🏅",
      color: challenge.color || "#FF6B00",
      startDate: toDateInput(challenge.startDate) || toDateInput(new Date()),
      endDate: toDateInput(challenge.endDate) || "",
    });
  }, [isOpen, challenge, reset, setEditingChallenge]);

  useEffect(() => {
    if (!startDateVal) return;
    const st = new Date(startDateVal);
    const edRaw = watch("endDate");
    if (!edRaw) return;
    const ed = new Date(edRaw);
    if (Number.isNaN(st.getTime()) || Number.isNaN(ed.getTime())) return;
    const diffMs = ed.getTime() - st.getTime();
    if (diffMs < 0) return;
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    setValue("daysRemaining", days, { shouldValidate: false });
  }, [startDateVal, watch, setValue]);

  const todayInput = useMemo(() => toDateInput(new Date()), []);

  const onClose = () => {
    navigate('/admin', { replace: true });
    setEditingChallenge(null);
    reset();
  };

  const onSubmit = async (formData) => {
    if (!editingChallenge) return;

    const start = formData.startDate ? new Date(formData.startDate) : new Date(editingChallenge.startDate || Date.now());
    const end = formData.endDate ? new Date(formData.endDate) : new Date(editingChallenge.endDate || Date.now() + 30 * 24 * 60 * 60 * 1000);
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

    const participantsRaw = Number(formData.participants);
    const participants = Number.isFinite(participantsRaw) ? participantsRaw : (Number(editingChallenge.participants) || 1);
    const maxParticipants = Number(formData.maxParticipants) || Math.max(1, participants || 1);

    const distanceKm = Number(formData.distanceKm);
    const target = Number(formData.target);
    const current = Number(formData.current);

    const safeDistance = Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : (Number(editingChallenge.distanceKm) || 0);
    const safeTarget = Number.isFinite(target) && target > 0 ? target : (safeDistance > 0 ? safeDistance : (Number(editingChallenge.target) || 0));
    const safeCurrent = Number.isFinite(current) ? Math.max(0, current) : (Number(editingChallenge.current) || 0);

    try {
      const updatedChallenge = {
        ...editingChallenge,
        name: formData.name.trim(),
        description: formData.description.trim(),
        target: safeTarget,
        current: safeCurrent,
        distanceKm: safeDistance,
        participants,
        maxParticipants,
        joinedParticipants: editingChallenge.joinedParticipants || [],
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        daysRemaining,
        badge: formData.badge.trim() || "🏅",
        color: formData.color || "#FF6B00",
      };

      const recordId = editingChallenge.id ?? editingChallenge._id;

      try {
        if (recordId) {
          await updateChallenge({ id: recordId, data: updatedChallenge });
        }
      } catch (_) {
        /* local update still happens */
      }

      if (typeof setChallenges === "function") {
        setChallenges((prev) =>
          prev.map((c) => (String(c.id ?? c._id) === String(recordId) ? updatedChallenge : c))
        );
      }

      toast.success(`Challenge "${updatedChallenge.name}" updated successfully!`);
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to update challenge";
      toast.error(msg);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#FF6B00",
          colorBgElevated: "#0A0E1A",
          colorBorder: "rgba(255,255,255,0.1)",
          colorText: "#ffffff",
          colorTextSecondary: "#94a3b8",
          borderRadius: 16,
          fontFamily: "inherit",
        },
        components: {
          Drawer: {
            headerBg: "#0A0E1A",
            bodyBg: "#0A0E1A",
            footerBg: "#0A0E1A",
          },
        },
      }}
    >
      <Drawer
        title={
          <div>
            <span className="text-[#FF6B00] text-[0.65rem] font-semibold tracking-[0.3em] uppercase block mb-2">
              Edit
            </span>
            <div className="text-xl font-bold text-white tracking-tight">
              Edit Challenge
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Update the challenge details below.
            </div>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={isOpen && !!challenge}
        width={800}
        extra={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="cursor-pointer flex items-center gap-2"
            >
              <FaTimes size={14} />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="cursor-pointer bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white flex items-center gap-2"
            >
              <FaSave size={14} />
              {isUpdateLoading ? 'Saving...' : 'Update Challenge'}
            </Button>
          </div>
        }
      >
        <form className="space-y-6 pt-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Challenge Name *
            </label>
            <Input
              type="text"
              placeholder="Enter challenge name"
              {...register("name", { required: "Challenge name is required" })}
              className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe the challenge"
              {...register("description", { required: "Description is required" })}
              className="w-full px-3 py-2 bg-white/[0.05] text-white border border-white/10 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 focus:border-[#FF6B00]/50"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Goal *
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 5 for 5km"
                {...register("target", {
                  required: "Target goal is required",
                  min: { value: 0, message: "Must be ≥ 0" },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.target && (
                <p className="text-red-400 text-sm mt-1">{errors.target.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Progress
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                {...register("current", {
                  min: { value: 0, message: "Must be ≥ 0" },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.current && (
                <p className="text-red-400 text-sm mt-1">{errors.current.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maximum Participants *
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 200"
                {...register("maxParticipants", {
                  required: "Maximum participants is required",
                  min: { value: 1, message: "Must be ≥ 1" },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.maxParticipants && (
                <p className="text-red-400 text-sm mt-1">{errors.maxParticipants.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Participants
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="1"
                {...register("participants", {
                  min: { value: 1, message: "Must be ≥ 1" },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.participants && (
                <p className="text-red-400 text-sm mt-1">{errors.participants.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Race Distance (KM) *
            </label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 5"
              {...register("distanceKm", {
                required: "Race distance is required",
                min: { value: 0.1, message: "Distance must be greater than 0" },
              })}
              className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
            />
            {errors.distanceKm && (
              <p className="text-red-400 text-sm mt-1">{errors.distanceKm.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                {...register("startDate", { required: "Start date is required" })}
                className="w-full h-10 px-3 rounded-lg bg-white/[0.05] text-white border border-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 focus:border-[#FF6B00]/50"
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                min={startDateVal || todayInput}
                {...register("endDate", { required: "End date is required" })}
                className="w-full h-10 px-3 rounded-lg bg-white/[0.05] text-white border border-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 focus:border-[#FF6B00]/50"
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Badge Emoji
              </label>
              <Input
                type="text"
                placeholder="🏅"
                {...register("badge")}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Accent Color
              </label>
              <input
                type="color"
                {...register("color")}
                className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
              />
            </div>
          </div>
        </form>
      </Drawer>
    </ConfigProvider>
  );
};

export default EditChallengeDrawer;
