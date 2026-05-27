import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegionMissionsSelector from "@/components/game/RegionMissionsSelector";

interface RegionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch region
  const { data: region } = await supabase
    .from("regions")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!region) {
    notFound();
  }

  // Fetch missions for this region ordered by sort_order
  const { data: missions } = await supabase
    .from("missions")
    .select("*")
    .eq("region_id", region.id)
    .order("sort_order", { ascending: true });

  const regionMissions = missions || [];

  // Fetch user's completed missions for this region to show completion status
  const missionIds = regionMissions.map((m) => m.id);
  
  let completedMissionIds: string[] = [];
  if (missionIds.length > 0) {
    const { data: completions } = await supabase
      .from("mission_completions")
      .select("mission_id")
      .eq("user_id", user.id)
      .in("mission_id", missionIds);
      
    if (completions) {
      completedMissionIds = completions.map((c) => c.mission_id);
    }
  }

  return (
    <RegionMissionsSelector
      region={region}
      missions={regionMissions}
      completedMissionIds={completedMissionIds}
    />
  );
}
