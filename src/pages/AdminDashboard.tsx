import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Clock,
  Play,
  Pause,
  Trash2,
  Plus,
  RefreshCw,
  Users,
  MessageSquare,
  Calendar
} from "lucide-react";

interface Cycle {
  id: string;
  title: string;
  prompt: string;
  event_date: string;
  is_active: boolean;
  created_at: string;
}

interface CycleStats {
  optInCount: number;
  responseCount: number;
  groupCount: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [stats, setStats] = useState<CycleStats>({ optInCount: 0, responseCount: 0, groupCount: 0 });
  const [loading, setLoading] = useState(true);

  // New cycle form
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  useEffect(() => {
    sessionStorage.setItem('admin-mode', 'true');
    fetchCycles();
    return () => {
      sessionStorage.removeItem('admin-mode');
    };
  }, []);

  useEffect(() => {
    if (activeCycle) {
      fetchStats(activeCycle.id);
    }
  }, [activeCycle]);

  const fetchCycles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cycles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load cycles");
    } else {
      setCycles(data || []);
      const active = data?.find(c => c.is_active);
      setActiveCycle(active || null);
    }
    setLoading(false);
  };

  const fetchStats = async (cycleId: string) => {
    const [optIns, responses, groups] = await Promise.all([
      supabase.from("opt_ins").select("*", { count: "exact", head: true }).eq("cycle_id", cycleId),
      supabase.from("responses").select("*", { count: "exact", head: true }).eq("cycle_id", cycleId),
      supabase.from("groups").select("*", { count: "exact", head: true }).eq("cycle_id", cycleId),
    ]);

    setStats({
      optInCount: optIns.count || 0,
      responseCount: responses.count || 0,
      groupCount: groups.count || 0,
    });
  };

  const createCycle = async () => {
    if (!newTitle.trim() || !newPrompt.trim() || !newEventDate) {
      toast.error("Please fill all fields");
      return;
    }

    console.log("Creating cycle with:", {
      title: newTitle.trim(),
      prompt: newPrompt.trim(),
      event_date: new Date(newEventDate).toISOString(),
      is_active: true,
    });

    // Deactivate existing cycles
    await supabase.from("cycles").update({ is_active: false }).eq("is_active", true);

    const { data, error } = await supabase
      .from("cycles")
      .insert({
        title: newTitle.trim(),
        prompt: newPrompt.trim(),
        event_date: new Date(newEventDate).toISOString(),
        is_active: true,
      })
      .select();

    console.log("Create result:", { data, error });

    if (error) {
      console.error("Create error details:", JSON.stringify(error, null, 2));
      toast.error(`Failed to create cycle: ${error.message || error.code || 'Unknown error'}`);
    } else {
      toast.success("Cycle created!");
      setNewTitle("");
      setNewPrompt("");
      setNewEventDate("");
      fetchCycles();
    }
  };

  const toggleCycleActive = async (cycleId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      // Deactivate all other cycles first
      await supabase.from("cycles").update({ is_active: false }).eq("is_active", true);
    }

    const { error } = await supabase
      .from("cycles")
      .update({ is_active: !currentStatus })
      .eq("id", cycleId);

    if (error) {
      console.error(error);
      toast.error("Failed to toggle cycle");
    } else {
      toast.success(currentStatus ? "Cycle deactivated" : "Cycle activated");
      fetchCycles();
    }
  };

  const deleteCycle = async (cycleId: string) => {
    if (!confirm("Are you sure? This will delete all related data (opt-ins, responses, groups, etc.).")) return;

    console.log("Attempting to delete cycle:", cycleId);

    // First check if cycle exists
    const { data: existsBefore } = await supabase
      .from("cycles")
      .select("id")
      .eq("id", cycleId)
      .single();

    if (!existsBefore) {
      toast.error("Cycle not found");
      return;
    }

    // Attempt delete without select to avoid RLS issues
    const { error } = await supabase
      .from("cycles")
      .delete()
      .eq("id", cycleId);

    console.log("Delete error:", error);

    if (error) {
      console.error("Delete error details:", JSON.stringify(error, null, 2));
      toast.error(`Failed to delete: ${error.message || error.code || 'Unknown error'}`);
      return;
    }

    // Verify it was actually deleted
    const { data: existsAfter } = await supabase
      .from("cycles")
      .select("id")
      .eq("id", cycleId)
      .single();

    console.log("Cycle exists after delete:", existsAfter);

    if (existsAfter) {
      toast.error("Delete was blocked by permissions");
    } else {
      toast.success("Cycle and all related data deleted!");
      await fetchCycles();
    }
  };

  const createQuickTestCycle = async () => {
    await supabase.from("cycles").update({ is_active: false }).eq("is_active", true);

    const eventDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

    console.log("Creating quick test cycle with event date:", eventDate.toISOString());

    const { data, error } = await supabase
      .from("cycles")
      .insert({
        title: "Quick Test Cycle",
        prompt: "If you could have dinner with any historical figure, who would it be and why?",
        event_date: eventDate.toISOString(),
        is_active: true,
      })
      .select();

    console.log("Quick test cycle result:", { data, error });

    if (error) {
      console.error("Quick test error details:", JSON.stringify(error, null, 2));
      toast.error(`Failed to create test cycle: ${error.message || error.code || 'Unknown error'}`);
    } else {
      toast.success("Test cycle created (event in 2 hours)");
      fetchCycles();
    }
  };

  const timeUntilEvent = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event.getTime() - now.getTime();

    if (diff <= 0) return "Event passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const getCyclePhase = () => {
    if (!activeCycle) return "No Active Cycle";

    const now = new Date();
    const eventDate = new Date(activeCycle.event_date);

    if (now < eventDate) return "Pre-Cycle (Opt-in Phase)";
    return "Post-Cycle (Event Time)";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="container max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage cycles and monitor app state</p>
          </div>
          <Button onClick={createQuickTestCycle} variant="gradient" size="lg" className="gap-2">
            <Play className="w-4 h-4" />
            Quick Test Cycle
          </Button>
        </div>

        {/* Current Cycle Status */}
        <Card className="glass-card border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Cycle Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCycle ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{getCyclePhase()}</p>
                    <p className="text-lg font-semibold text-foreground mt-2">{activeCycle.title}</p>
                    <p className="text-muted-foreground">{activeCycle.prompt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Event in:</p>
                    <p className="text-xl font-bold text-foreground">{timeUntilEvent(activeCycle.event_date)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.optInCount}</p>
                    <p className="text-sm text-muted-foreground">Opt-ins</p>
                  </div>
                  <div className="text-center">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.responseCount}</p>
                    <p className="text-sm text-muted-foreground">Responses</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.groupCount}</p>
                    <p className="text-sm text-muted-foreground">Groups</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Pause className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-xl font-semibold text-muted-foreground">No active cycle</p>
                <p className="text-sm text-muted-foreground mt-1">Create or activate a cycle to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create New Cycle */}
        <Card className="glass-card border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Historical Dinner"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prompt</label>
                <Textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g., If you could have dinner with any historical figure..."
                  className="min-h-20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Event Date & Time</label>
                <Input
                  type="datetime-local"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                />
              </div>
              <Button onClick={createCycle} variant="gradient" className="gap-2">
                <Plus className="w-4 h-4" />
                Create & Activate Cycle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Cycles */}
        <Card className="glass-card border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cycles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No cycles yet</p>
              ) : (
                cycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className={`p-4 rounded-lg border-2 ${
                      cycle.is_active ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{cycle.title}</h3>
                          {cycle.is_active && (
                            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{cycle.prompt}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Event: {new Date(cycle.event_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleCycleActive(cycle.id, cycle.is_active)}
                          variant={cycle.is_active ? "outline" : "default"}
                          size="sm"
                        >
                          {cycle.is_active ? (
                            <>
                              <Pause className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteCycle(cycle.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
