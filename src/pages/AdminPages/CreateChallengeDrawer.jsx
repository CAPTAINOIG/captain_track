import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Drawer, ConfigProvider, theme } from "antd";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FaTimes, FaSave } from "react-icons/fa";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useCreateChallenge } from "../../api/track";
import useAuthStore from "../../../store/auth";
import { toDateInput } from "../../utils/formatters";

const CreateChallengeDrawer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOpen = searchParams.get('action') === 'create';

  const { mutateAsync: createChallenge, isPending: isCreateChallengeLoading } = useCreateChallenge();
  const { register, handleSubmit, reset, watch, setValue, trigger, formState: { errors } } = useForm();

  const userId = useAuthStore((s) => s.getUserId && s.getUserId());
  const startDateVal = watch("startDate");

  useEffect(() => {
    if (!isOpen) return;
    const today = new Date();
    const defaultStart = today;
    const defaultEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const defaults = {
      name: "",
      description: "",
      target: "",
      current: "",
      participants: "",
      distanceKm: "",
      maxParticipants: "",
      daysRemaining: 30,
      badge: "🏅",
      color: "#FF6B00",
      startDate: toDateInput(defaultStart),
      endDate: toDateInput(defaultEnd),
    };
    reset(defaults);
  }, [isOpen, reset]);

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

  const participantsVal = watch("participants");
  useEffect(() => {
    const maxP = watch("maxParticipants");
    if (maxP !== undefined && maxP !== "") {
      trigger("maxParticipants");
    }
  }, [participantsVal, watch, trigger]);

  const todayInput = useMemo(() => toDateInput(new Date()), []);

  const onSubmit = async (formData) => {
    const newChallenge = {
      userId: userId || null,
      date: new Date().toISOString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      distanceKm: Number(formData.distanceKm) || 0,
      maxParticipants: Number(formData.maxParticipants),
      // joinedParticipants: userId ? [userId] : [],
      startDate: formData.startDate ,
      endDate: formData.endDate,
      // daysRemaining: formData.daysRemaining.trim(),
      badge: formData.badge.trim() || "🏅",
      color: formData.color || "#FF6B00",
    };
    try {
      await createChallenge(newChallenge);
      toast.success(`Challenge "${newChallenge.name}" created successfully!`);
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create challenge";
      toast.error(msg);
    };
  }

  const onClose = () => {
    navigate('/admin', { replace: true });
    reset();
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
              Create New
            </span>
            <div className="text-xl font-bold text-white tracking-tight">
              Add Challenge
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Create a new challenge for the community.
            </div>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={isOpen}
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
              {isCreateChallengeLoading ? 'Creating...' : 'Create Challenge'}
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

          <div className="grid grid-cols-1 gap-4">
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
                  validate: (val) => {
                    const p = Number(participantsVal) || 1;
                    const m = Number(val);
                    if (Number.isFinite(m) && m < p) return `Must be ≥ initial participants (${p})`;
                    return true;
                  },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.maxParticipants && (
                <p className="text-red-400 text-sm mt-1">{errors.maxParticipants.message}</p>
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
                min={todayInput}
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

export default CreateChallengeDrawer;
