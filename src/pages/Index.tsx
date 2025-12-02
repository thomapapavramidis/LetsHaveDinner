import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Clock, MapPin, Users, Calendar, Trophy, ThumbsUp, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Cycle {
  id: string;
  title: string;
  prompt: string;
  event_date: string;
  is_active: boolean;
}

interface PairResponse {
  id: string;
  response_text: string;
  vote_count: number;
  group_id: string;
}

interface MatchHistory {
  id: string;
  cycle_id: string;
  event_date: string;
  prompt: string;
  members: string[];
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeUntilMatch, setTimeUntilMatch] = useState("");
  const [timeUntilMonday, setTimeUntilMonday] = useState("");
  const [isAfterMatchTime, setIsAfterMatchTime] = useState(false);
  const [topResponses, setTopResponses] = useState<PairResponse[]>([]);
  const [currentVotingResponse, setCurrentVotingResponse] = useState<PairResponse | null>(null);
  const [unseenResponses, setUnseenResponses] = useState<PairResponse[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [myLastRanking, setMyLastRanking] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      checkCycleStatus();
      fetchMatchHistory();
    }
  }, [user]);

  useEffect(() => {
    if (cycle) {
      const interval = setInterval(() => {
        const now = new Date();
        const matchTime = new Date(cycle.event_date);
        const diff = matchTime.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeUntilMatch("Match time!");
          setIsAfterMatchTime(true);
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilMatch(`${days}d ${hours}h ${minutes}m`);
          setIsAfterMatchTime(false);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cycle]);

  // Calculate time until next Monday (must be before any conditional returns)
  useEffect(() => {
    const calculateTimeUntilMonday = () => {
      const now = new Date();
      const nextMonday = new Date(now);

      const dayOfWeek = now.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);

      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);

      const diff = nextMonday.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilMonday(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    if (!cycle) {
      calculateTimeUntilMonday();
      const interval = setInterval(calculateTimeUntilMonday, 1000);
      return () => clearInterval(interval);
    }
  }, [cycle]);

  const checkCycleStatus = async () => {
    setLoading(true);

    const { data: activeCycle, error } = await supabase
      .from("cycles")
      .select("*")
      .eq("is_active", true)
      .single();

    console.log("Active cycle query result:", { activeCycle, error });

    if (activeCycle) {
      setCycle(activeCycle);

      const answered = localStorage.getItem(`cycle_answered_${activeCycle.id}`);
      setHasAnswered(!!answered);

      // Don't redirect if in admin mode
      if (!answered && !sessionStorage.getItem('admin-mode')) {
        navigate("/answer");
        return;
      }

      const { data: optIn } = await supabase
        .from("opt_ins")
        .select("*")
        .eq("user_id", user?.id)
        .eq("cycle_id", activeCycle.id)
        .single();

      setIsOptedIn(!!optIn);
    } else {
      setCycle(null);
      await fetchLastCycleData();
    }

    setLoading(false);
  };

  const fetchLastCycleData = async () => {
    const { data: lastCycle } = await supabase
      .from("cycles")
      .select("*")
      .eq("is_active", false)
      .order("event_date", { ascending: false })
      .limit(1)
      .single();

    if (lastCycle) {
      const { data: responses } = await supabase
        .from("pair_responses")
        .select("*")
        .eq("cycle_id", lastCycle.id)
        .order("vote_count", { ascending: false })
        .limit(3);

      if (responses) {
        setTopResponses(responses);
      }

      const { data: votedIds } = await supabase
        .from("response_votes")
        .select("response_id")
        .eq("user_id", user?.id);

      const votedResponseIds = votedIds?.map(v => v.response_id) || [];

      const { data: allResponses } = await supabase
        .from("pair_responses")
        .select("*")
        .eq("cycle_id", lastCycle.id)
        .not("id", "in", `(${votedResponseIds.join(",")})`);

      if (allResponses && allResponses.length > 0) {
        setUnseenResponses(allResponses);
        setCurrentVotingResponse(allResponses[0]);
      }

      const { data: userGroup } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user?.id)
        .single();

      if (userGroup) {
        const { data: userResponse } = await supabase
          .from("pair_responses")
          .select("vote_count")
          .eq("cycle_id", lastCycle.id)
          .eq("group_id", userGroup.group_id)
          .single();

        if (userResponse) {
          const { data: allRanked } = await supabase
            .from("pair_responses")
            .select("vote_count")
            .eq("cycle_id", lastCycle.id)
            .order("vote_count", { ascending: false });

          if (allRanked) {
            const ranking = allRanked.findIndex(r => r.vote_count <= userResponse.vote_count) + 1;
            setMyLastRanking(ranking);
          }
        }
      }
    }
  };

  const fetchMatchHistory = async () => {
    if (!user) return;

    const { data: groupMemberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (!groupMemberships) return;

    const groupIds = groupMemberships.map(gm => gm.group_id);

    const { data: groups } = await supabase
      .from("groups")
      .select("id, cycle_id, cycles(prompt, event_date)")
      .in("id", groupIds);

    if (!groups) return;

    const history: MatchHistory[] = [];
    for (const group of groups) {
      const { data: members } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", group.id);

      if (members && group.cycles) {
        // Fetch profile names for all members
        const memberNames: string[] = [];
        for (const member of members) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", member.user_id)
            .single();
          
          if (profile?.name) {
            memberNames.push(profile.name);
          }
        }

        history.push({
          id: group.id,
          cycle_id: group.cycle_id,
          event_date: group.cycles.event_date,
          prompt: group.cycles.prompt,
          members: memberNames.length > 0 ? memberNames : ["Anonymous"]
        });
      }
    }

    setMatchHistory(history.sort((a, b) =>
      new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    ));
  };

  const handleOptOut = async () => {
    if (!user || !cycle) return;

    try {
      const { error: optError } = await supabase
        .from("opt_ins")
        .delete()
        .eq("user_id", user.id)
        .eq("cycle_id", cycle.id);

      if (optError) throw optError;

      const { error: responseError } = await supabase
        .from("responses")
        .delete()
        .eq("user_id", user.id)
        .eq("cycle_id", cycle.id);

      if (responseError) throw responseError;

      localStorage.removeItem(`cycle_answered_${cycle.id}`);

      toast.success("You've opted out of this cycle");
      setIsOptedIn(false);
      setHasAnswered(false);
      navigate("/answer");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleVote = async (responseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("response_votes")
        .insert({
          user_id: user.id,
          response_id: responseId
        });

      if (error) throw error;

      const nextResponses = unseenResponses.filter(r => r.id !== responseId);
      setUnseenResponses(nextResponses);
      setCurrentVotingResponse(nextResponses[0] || null);

      toast.success("Vote recorded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to vote");
    }
  };

  const handleSkipVote = () => {
    const nextResponses = unseenResponses.filter(r => r.id !== currentVotingResponse?.id);
    setUnseenResponses(nextResponses);
    setCurrentVotingResponse(nextResponses[0] || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-20">
        <div className="container max-w-2xl mx-auto p-6 pt-8 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-secondary/80 relative overflow-hidden flex items-center justify-center p-4">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

        <div className="relative text-center space-y-12 animate-fade-in max-w-4xl">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              Next Cycle Starts
            </h1>
            <p className="text-white/80 text-xl md:text-2xl font-medium">
              Monday at Midnight
            </p>
          </div>

          {/* Giant Countdown */}
          <div className="inline-flex items-center justify-center px-12 py-8 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20">
            <Clock className="w-16 h-16 text-white mr-6" />
            <span className="text-6xl md:text-8xl font-black text-white tracking-tight">
              {timeUntilMonday}
            </span>
          </div>

          <p className="text-white/70 text-lg md:text-xl font-medium">
            Check back Monday for the new weekly dinner cycle
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-2xl mx-auto p-6 pt-8 relative space-y-6">
        <div className="animate-fade-in space-y-2">
          <h1 className="text-4xl font-black text-foreground">
            This Week's <span className="gradient-text">Dinner</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            You're in this cycle!
          </p>
        </div>

        <Card className="glass-card border-2 border-primary/30 shadow-[var(--shadow-float)] hover-lift animate-fade-in-up">
          <CardContent className="p-8 space-y-6">
            {!isAfterMatchTime ? (
              <>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <Clock className="w-6 h-6 text-primary" />
                    <span className="text-3xl font-black text-foreground">{timeUntilMatch}</span>
                  </div>
                  <p className="text-muted-foreground font-medium">until match time</p>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Dinner Date</p>
                      <p className="font-bold text-foreground">
                        {new Date(cycle.event_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Location</p>
                      <p className="font-bold text-foreground">Campus Dining Hall</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleOptOut}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Opt Out of This Cycle
                </Button>
              </>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary">
                    <Users className="w-7 h-7 text-white" />
                    <span className="text-2xl font-black text-white">Match Found!</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                    <p className="text-center text-muted-foreground mb-4">Your match details will appear here after matching is complete</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {matchHistory.length > 0 && (
          <Card className="glass-card border-2 border-border animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-foreground">Match History</h3>
              
              <div className="space-y-4">
                {matchHistory.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.event_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="font-semibold text-foreground">{match.prompt}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {match.members.map((member, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
