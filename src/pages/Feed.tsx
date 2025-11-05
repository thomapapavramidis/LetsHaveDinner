import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const Feed = () => {
  const quotes = [
    {
      quote: "Met two amazing people who completely changed my perspective on campus life.",
      date: "Nov 6, 2025",
    },
    {
      quote: "The conversation starter was perfect - we talked for over 2 hours!",
      date: "Oct 23, 2025",
    },
    {
      quote: "Found a study partner and made genuine friends. This is what college should be about.",
      date: "Oct 9, 2025",
    },
    {
      quote: "Didn't expect to have so much in common with people from different majors.",
      date: "Sep 25, 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Feed</h1>
          <p className="text-muted-foreground">
            Stories from past CommonTable dinners
          </p>
        </div>

        <div className="space-y-4">
          {quotes.map((item, idx) => (
            <Card 
              key={idx} 
              className="p-6 hover:shadow-[var(--shadow-soft)] transition-shadow duration-300"
            >
              <div className="flex gap-4">
                <Quote className="w-6 h-6 text-primary/60 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-foreground mb-3 leading-relaxed">
                    "{item.quote}"
                  </p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
