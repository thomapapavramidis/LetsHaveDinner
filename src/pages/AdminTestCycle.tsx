import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createTestCycle } from "@/scripts/createTestCycle";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminTestCycle() {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent any redirects when on admin page
  useEffect(() => {
    // Store a flag to prevent redirects
    sessionStorage.setItem('admin-mode', 'true');
    return () => {
      sessionStorage.removeItem('admin-mode');
    };
  }, []);

  const handleCreateCycle = async () => {
    setIsCreating(true);
    try {
      const result = await createTestCycle();

      if (result.success) {
        toast.success("Test cycle created successfully! 🎉\nYou can now navigate to the home page to see it.");
        // Don't auto-redirect, let user click button
      } else {
        toast.error("Failed to create test cycle");
        console.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoHome = () => {
    sessionStorage.removeItem('admin-mode');
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin: Create Test Cycle</CardTitle>
          <CardDescription>
            This will create an active test cycle for testing the in-cycle UI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Prompt:</strong> "If you could have dinner with any historical figure, who would it be and why?"</p>
            <p><strong>Opt-in Deadline:</strong> 1 hour from now</p>
            <p><strong>Match Time:</strong> 2 hours from now</p>
          </div>

          <Button
            onClick={handleCreateCycle}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Creating..." : "Create Test Cycle"}
          </Button>

          <Button
            variant="outline"
            onClick={handleGoHome}
            className="w-full"
          >
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
