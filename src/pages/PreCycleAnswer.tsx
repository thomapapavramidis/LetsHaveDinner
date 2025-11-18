import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Clock, Sparkles } from "lucide-react";

interface Cycle {
  id: string;
  prompt: string;
  date_time: string;
  opt_in_deadline: string;
}

const PreCycleAnswer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeUntilMatch, setTimeUntilMatch] = useState("");

  useEffect(() => {
    fetchActiveCycle();
  }, []);

  useEffect(() => {
    if (cycle) {
      const interval = setInterval(() => {
        const now = new Date();
        const matchTime = new Date(cycle.date_time);
        const diff = matchTime.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeUntilMatch("Match time has arrived!");
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilMatch(`${days}d ${hours}h ${minutes}m`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cycle]);

  const fetchActiveCycle = async () => {
    const { data } = await supabase
      .from("cycles")
      .select("*")
      .eq("is_active", true)
      .single();

    if (data) {
      setCycle(data);
    } else {
      navigate("/");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user || !cycle || !answer.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    setLoading(true);
    try {
      // Save response
      const { error: responseError } = await supabase
        .from("responses")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id,
          answer: answer.trim()
        });

      if (responseError) throw responseError;

      // Opt user into cycle
      const { error: optInError } = await supabase
        .from("opt_ins")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id
        });

      if (optInError) throw optInError;

      // Mark as answered in localStorage
      localStorage.setItem(`cycle_answered_${cycle.id}`, "true");

      toast.success("Answer submitted! You're in this cycle 🎉");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  if (!cycle) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-primary/90 via-primary to-secondary/80">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="relative max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Countdown */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">{timeUntilMatch}</span>
          </div>
          <p className="text-white/80 text-sm font-medium">until match time</p>
        </div>

        {/* Main Card */}
        <div className="glass-card border-2 border-white/20 shadow-[var(--shadow-glow)] p-8 md:p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-bold text-sm">
              <Sparkles className="w-5 h-5 animate-glow" />
              This Cycle's Prompt
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {cycle.prompt}
            </h1>
          </div>

          <div className="space-y-4">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-32 bg-white/10 border-white/20 text-white placeholder:text-white/60 resize-none"
              disabled={loading}
            />

            <Button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="w-full bg-white hover:bg-white/90 text-primary font-black text-lg py-6"
              size="lg"
            >
              {loading ? "Submitting..." : "Submit Answer & Join Cycle"}
            </Button>
          </div>

          <p className="text-center text-white/70 text-sm">
            You must answer to access the app and join this cycle
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreCycleAnswer;
