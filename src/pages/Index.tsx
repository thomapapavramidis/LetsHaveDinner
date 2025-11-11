import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Calendar, MapPin, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Cycle {
  id: string;
  prompt: string;
  date_time: string;
  opt_in_deadline: string;
  is_active: boolean;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkForNewCycle();
    }
  }, [user]);

  const checkForNewCycle = async () => {
    setLoading(true);
    const { data: activeCycle } = await supabase
      .from("cycles")
      .select("*")
      .eq("is_active", true)
      .single();

    if (activeCycle) {
      setCycle(activeCycle);
      
      const hasSeenPrompt = localStorage.getItem(`qotw_seen_${activeCycle.id}`);
      
      if (!hasSeenPrompt) {
        navigate("/question-of-week");
        return;
      }

      const { data: optIn } = await supabase
        .from("opt_ins")
        .select("*")
        .eq("user_id", user?.id)
        .eq("cycle_id", activeCycle.id)
        .single();

      setIsOptedIn(!!optIn);
    }
    setLoading(false);
  };

  const handleOptIn = async () => {
    if (!user || !cycle) return;

    try {
      const { error } = await supabase
        .from("opt_ins")
        .insert({
          user_id: user.id,
          cycle_id: cycle.id
        });

      if (error) throw error;

      setIsOptedIn(true);
      toast.success("you're in for this week! 🎉");
    } catch (error) {
      console.error(error);
      toast.error("something went wrong, try again");
    }
  };

  const handleOptOut = async () => {
    if (!user || !cycle) return;

    try {
      const { error } = await supabase
        .from("opt_ins")
        .delete()
        .eq("user_id", user.id)
        .eq("cycle_id", cycle.id);

      if (error) throw error;

      setIsOptedIn(false);
      toast.success("you're out for this week");
    } catch (error) {
      console.error(error);
      toast.error("something went wrong, try again");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20">
        <div className="container max-w-2xl mx-auto p-6 pt-8">
          <Skeleton className="h-8 w-64 mb-8 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <Navigation />
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20">
        <div className="container max-w-2xl mx-auto p-6 pt-8">
          <Card className="glass-card border-2 border-border hover-lift animate-fade-in">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold text-muted-foreground">
                no active dinner cycle right now. check back soon!
              </p>
            </CardContent>
          </Card>
        </div>
        <Navigation />
      </div>
    );
  }

  const eventDate = new Date(cycle.date_time);
  const deadline = new Date(cycle.opt_in_deadline);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-2xl mx-auto p-6 pt-8 relative">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-black text-foreground mb-2">
            this week's <span className="gradient-text">dinner</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            connect with new friends over a meal
          </p>
        </div>

        <Card className="glass-card border-2 border-border shadow-[var(--shadow-float)] hover-lift mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-black mb-2">weekly question</CardTitle>
                <CardDescription className="text-base font-medium">{cycle.prompt}</CardDescription>
              </div>
              <Sparkles className="w-8 h-8 text-primary animate-glow flex-shrink-0" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 transition-all hover:bg-muted">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">dinner date</p>
                  <p className="font-bold text-foreground">{eventDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 transition-all hover:bg-muted">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">location</p>
                  <p className="font-bold text-foreground">campus dining hall</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 transition-all hover:bg-muted">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">opt-in deadline</p>
                  <p className="font-bold text-foreground">{deadline.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>

            {isOptedIn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 animate-scale-in">
                  <CheckCircle2 className="w-6 h-6 text-primary animate-glow" />
                  <span className="text-lg font-black text-foreground">you're in this week! 🎉</span>
                </div>
                <Button 
                  onClick={handleOptOut} 
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  change my mind, opt out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleOptIn} 
                variant="gradient"
                size="lg"
                className="w-full gap-2"
              >
                <Sparkles className="w-5 h-5" />
                i'm in this week!
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-2 border-border/50 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center font-medium">
              <span className="font-bold text-foreground">how it works:</span> opt in by the deadline, get matched with 3-4 students, 
              meet at the dining hall for dinner and great conversation!
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Index;
