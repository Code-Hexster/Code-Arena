"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";
import { Settings, X, RefreshCw, Save, Loader2 } from "lucide-react";

interface SettingsModalProps {
  currentDisplayName: string;
  currentAvatarUrl: string | null;
}

export default function SettingsModal({ currentDisplayName, currentAvatarUrl }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentDisplayName || "");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarStyle, setAvatarStyle] = useState("adventurer");
  const [customUrl, setCustomUrl] = useState(currentAvatarUrl || "");
  const [useCustomUrl, setUseCustomUrl] = useState(!!currentAvatarUrl && !currentAvatarUrl.includes("dicebear.com"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a random seed for DiceBear
  const generateRandomSeed = () => {
    setAvatarSeed(Math.random().toString(36).substring(2, 10));
    setUseCustomUrl(false);
  };

  // Ensure there's a seed when opening
  const handleOpen = () => {
    if (!avatarSeed && !currentAvatarUrl?.includes("dicebear.com")) {
      generateRandomSeed();
    } else if (currentAvatarUrl?.includes("dicebear.com")) {
      // Try to extract style and seed from existing URL if possible, otherwise just use it as custom
      setCustomUrl(currentAvatarUrl);
      setUseCustomUrl(true);
    }
    setIsOpen(true);
  };

  const getDicebearUrl = () => {
    return `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=transparent`;
  };

  const finalAvatarUrl = useCustomUrl ? customUrl : getDicebearUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("display_name", displayName);
    formData.append("avatar_url", finalAvatarUrl);

    try {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 bg-void/60 hover:bg-gold-500/10 text-mist hover:text-gold-300 rounded-lg border border-gold-500/25 transition-colors text-xs font-display font-bold uppercase tracking-widest"
      >
        <Settings className="w-4 h-4 text-gold-400" />
        Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-void/90 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-void border border-gold-500/25 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(244,208,104,0.05)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold-500/10 bg-void">
              <h2 className="font-display-dec text-sm text-parchment flex items-center gap-2 uppercase tracking-widest">
                <Settings className="w-5 h-5 text-gold-400 drop-shadow-[0_0_8px_rgba(244,208,104,0.4)]" />
                Customize Hero
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-mist hover:text-gold-400 p-1 rounded-full hover:bg-gold-500/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto scrollbar-thin">
              <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-display uppercase tracking-widest">
                    {error}
                  </div>
                )}

                {/* Display Name */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-mist uppercase tracking-widest font-display">Hero Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-void border border-gold-500/20 rounded-lg px-4 py-2 text-parchment focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all font-sans"
                    placeholder="Enter your hero name..."
                    minLength={3}
                    maxLength={30}
                    required
                  />
                </div>

                {/* Avatar Preview */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-mist uppercase tracking-widest font-display">Magical Avatar</label>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-void border-2 border-gold-500 shadow-[0_0_15px_rgba(244,208,104,0.2)] flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={finalAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    </div>

                    {!useCustomUrl && (
                      <div className="flex gap-2 w-full">
                        <select 
                          value={avatarStyle}
                          onChange={(e) => setAvatarStyle(e.target.value)}
                          className="flex-1 bg-void border border-gold-500/20 rounded-lg px-3 py-2 text-xs text-parchment focus:outline-none focus:border-gold-400 font-sans"
                        >
                          <option value="adventurer">Adventurer</option>
                          <option value="bottts">Bots</option>
                          <option value="pixel-art">Pixel Art</option>
                          <option value="avataaars">Human</option>
                          <option value="thumbs">Thumbs</option>
                        </select>
                        
                        <button 
                          type="button"
                          onClick={generateRandomSeed}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500/5 text-gold-400 hover:bg-gold-500/15 rounded-lg border border-gold-500/25 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom URL Toggle */}
                <div className="pt-2 border-t border-gold-500/10">
                  <button
                    type="button"
                    onClick={() => setUseCustomUrl(!useCustomUrl)}
                    className="text-[10px] font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300 underline font-display"
                  >
                    {useCustomUrl ? "Use Magical Avatar generator instead" : "Use custom image URL instead"}
                  </button>

                  {useCustomUrl && (
                    <div className="mt-3">
                      <input 
                        type="url" 
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="w-full bg-void border border-gold-500/20 rounded-lg px-3 py-2 text-xs text-parchment focus:outline-none focus:border-gold-400 font-sans"
                        placeholder="https://example.com/my-avatar.png"
                      />
                    </div>
                  )}
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gold-500/10 bg-void flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-mist hover:text-white hover:bg-white/5 transition-colors font-display"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="settings-form"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold bg-gold-500 hover:bg-gold-400 text-void transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display uppercase tracking-widest"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
