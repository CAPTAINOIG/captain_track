import { useEffect } from "react";
import { Drawer, ConfigProvider, theme } from "antd";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateActivity } from "../api/track";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const EditActivityDrawer = ({ open, activity, onClose }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateActivity, isPending: isUpdateActivityLoading } = useUpdateActivity();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (open && activity) {
      reset({
        title: activity?.title || "",
        distance: activity?.distance ?? "",
        duration: activity?.duration ?? "",
        calories: activity?.calories ?? "",
      });
    }
  }, [open, activity, reset]);

  const invalidateActivities = () =>
    queryClient.invalidateQueries({ queryKey: ["activities"] });

  const onSubmit = async (formData) => {
    if (!activity?._id && !activity?.id) return;
    try {
      const id = activity._id || activity.id;
      const payload = {
        ...formData,
        distance: formData.distance === "" ? undefined : Number(formData.distance),
        duration: formData.duration === "" ? undefined : Number(formData.duration),
        calories: formData.calories === "" ? undefined : Number(formData.calories),
      };
      await updateActivity({ id, data: payload });
      toast.success("Activity updated successfully");
      onClose?.();
      await invalidateActivities();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update activity";
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
            <div className="text-xl font-bold text-white tracking-tight">
              Edit activity
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Update the activity details below.
            </div>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={open}
        width={480}
        destroyOnClose
        extra={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isUpdateActivityLoading}
              className="cursor-pointer"
            >
              {isUpdateActivityLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        }
      >
        <form className="space-y-5 pt-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <Input
              type="text"
              placeholder="Morning run"
              {...register("name", { required: "Name is required" })}
              className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Distance (km)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="5.00"
                {...register("distance", {
                  min: { value: 0, message: "Must be ≥ 0" },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.distance && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.distance.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration (s)
              </label>
              <Input
                type="number"
                placeholder="1800"
                {...register("duration", {
                  min: { value: 0, message: "Must be ≥ 0" },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.duration && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.duration.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Calories
              </label>
              <Input
                type="number"
                placeholder="350"
                {...register("calories", {
                  min: { value: 0, message: "Must be ≥ 0" },
                })}
                className="!bg-white/[0.05] !text-white !border-white/10 placeholder-slate-500"
              />
              {errors.calories && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.calories.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </Drawer>
    </ConfigProvider>
  );
};

export default EditActivityDrawer;
