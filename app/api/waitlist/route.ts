import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, url } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // For now, log to console (replace with Supabase when ready)
    console.log("New waitlist signup:", {
      email,
      url: url || null,
      timestamp: new Date().toISOString(),
    });

    // If Supabase is configured, save to database
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import("@supabase/supabase-js");

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await supabase
          .from("waitlist")
          .insert({ email, url: url || null });

        if (error) {
          console.error("Supabase error:", error);
          // Don't fail the request if Supabase fails
        }
      } catch (supabaseError) {
        console.error("Supabase connection error:", supabaseError);
        // Continue anyway - we logged it to console
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to save signup" },
      { status: 500 }
    );
  }
}
