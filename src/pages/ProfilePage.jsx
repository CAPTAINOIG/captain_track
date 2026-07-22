import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { dummyUsers, dummyStatistics, dummyBadges, dummyActivities, fileToBase64, validateImageFile } from "../data/dummyData";
import { formatTime, formatPace, formatDate } from "../utils/formatters";
import { FaUserEdit, FaCamera } from "react-icons/fa";
import useAuthStore from "../../store/auth";
import { useState, useRef, useEffect } from "react";
import { useGetProfilePicture, useUploadProfilePicture } from "../api/track";
import { toast, Toaster } from "sonner";

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const userId = user?._id;
  const users = dummyUsers[0];
  const fileInputRef = useRef(null);

  const { mutateAsync: uploadProfilePicture, isPending: uploadProfilePictureLoading } = useUploadProfilePicture();
  const { data: profilePictureData, isPending: getProfilePictureLoading, refetch } = useGetProfilePicture();
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const profilePicture = profilePictureData?.data?.url || image || users.avatar;

  useEffect(() => {
    if (profilePictureData?.data?.url) {
      setImage(profilePictureData.data.url);
    }
  }, [profilePictureData]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      validateImageFile(file);
      setLoading(true);
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);
      const base64 = await fileToBase64(file);
      const response = await uploadProfilePicture(base64);
      if (response?.success !== false) {
        toast.success("Profile picture updated successfully!");
        // Refetch to update the UI with the new picture
        await refetch();
      } else {
        throw new Error(response?.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
      setImage(profilePictureData?.data?.url || users.avatar);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Toaster position="top-right" />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card p-8 mb-6 text-center animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-[#FF6B00]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-[#FF6B00] to-[#E040FB]">
                <div 
                  className="w-full h-full rounded-full object-cover ring-2 ring-[#0A0E1A] relative overflow-hidden cursor-pointer group"
                  onClick={handleFileSelect}
                >
                  <img 
                    src={profilePicture} 
                    alt={user?.name || users.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaCamera className="text-white text-2xl" />
                  </div>
                  {loading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">{user?.name || users.name}</h1>
            <p className="text-slate-400 mb-3">@{user?.username || users.username}</p>
            <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">{user?.bio || users.bio}</p>
            <div className="flex items-center justify-center gap-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{(user?.followers?.toLocaleString() || users.followers?.toLocaleString() || 0)}</div>
                <div className="text-xs text-slate-500">Followers</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{(user?.following?.toLocaleString() || users.following?.toLocaleString() || 0)}</div>
                <div className="text-xs text-slate-500">Following</div>
              </div>
            </div>
            <button className="mt-6 flex items-center gap-2 mx-auto text-[#FF6B00] font-medium hover:text-[#E040FB] transition-colors duration-300 text-sm">
              <FaUserEdit /> Edit Profile
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-slide-up-delay-1">
          <div className="glass-card p-4 text-center">
            <div className="text-xl font-bold text-[#FF6B00]">{dummyStatistics.totalDistance}</div>
            <div className="text-xs text-slate-500 mt-0.5">km</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-xl font-bold text-white">{dummyStatistics.totalRuns}</div>
            <div className="text-xs text-slate-500 mt-0.5">runs</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-xl font-bold text-white">
              {formatTime(dummyStatistics.totalTime)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">time</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-xl font-bold text-white">
              {formatPace(dummyStatistics.avgPace)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">avg pace</div>
          </div>
        </div>
        <div className="glass-card p-6 mb-6 animate-slide-up-delay-2">
          <h3 className="text-base font-bold text-white mb-4">Badges</h3>
          <div className="grid grid-cols-4 gap-3">
            {dummyBadges.map((badge) => (
              <div
                key={badge.id}
                className={`text-center p-3 rounded-xl transition-all duration-300 ${
                  badge.earned
                    ? "bg-gradient-to-br from-[#FF6B00]/10 to-[#E040FB]/5 hover:from-[#FF6B00]/20 hover:to-[#E040FB]/10"
                    : "bg-white/[0.03] opacity-30"
                }`}
              >
                <div className="text-2xl mb-1.5">{badge.icon}</div>
                <div className="text-[10px] font-medium text-slate-400">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6 animate-slide-up-delay-3">
          <h3 className="text-base font-bold text-white mb-4">Recent Activities</h3>
          <div className="space-y-1">
            {dummyActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 px-3 rounded-lg border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors duration-200"
              >
                <div>
                  <div className="font-medium text-white text-sm">{activity.type}</div>
                  <div className="text-xs text-slate-500">{formatDate(activity.date)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#FF6B00] text-sm">{activity.distance} km</div>
                  <div className="text-xs text-slate-500">{formatTime(activity.duration)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
