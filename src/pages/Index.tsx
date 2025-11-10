import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCycle, setActiveCycle] = useState<any>(null);

  useEffect(() => {
    fetchActiveCycle();
  }, [user]);

  const fetchActiveCycle = async () => {
    const { data: cycle } = await supabase
      .from("cycles")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (cycle) {
      setActiveCycle(cycle);
      checkOptInStatus(cycle.id);
    }
  };

  const checkOptInStatus = async (cycleId: string) => {
    if (!user) return;
    
    const { data } = await supabase
      .from("opt_ins")
      .select("*")
      .eq("cycle_id", cycleId)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsOptedIn(!!data);
  };

  const handleOptIn = async () => {
    if (!user || !activeCycle) return;
    
    setLoading(true);
    try {
      if (isOptedIn) {
        await supabase
          .from("opt_ins")
          .delete()
          .eq("cycle_id", activeCycle.id)
          .eq("user_id", user.id);
        
        setIsOptedIn(false);
        toast.success("You're out for this week 👋");
      } else {
        await supabase
          .from("opt_ins")
          .insert({ cycle_id: activeCycle.id, user_id: user.id });
        
        setIsOptedIn(true);
        toast.success("You're in! See you Thursday! 🎉");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/5 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3 tracking-tight">
            CommonTable
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Blind date: dinner edition ✨
          </p>
        </div>

        {/* Next Event Card */}
        <Card className="p-8 mb-6 shadow-[var(--shadow-soft)] border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-[var(--shadow-glow)] transition-all duration-300 animate-scale-in">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                <Sparkles className="w-3 h-3" />
                NEXT UP
              </div>
              <h2 className="text-3xl font-black text-foreground mb-3">
                thursday dinner
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>november 13, 2025</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Clock className="w-4 h-4" />
                  <span>6:30 pm</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">deadline</p>
              <p className="font-bold text-primary text-lg">tomorrow 11:59 pm</p>
            </div>
          </div>

          {!isOptedIn ? (
            <Button 
              onClick={handleOptIn}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white text-lg py-7 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <Users className="w-5 h-5 mr-2" />
              {loading ? "loading..." : "i'm in this week! 🙋"}
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 py-4 text-primary bg-primary/10 rounded-2xl">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">you're signed up! ✨</span>
              </div>
              <Button 
                onClick={handleOptIn}
                disabled={loading}
                variant="outline"
                className="w-full text-sm font-semibold"
              >
                {loading ? "loading..." : "actually nvm, i'm out"}
              </Button>
            </div>
          )}
        </Card>

        {/* Conversation Prompt Preview */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-secondary/10 via-primary/5 to-accent/10 border-2 border-secondary/20 hover:shadow-lg transition-all duration-300">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
            <span className="text-2xl">💬</span>
            this week's convo starter
          </h3>
          <p className="text-foreground font-medium leading-relaxed">
            "{activeCycle?.prompt || "what's a skill you'd love to learn but haven't had time for yet?"}"
          </p>
        </Card>

        {/* How It Works */}
        <div className="space-y-4">
          <h3 className="font-black text-xl text-center mb-6">how it works</h3>
          <div className="grid gap-3">
            {[
              { icon: "✅", title: "Opt in", desc: "tap that button before the deadline" },
              { icon: "🎲", title: "Get matched", desc: "we'll group you with a cool person" },
              { icon: "🍽️", title: "Have dinner", desc: "meet up at your assigned dining hall" },
              { icon: "💭", title: "Drop feedback", desc: "quick survey after (takes 30 sec)" },
            ].map((step, idx) => (
              <Card key={idx} className="p-5 flex items-start gap-4 hover:shadow-md transition-all duration-200 hover:translate-x-1 bg-card/80 backdrop-blur-sm">
                <span className="text-3xl">{step.icon}</span>
                <div>
                  <p className="font-bold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground font-medium">{step.desc}</p>




                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
