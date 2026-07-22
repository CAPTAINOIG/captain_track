import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { dummyChallenges } from "../data/dummyData";
import { Button } from "../components/ui/Button";

export const ChallengesPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Challenges</h1>
          <p className="text-slate-400 mt-1">Join challenges and earn badges</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 animate-slide-up-delay-1">
          {dummyChallenges.map((challenge) => {
            const progress = (challenge.current / challenge.target) * 100;
            return (
              <div key={challenge.id} className="glass-card glass-card-hover overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="text-3xl w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00]/15 to-[#E040FB]/10 flex items-center justify-center group-hover:from-[#FF6B00]/25 group-hover:to-[#E040FB]/15 transition-all duration-300">
                      {challenge.badge}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{challenge.name}</h3>
                      <p className="text-sm text-slate-500">{challenge.description}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#FF6B00] font-semibold">{challenge.current} km</span>
                      <span className="text-slate-500">{challenge.target} km</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-2.5">
                      <div
                        className="progress-gradient h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-xs text-slate-500">{Math.round(progress)}% complete</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      <span className="text-slate-300 font-medium">{challenge.participants.toLocaleString()}</span> participants · {challenge.daysRemaining} days left
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
