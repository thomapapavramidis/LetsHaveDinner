import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, User, Save, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    major: "",
    year: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        name: data.name || "",
        major: data.major || "",
        year: data.year || "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: profile.name,
          major: profile.major,
          year: profile.year,
          email: user.email,
        });

      if (error) throw error;
      
      toast.success("profile updated! ✨");
    } catch (error) {
      toast.error("couldn't save, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("signed out! see you soon 👋");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/5 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-bold mb-3">
            <User className="w-4 h-4" />
            YOUR PROFILE
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2">hey there! 👋</h1>
          <p className="text-muted-foreground font-medium">
            tell us about yourself
          </p>
        </div>

        <Card className="p-8 shadow-[var(--shadow-soft)] border-2 border-primary/10 bg-card/90 backdrop-blur-sm animate-scale-in">
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="what should we call you?"
                className="h-12 text-base font-medium border-2 focus:border-primary rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="major" className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                major
              </Label>
              <Input
                id="major"
                value={profile.major}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                placeholder="what are you studying?"
                className="h-12 text-base font-medium border-2 focus:border-primary rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="year" className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                year
              </Label>
              <Input
                id="year"
                value={profile.year}
                onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                placeholder="freshman? sophomore? senior?"
                className="h-12 text-base font-medium border-2 focus:border-primary rounded-xl"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "saving..." : "save profile ✨"}
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground font-medium mb-3">signed in as</p>
          <p className="font-bold text-foreground mb-4">{user?.email}</p>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="font-semibold border-2 hover:border-destructive hover:text-destructive transition-colors rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
