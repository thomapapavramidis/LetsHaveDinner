import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Sparkles, ArrowRight, X } from "lucide-react";

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
  const [answer, setAnswer] = useState("");
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

  const handleAnswerAndJoin = async () => {
    if (!user || !cycle || !answer.trim()) {
      toast.error("please write an answer first!");
      return;
    }

    setLoading(true);
    try {
      const { error: responseError } = await supabase
        .from("responses")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id,
          answer: answer.trim()
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <Card className="relative max-w-2xl w-full p-8 md:p-12 glass-card border-2 border-primary/20 shadow-[var(--shadow-glow)] animate-scale-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-muted/50 rounded-full transition-all hover:scale-110"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="text-center mb-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-black text-lg mb-4 shadow-[var(--shadow-button)] animate-fade-in">
            <Sparkles className="w-6 h-6 animate-glow" />
            question of the week
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {cycle.prompt}
          </h1>
          
          <p className="text-muted-foreground text-lg font-semibold animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            share your thoughts and join this week's dinner! 🍽️
          </p>
        </div>

        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Textarea
            placeholder="type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[140px] text-lg border-2 border-border focus:border-primary transition-all resize-none font-medium rounded-xl bg-background/50 backdrop-blur-sm"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAnswerAndJoin}
              disabled={loading || !answer.trim()}
              variant="gradient"
              size="lg"
              className="flex-1 gap-2"
            >
              {loading ? "saving..." : "answer & join this week"}
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              size="lg"
              className="sm:w-auto"
            >
              skip for now
            </Button>
          </div>

          <p className="text-sm text-center text-muted-foreground font-medium">
            your answer will be saved and you'll be automatically opted in for this week's dinner
          </p>
        </div>
      </Card>
    </div>
  );
};

export default QuestionOfWeek;
