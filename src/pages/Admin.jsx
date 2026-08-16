import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import { dummyChallenges } from '../data/dummyData';
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import CreateChallengeDrawer from './CreateChallengeDrawer';
import EditChallengeDrawer from './EditChallengeDrawer';

const Admin = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState(dummyChallenges);
  const [editingChallenge, setEditingChallenge] = useState(null);

  const handleEdit = (challenge) => {
    navigate(`/admin?action=edit&id=${challenge.id}`);
  };

  const handleDelete = (id) => {
    setChallenges((prev) => prev.filter((challenge) => challenge.id !== id));
    toast.success('Challenge removed successfully!');
  };

  const handleCreateNew = () => {
    navigate('/admin?action=create');
  };

  const getProgress = (challenge) => {
    if (!challenge.target) return 0;
    return Math.min(100, Math.round((challenge.current / challenge.target) * 100));
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[#FF6B00] text-[0.65rem] font-semibold tracking-[0.3em] uppercase block mb-2">
                Dashboard
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Challenge Management
              </h1>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.03] transition-all duration-300 flex items-center space-x-2 cursor-pointer"
              id="add-challenge-btn"
            >
              <FaPlusCircle size={14} />
              <span>Create Challenge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="border border-white/[0.06] overflow-hidden rounded-lg">
          <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                All Challenges
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {challenges.length} {challenges.length === 1 ? 'challenge' : 'challenges'} ready for the app
              </p>
            </div>
          </div>

          {challenges.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-500 text-sm">No challenges yet. Create your first one.</p>
            </div>
          ) : (
            <div className="grid gap-6 p-8 lg:grid-cols-2">
              {challenges.map((challenge) => {
                const progress = getProgress(challenge);
                return (
                  <div
                    key={challenge.id}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 shadow-sm hover:bg-white/[0.04] transition-all duration-300"
                    style={{ borderColor: `${challenge.color}22` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                          style={{ backgroundColor: `${challenge.color}16` }}
                        >
                          {challenge.badge}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{challenge.name}</h3>
                          <p className="text-sm text-slate-400">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: challenge.color }} />
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">
                          {challenge.current} / {challenge.target}
                        </span>
                        <span className="text-slate-400">{progress}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/[0.06]">
                        <div
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%`, backgroundColor: challenge.color }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-300">
                          {challenge.participants.toLocaleString()}
                        </span>{' '}
                        participants · {challenge.daysRemaining} days left
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(challenge.id)}
                          className="rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <CreateChallengeDrawer challenges={challenges} setChallenges={setChallenges} />
        <EditChallengeDrawer challenges={challenges} setChallenges={setChallenges}editingChallenge={editingChallenge} setEditingChallenge={setEditingChallenge} />
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Admin;