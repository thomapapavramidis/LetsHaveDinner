import { Card } from "@/components/ui/card";
import { Users, MapPin, MessageSquare } from "lucide-react";

const Match = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-bold mb-3 text-sm">
            ✨ MATCH FOUND
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2">your group! 🎉</h1>
          <p className="text-muted-foreground font-bold text-lg">thursday, nov 13 • 6:30 pm</p>
        </div>

        {/* Dining Hall Card */}
        <Card className="p-6 mb-6 shadow-[var(--shadow-soft)] border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-[var(--shadow-glow)] transition-all duration-300 animate-scale-in">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">meeting spot</p>
              <p className="font-black text-2xl text-foreground">branford dining hall</p>
            </div>
          </div>
        </Card>

        {/* Conversation Prompt */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-secondary/10 via-primary/5 to-accent/10 border-2 border-secondary/30 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                💬 conversation starter
              </p>
              <p className="text-foreground font-bold text-lg leading-relaxed">
                "what's a skill you'd love to learn but haven't had time for yet?"
              </p>
            </div>
          </div>
        </Card>

        {/* Group Members */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black">your squad</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: "sarah chen", major: "computer science", year: "junior" },
              { name: "marcus johnson", major: "economics", year: "sophomore" },
              { name: "you", major: "biology", year: "senior" },
            ].map((member, idx) => (
              <Card 
                key={idx} 
                className="p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.01] bg-card/90 backdrop-blur-sm border-2 border-transparent hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{member.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {member.major} • {member.year}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Match;
