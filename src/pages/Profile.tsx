import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { User, GraduationCap, Calendar, Save, Sparkles, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  name: string | null;
  major: string | null;
  year: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ name: null, major: null, year: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalUpvotes, setTotalUpvotes] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTotalUpvotes();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchTotalUpvotes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("posts")
      .select("upvotes")
      .eq("user_id", user.id);

    if (data) {
      const total = data.reduce((sum, post) => sum + post.upvotes, 0);
      setTotalUpvotes(total);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: profile.name,
          major: profile.major,
          year: profile.year,
        });

      if (error) throw error;

      toast.success("profile updated! ✨");
    } catch (error) {
      console.error(error);
      toast.error("couldn't save profile, try again");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20">
        <div className="container max-w-2xl mx-auto p-6 pt-8">
          <Skeleton className="h-8 w-48 mb-8 rounded-xl" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-2xl mx-auto p-6 pt-8 relative">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-black text-foreground mb-2">
            your <span className="gradient-text">profile</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            let others know who you are
          </p>
        </div>

        <Card className="glass-card border-2 border-border shadow-[var(--shadow-float)] hover-lift mb-6 animate-fade-in-up">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-black text-3xl shadow-[var(--shadow-glow)]">
                  {profile.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary animate-glow" />
                    profile details
                  </CardTitle>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground">{totalUpvotes}</p>
                  <p className="text-xs text-muted-foreground font-semibold">upvotes</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-bold text-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                name
              </Label>
              <Input
                id="name"
                placeholder="enter your name"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="h-12 text-base border-2 border-border focus:border-primary rounded-xl font-medium bg-background/50"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="major" className="text-base font-bold text-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                major
              </Label>
              <Input
                id="major"
                placeholder="what are you studying?"
                value={profile.major || ""}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                className="h-12 text-base border-2 border-border focus:border-primary rounded-xl font-medium bg-background/50"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="year" className="text-base font-bold text-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                year
              </Label>
              <Input
                id="year"
                placeholder="freshman, sophomore, junior, senior?"
                value={profile.year || ""}
                onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                className="h-12 text-base border-2 border-border focus:border-primary rounded-xl font-medium bg-background/50"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              variant="gradient"
              size="lg"
              className="w-full gap-2"
            >
              {saving ? "saving..." : "save profile"}
              <Save className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-2 border-border/50 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="lg"
              className="w-full"
            >
              sign out
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50 text-center animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <p className="text-sm text-muted-foreground font-medium">
            <span className="font-bold text-foreground">email:</span> {user?.email}
          </p>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
