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
      // Save response
      const { error: responseError } = await supabase
        .from("responses")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id,
          answer: answer.trim()
        });

      if (responseError) throw responseError;

      // Create opt-in
      const { error: optInError } = await supabase
        .from("opt_ins")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id
        });

      if (optInError) throw optInError;

      // Mark as seen for this cycle
      localStorage.setItem(`qotw_seen_${cycle.id}`, "true");

      toast.success("you're in! ✨");
      navigate("/");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-2xl w-full p-8 md:p-12 bg-background/95 backdrop-blur-lg border-2 border-primary/20 shadow-[var(--shadow-glow)] animate-scale-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-lg mb-4 animate-fade-in">
            <Sparkles className="w-6 h-6" />
            question of the week
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight animate-fade-in" style={{ animationDelay: "100ms" }}>
            {cycle.prompt}
          </h1>
          
          <p className="text-muted-foreground text-lg font-medium animate-fade-in" style={{ animationDelay: "200ms" }}>
            share your thoughts and join this week's dinner! 🍽️
          </p>
        </div>

        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <Textarea
            placeholder="type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[120px] text-lg border-2 border-border focus:border-primary transition-all resize-none font-medium"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAnswerAndJoin}
              disabled={loading || !answer.trim()}
              className="flex-1 h-14 text-lg font-bold gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-[1.02] shadow-[var(--shadow-soft)]"
            >
              {loading ? "saving..." : "answer & join this week"}
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="h-14 text-lg font-semibold border-2 hover:bg-muted/50"
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
