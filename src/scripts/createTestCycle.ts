/**
 * Script to create a test active cycle for testing the in-cycle UI
 * Run this from the browser console or create a temporary admin page to execute it
 */

import { supabase } from "../integrations/supabase/client";

export async function createTestCycle() {
  try {
    console.log("Creating test cycle...");

    // First, deactivate any existing active cycles
    const { error: deactivateError } = await supabase
      .from("cycles")
      .update({ is_active: false })
      .eq("is_active", true);

    if (deactivateError) {
      console.error("Error deactivating existing cycles:", deactivateError);
    } else {
      console.log("Deactivated existing active cycles");
    }

    // Calculate times
    const now = new Date();
    const eventDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Insert a new active cycle
    const { data, error } = await supabase
      .from("cycles")
      .insert({
        title: "Historical Dinner",
        prompt: "If you could have dinner with any historical figure, who would it be and why?",
        is_active: true,
        event_date: eventDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating test cycle:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    console.log("Test cycle created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error };
  }
}

// For browser console usage
if (typeof window !== "undefined") {
  (window as any).createTestCycle = createTestCycle;
}
