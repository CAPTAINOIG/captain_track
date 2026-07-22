import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useLoginUser } from "../api/track";
import useAuthStore from "../../store/auth";

 const LoginPage = () => {
  const { mutateAsync: loginUser, isPending: isLoding, isError: loginError } = useLoginUser();
  const { setAuth } = useAuthStore();

  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data);
      toast.success(res.message || "Login successful!")  
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard')
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "An error occurred"
      toast.error(errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="ambient-orb w-[400px] h-[400px] bg-[#FF6B00] top-[-150px] right-[-100px]" />
      <div className="ambient-orb w-[300px] h-[300px] bg-[#E040FB] bottom-[-100px] left-[-50px]" />
      <Toaster position="top-right" />
      <div className="relative z-10 glass-card p-8 w-full max-w-md animate-slide-up">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#E040FB] rounded-t-2xl" />
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FF6B00] to-[#E040FB] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
              CT
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Captain Track</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-[#FF6B00] hover:text-[#E040FB] transition-colors duration-300">
              Forgot password?
            </Link>
          </div>
          <Button className="w-full cursor-pointer" type="submit">{isLoding ? 'Signing in...' : 'Sign In'}</Button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#FF6B00] font-medium hover:text-[#E040FB] transition-colors duration-300 cursor-pointer">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;