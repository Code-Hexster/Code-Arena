"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const displayName = formData.get("display_name") as string;
  const avatarUrl = formData.get("avatar_url") as string;

  if (!displayName || displayName.trim().length < 3) {
    return { error: "Hero Name must be at least 3 characters long" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName.trim(),
      avatar_url: avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/leaderboard");
  return { success: true };
}
