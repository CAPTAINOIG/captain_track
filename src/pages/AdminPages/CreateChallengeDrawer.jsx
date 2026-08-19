import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Drawer, ConfigProvider, theme } from "antd";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FaTimes, FaSave } from "react-icons/fa";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useCreateChallege } from "../../api/track";

const CreateChallengeDrawer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOpen = searchParams.get('action') === 'create';

  const { mutateAsync: createChallenge, isPending: isCreateChallengeLoading, isError: isCreateChallengeError } = useCreateChallege();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onClose = () => {
    navigate('/admin', { replace: true });
    reset();
  };

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        description: "",
        target: "",
        current: "",
        participants: "",
        daysRemaining: "",
        badge: "🏅",
        color: "#FF6B00",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (formData) => {
    console.log(formData)
    const newChallenge = {
      id: Date.now(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      target: Number(formData.target) || 0,
      current: Number(formData.current) || 0,
      participants: Number(formData.participants) || 0,
      daysRemaining: Number(formData.daysRemaining) || 0,
      badge: formData.badge.trim() || "🏅",
      color: formData.color || "#FF6B00",
    };
    try {

      const res = await createChallenge(newChallenge)
      console.log(res)

      // if (createChallenge) {
      //   setChallenges((prev) => [newChallenge, ...prev]);
      //   toast.success(`Challenge "${newChallenge.name}" created successfully!`);
      //   onClose();
      // }
    } catch (error) {
      console.log(error?.message)
      const msg = error?.response?.data?.message || error?.message || "Failed to create challenge";
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
              Create Challenge
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target *
              </label>
              <Input
                min="0"
                placeholder="0"
                {...register("target", { 
                  required: "Target is required",
                  min: { value: 0, message: "Must be ≥ 0" }
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.target && (
                <p className="text-red-400 text-sm mt-1">{errors.target.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Progress *
              </label>
              <Input
                min="0"
                placeholder="0"
                {...register("current", { 
                  required: "Current progress is required",
                  min: { value: 0, message: "Must be ≥ 0" }
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.current && (
                <p className="text-red-400 text-sm mt-1">{errors.current.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Participants *
              </label>
              <Input
                min="0"
                placeholder="0"
                {...register("participants", { 
                  required: "Participants count is required",
                  min: { value: 0, message: "Must be ≥ 0" }
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.participants && (
                <p className="text-red-400 text-sm mt-1">{errors.participants.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Days Remaining *
              </label>
              <Input
                min="0"
                placeholder="0"
                {...register("daysRemaining", { 
                  required: "Days remaining is required",
                  min: { value: 0, message: "Must be ≥ 0" }
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.daysRemaining && (
                <p className="text-red-400 text-sm mt-1">{errors.daysRemaining.message}</p>
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