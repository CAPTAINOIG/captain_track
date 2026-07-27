import React from "react";
import { dummyChallenges } from "../data/dummyData";
import { Link } from "react-router-dom";

const Challenges = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Challenges</h3>
        <Link
          to="/challenges"
          className="text-[#FF6B00] text-sm font-medium hover:text-[#E040FB] transition-colors duration-300"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {dummyChallenges.slice(0, 3).map((challenge) => (
          <div key={challenge.id} className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{challenge.badge}</div>
              <div>
                <div className="font-semibold text-white text-sm">
                  {challenge.name}
                </div>
                <div className="text-xs text-slate-500">
                  {challenge.daysRemaining} days left
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>{challenge.current} km</span>
                <span>{challenge.target} km</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                <div
                  className="progress-gradient h-1.5 rounded-full transition-all"
                  style={{
                    width: `${(challenge.current / challenge.target) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenges;
