import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, X } from "lucide-react";

interface Cycle {
  id: string;
  prompt: string;
  date_time: string;
  opt_in_deadline: string;
}

const QuestionOfWeek = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchActiveCycle();
  }, []);

  const fetchActiveCycle = async () => {
    const { data } = await supabase
      .from("cycles")
      .select("*")
      .eq("is_active", true)
      .single();

    if (data) {
      setCycle(data);
    }
  };

  const handleImIn = async () => {
    if (!user || !cycle) return;

    setLoading(true);
    try {
      const { error: responseError } = await supabase
        .from("responses")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id,
          answer: "I'm in!"
        });

      if (responseError) throw responseError;

      const { error: optInError } = await supabase
        .from("opt_ins")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id
        });

      if (optInError) throw optInError;

      localStorage.setItem(`qotw_seen_${cycle.id}`, "true");

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (cycle) {
      localStorage.setItem(`qotw_seen_${cycle.id}`, "true");
    }
    navigate("/");
  };

  if (!cycle) {
    return null;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary/95 to-secondary">
        <div className="text-center animate-scale-in">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-background/95 backdrop-blur-lg border-2 border-primary/30 shadow-[var(--shadow-glow)]">
            <Sparkles className="w-8 h-8 text-primary animate-glow" />
            <span className="text-2xl font-black text-foreground">you're in! ✨</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <Card className="relative max-w-xl w-full p-10 md:p-14 glass-card border-2 border-white/20 shadow-[var(--shadow-glow)] animate-scale-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110"
        >
          <X className="w-5 h-5 text-white/80" />
        </button>

        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-bold text-sm mb-2 animate-fade-in">
            <Sparkles className="w-5 h-5 animate-glow" />
            question of the week
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight animate-fade-in-up px-4" style={{ animationDelay: "100ms" }}>
            {cycle.prompt}
          </h1>
          
          <div className="flex flex-col gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Button
              onClick={handleImIn}
              disabled={loading}
              variant="gradient"
              size="lg"
              className="w-full gap-2 bg-white hover:bg-white/90 text-primary font-black text-lg py-6"
            >
              {loading ? "joining..." : "I'm in! 🎉"}
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="ghost"
              size="lg"
              className="w-full text-white/80 hover:text-white hover:bg-white/10 font-semibold"
            >
              I'm out / skip
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuestionOfWeek;
