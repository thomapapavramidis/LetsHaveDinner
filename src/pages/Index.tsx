import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, CheckCircle2 } from "lucide-react";

const Index = () => {
  const isOptedIn = false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
            CommonTable
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect over dinner, every other week
          </p>
        </div>

        {/* Next Event Card */}
        <Card className="p-6 mb-6 shadow-[var(--shadow-soft)] border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Thursday Dinner
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>November 13, 2025</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>6:30 PM</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Opt-in deadline</p>
              <p className="font-semibold text-primary">Tomorrow, 11:59 PM</p>
            </div>
          </div>

          {!isOptedIn ? (
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-lg py-6"
            >
              <Users className="w-5 h-5 mr-2" />
              I'm in this week!
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-4 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">You're signed up!</span>
            </div>
          )}
        </Card>

        {/* Conversation Prompt Preview */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-secondary/10 to-primary/5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">💬</span>
            This Week's Prompt
          </h3>
          <p className="text-foreground">
            "What's a skill you'd love to learn but haven't had time for yet?"
          </p>
        </Card>

        {/* How It Works */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-center mb-4">How It Works</h3>
          <div className="grid gap-4">
            {[
              { icon: "✅", title: "Opt In", desc: "Sign up by the deadline" },
              { icon: "🎲", title: "Get Matched", desc: "We'll group you with 2-3 others" },
              { icon: "🍽️", title: "Have Dinner", desc: "Meet at your assigned dining hall" },
              { icon: "💭", title: "Share Feedback", desc: "Quick survey after your meal" },
            ].map((step, idx) => (
              <Card key={idx} className="p-4 flex items-start gap-4">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
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
