import { Card } from "@/components/ui/card";
import { Users, MapPin, MessageSquare } from "lucide-react";

const Match = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Match</h1>
          <p className="text-muted-foreground">Thursday, Nov 13 • 6:30 PM</p>
        </div>

        {/* Dining Hall Card */}
        <Card className="p-6 mb-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meeting at</p>
              <p className="font-semibold text-lg">Branford Dining Hall</p>
            </div>
          </div>
        </Card>

        {/* Conversation Prompt */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Conversation Starter</p>
              <p className="text-foreground font-medium">
                What's a skill you'd love to learn but haven't had time for yet?
              </p>
            </div>
          </div>
        </Card>

        {/* Group Members */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Your Group</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: "Sarah Chen", major: "Computer Science", year: "Junior" },
              { name: "Marcus Johnson", major: "Economics", year: "Sophomore" },
              { name: "You", major: "Biology", year: "Senior" },
            ].map((member, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
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
