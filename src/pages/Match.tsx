import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, MessageSquare, Users, Sparkles } from "lucide-react";

const Match = () => {
  const mockMatch = {
    eventTime: "Wednesday, Nov 15 at 6:30 PM",
    location: "Commons Dining Hall",
    conversationStarter: "If you could have dinner with any historical figure, who would it be and why?",
    groupMembers: [
      { name: "Sarah Chen", major: "Computer Science", year: "Junior" },
      { name: "Alex Johnson", major: "Psychology", year: "Sophomore" },
      { name: "Maya Patel", major: "Economics", year: "Senior" },
      { name: "You", major: "Your Major", year: "Your Year" },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-2xl mx-auto p-6 pt-8 relative">
        {/* Hero Banner */}
        <div className="mb-8 text-center animate-scale-in">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-black text-2xl mb-4 shadow-[var(--shadow-glow)] animate-float">
            <Sparkles className="w-8 h-8 animate-glow" />
            MATCH FOUND
            <Sparkles className="w-8 h-8 animate-glow" />
          </div>
          <p className="text-xl font-bold text-muted-foreground animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {mockMatch.eventTime}
          </p>
        </div>

        {/* Location Card */}
        <Card className="mb-6 glass-card border-2 border-primary/20 shadow-[var(--shadow-float)] hover-lift animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black">meeting spot</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border-2 border-primary/20">
              {mockMatch.location}
            </p>
          </CardContent>
        </Card>

        {/* Conversation Starter */}
        <Card className="mb-6 glass-card border-2 border-border shadow-[var(--shadow-float)] hover-lift animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black">conversation prompt</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground leading-relaxed bg-muted/50 p-5 rounded-xl border border-border">
              {mockMatch.conversationStarter}
            </p>
          </CardContent>
        </Card>

        {/* Group Members */}
        <Card className="glass-card border-2 border-border shadow-[var(--shadow-float)] hover-lift animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black">your squad</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockMatch.groupMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border hover:border-primary/50 transition-all hover:scale-[1.02] group"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-black text-xl shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform">
                    {member.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-lg text-foreground">{member.name}</p>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {member.major} • {member.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
              <p className="text-center text-sm font-semibold text-foreground">
                <span className="font-black text-primary">pro tip:</span> arrive a few minutes early and 
                look for your group members! don't be shy - everyone's here to make new friends 🌟
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Match;
