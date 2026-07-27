import React from "react";
import { dummyBadges } from "../data/dummyData";

const Badges = () => {
  return (
    <div>
      {" "}
      <div className="mt-8">
        <h3 className="text-base font-bold text-white mb-4">Badges</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {dummyBadges.map((badge) => (
            <div
              key={badge.id}
              className={`glass-card p-3 text-center group transition-all duration-300 ${
                !badge.earned
                  ? "opacity-30"
                  : "hover:bg-white/[0.07] hover:shadow-lg hover:shadow-orange-500/10"
              }`}
            >
              <div
                className={`text-2xl mb-1.5 ${badge.earned ? "animate-float" : ""}`}
                style={{ animationDelay: `${badge.id * 0.3}s` }}
              >
                {badge.icon}
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                {badge.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Badges;
