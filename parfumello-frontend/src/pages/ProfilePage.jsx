import { useState, useEffect, useRef } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Heart, X, Pencil, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function ProfilePage() {
  const { user, refreshProfile, updateUsername, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const fileInputRef = useRef(null);
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const res = await api.get("/api/profile/");
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePicUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("profile_pic", file);
    try {
      const res = await api.patch("/api/profile/update_pic/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      await refreshProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function startEditingUsername() {
    setNewUsername(user.username);
    setUsernameError("");
    setEditingUsername(true);
    setTimeout(() => usernameInputRef.current?.focus(), 0);
  }

  async function handleUsernameSave() {
    if (newUsername.trim() === user.username) { setEditingUsername(false); return; }
    setSavingUsername(true);
    setUsernameError("");
    try {
      await api.patch("/api/profile/update_username/", { username: newUsername.trim() });
      updateUsername(newUsername.trim());
      setEditingUsername(false);
    } catch (e) {
      setUsernameError(e.response?.data?.error || "Failed to update username.");
    } finally {
      setSavingUsername(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-rose-50/30">
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Profile header */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-8 mb-8">
            <div className="flex items-center gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-rose-200">
                  {profile?.profile_pic_url ? (
                    <img
                      src={profile.profile_pic_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-rose-100 flex items-center justify-center">
                      <span className="text-4xl font-serif text-rose-400">
                        {user.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors disabled:opacity-60"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePicUpload}
                />
              </div>

              {/* Info */}
              <div>
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={usernameInputRef}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleUsernameSave(); if (e.key === "Escape") setEditingUsername(false); }}
                      className="text-2xl font-serif text-rose-900 border-b-2 border-rose-300 focus:border-rose-500 outline-none bg-transparent w-48"
                    />
                    <button
                      onClick={handleUsernameSave}
                      disabled={savingUsername}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => setEditingUsername(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/username">
                    <h1 className="text-3xl font-serif text-rose-900">{user.username}</h1>
                    <button
                      onClick={startEditingUsername}
                      className="opacity-0 group-hover/username:opacity-100 transition-opacity p-1 hover:bg-rose-50 rounded-full"
                      title="Edit username"
                    >
                      <Pencil className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                )}
                {usernameError && <p className="text-red-400 text-xs mt-1">{usernameError}</p>}
                {profile?.user?.email && (
                  <p className="text-gray-500 mt-1">{profile.user.email}</p>
                )}
                {uploading && (
                  <p className="text-xs text-rose-400 mt-2">Uploading photo...</p>
                )}
              </div>
            </div>
          </div>

          {/* Favourites */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-200" />
              <h2 className="text-xl font-serif text-rose-900">Favourite Perfumes</h2>
            </div>

            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : profile?.favorite_perfumes?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {profile.favorite_perfumes.map((perfume) => (
                  <div key={perfume.id} className="group relative bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => {
                        toggleFavorite(perfume.id);
                        setProfile((prev) => ({
                          ...prev,
                          favorite_perfumes: prev.favorite_perfumes.filter((p) => p.id !== perfume.id),
                        }));
                      }}
                      className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                      title="Remove from favourites"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                    </button>
                    <Link to={`/perfumes/${perfume.id}`}>
                      <div className="aspect-square overflow-hidden bg-rose-50">
                        <img
                          src={perfume.image_url || "/placeholder.jpg"}
                          alt={perfume.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{perfume.name}</p>
                        <p className="text-xs text-gray-500">{perfume.brand?.name}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Heart className="w-14 h-14 mx-auto mb-4 text-rose-200" />
                <p className="text-lg">No favourites yet.</p>
                <Link
                  to="/"
                  className="mt-4 inline-block text-rose-500 hover:text-rose-700 transition-colors text-sm"
                >
                  Start exploring perfumes
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default ProfilePage;
