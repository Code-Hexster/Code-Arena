import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/map";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if profile exists, create if not
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          const username =
            user.user_metadata?.name?.toLowerCase().replace(/\s+/g, "_") ||
            `hero_${user.id.slice(0, 8)}`;

          await supabase.from("profiles").insert({
            id: user.id,
            username,
            display_name: user.user_metadata?.full_name || user.user_metadata?.name || "New Hero",
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
