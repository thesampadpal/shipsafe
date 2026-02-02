import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

    const timestamp = new Date().toISOString();

    // Log to console
    console.log("New waitlist signup:", {
      email,
      url: url || null,
      timestamp,
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
        }
      } catch (supabaseError) {
        console.error("Supabase connection error:", supabaseError);
      }
    }

    // Send email notification if Resend is configured
    if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "Seclure <onboarding@resend.dev>",
          to: process.env.NOTIFICATION_EMAIL,
          subject: `New Seclure Signup: ${email}`,
          html: `
            <h2>New Waitlist Signup!</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Scanned URL:</strong> ${url || "Not provided"}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
          `,
        });
      } catch (emailError) {
        console.error("Email notification error:", emailError);
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
