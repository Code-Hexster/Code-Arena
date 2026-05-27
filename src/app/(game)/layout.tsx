import GameNav from "@/components/layout/GameNav";
import { MultiplayerProvider } from "@/components/multiplayer/MultiplayerProvider";
import MagicalBackground from "@/components/ui/MagicalBackground";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In production, fetch from Supabase
  // For development without Supabase, use mock profile
  let profile = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== "your-supabase-project-url") {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        profile = data;
      }
    }
  } catch {
    // Supabase not configured — continue with null profile
  }

  if (!profile) {
    // We shouldn't hit this often because middleware redirects unauthenticated users,
    // but if profile creation failed, we need a minimal fallback so the UI doesn't crash.
    profile = {
      id: "unknown",
      username: "unknown",
      display_name: "Wandering Coder",
      avatar_url: null,
      total_xp: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_active_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  }

  return (
    <MultiplayerProvider currentUserId={profile?.id !== "unknown" ? profile.id : undefined}>
      <MagicalBackground />
      <div className="min-h-screen flex flex-col relative z-10 text-parchment">
        <GameNav profile={profile} />
        <main className="flex-1 page-transition-wrapper">{children}</main>
      </div>
    </MultiplayerProvider>
  );
}
