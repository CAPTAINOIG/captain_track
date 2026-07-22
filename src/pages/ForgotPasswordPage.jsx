import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useState } from "react";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="ambient-orb w-[350px] h-[350px] bg-[#FF6B00] top-[-100px] left-[50%]" />
      <div className="ambient-orb w-[250px] h-[250px] bg-[#E040FB] bottom-[-80px] left-[-50px]" />

      <div className="relative z-10 glass-card p-8 w-full max-w-md text-center animate-slide-up">
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#E040FB] rounded-t-2xl" />

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FF6B00] to-[#E040FB] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
              CT
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Captain Track</span>
          </div>
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
              <p className="text-slate-400 mt-2">
                Enter your email and we'll send you a reset link
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Check your email</h1>
              <p className="text-slate-400 mt-2">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>
              </p>
            </>
          )}
        </div>

        {!sent ? (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="text-left">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button className="w-full">Send Reset Link</Button>
          </form>
        ) : (
          <Link to="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        )}

        <p className="text-center text-slate-400 mt-6">
          <Link to="/login" className="text-[#FF6B00] font-medium hover:text-[#E040FB] transition-colors duration-300">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
