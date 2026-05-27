import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MissionView from "@/components/game/MissionView";

interface ArenaPageProps {
  params: Promise<{ matchId: string }>;
}

export default async function ArenaPage({ params }: ArenaPageProps) {
  const { matchId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) {
    console.error("Match not found:", matchError);
    return <div className="text-white p-10 text-center">Match not found. Error: {JSON.stringify(matchError)}</div>;
  }

  // Verify user is in this match
  if (match.player1_id !== user.id && match.player2_id !== user.id) {
    redirect("/map");
  }

  const opponentId = match.player1_id === user.id ? match.player2_id : match.player1_id;

  // Fetch mission
  const { data: mission } = await supabase
    .from("missions")
    .select("*, region:regions(slug)")
    .eq("id", match.mission_id)
    .single();

  if (!mission) {
    console.error("Mission not found for match:", match);
    return <div className="text-white p-10 text-center">Mission not found.</div>;
  }

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

  return (
    <MissionView 
      mission={formattedMission} 
      matchId={match.id} 
      opponentId={opponentId} 
    />
  );
}
