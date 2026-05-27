import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MissionView from "@/components/game/MissionView";
import InteractiveLevelPlayer from "@/components/game/InteractiveLevelPlayer";

interface MissionPageProps {
  params: Promise<{ id: string }>; // This is actually the slug
}

export default async function MissionPage({ params }: MissionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: mission } = await supabase
    .from("missions")
    .select("*, region:regions(slug)")
    .eq("slug", id)
    .single();

  if (!mission) {
    notFound();
  }

  // Parse test cases if they are stored as JSON strings (Supabase JSONB usually handles this but just in case)
  let parsedTestCases = mission.test_cases;
  if (typeof parsedTestCases === 'string') {
    try {
      parsedTestCases = JSON.parse(parsedTestCases);
    } catch (e) {
      console.error("Failed to parse test cases", e);
      parsedTestCases = [];
    }
  }

  const formattedMission = {
    ...mission,
    test_cases: parsedTestCases,
  };

  // For interactive HTML levels, render the level player instead of MissionView
  if (mission.language === 'html-interactive') {
    return <InteractiveLevelPlayer mission={formattedMission} />;
  }

  return <MissionView mission={formattedMission} />;
}
