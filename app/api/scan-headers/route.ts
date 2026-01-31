import { NextRequest, NextResponse } from "next/server";

interface HeaderCheck {
  name: string;
  header: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

const SECURITY_HEADERS = [
  {
    header: "content-security-policy",
    name: "Content-Security-Policy",
    severity: "high",
    failMessage: "Missing - XSS attacks possible",
    passMessage: "Present - XSS protection enabled",
  },
  {
    header: "x-frame-options",
    name: "X-Frame-Options",
    severity: "medium",
    failMessage: "Missing - Clickjacking possible",
    passMessage: "Present - Clickjacking blocked",
  },
  {
    header: "strict-transport-security",
    name: "Strict-Transport-Security",
    severity: "high",
    failMessage: "Missing - HTTPS not enforced",
    passMessage: "Present - HTTPS enforced",
  },
  {
    header: "x-content-type-options",
    name: "X-Content-Type-Options",
    severity: "medium",
    failMessage: "Missing - MIME sniffing possible",
    passMessage: "Present - MIME sniffing blocked",
  },
  {
    header: "referrer-policy",
    name: "Referrer-Policy",
    severity: "low",
    failMessage: "Missing - Referrer data may leak",
    passMessage: "Present - Referrer controlled",
  },
  {
    header: "permissions-policy",
    name: "Permissions-Policy",
    severity: "low",
    failMessage: "Missing - Browser features unrestricted",
    passMessage: "Present - Browser features restricted",
  },
];

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
      if (!["http:", "https:"].includes(targetUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the target URL with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(targetUrl.toString(), {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "ShipSafe-Scanner/1.0",
        },
        redirect: "follow",
      });
    } catch (fetchError) {
      // If HEAD fails, try GET
      try {
        response = await fetch(targetUrl.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "ShipSafe-Scanner/1.0",
          },
          redirect: "follow",
        });
      } catch {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: "Could not reach the target URL" },
          { status: 400 }
        );
      }
    }
    clearTimeout(timeoutId);

    // Check each security header
    const results: HeaderCheck[] = SECURITY_HEADERS.map((check) => {
      const headerValue = response.headers.get(check.header);
      const hasHeader = !!headerValue;

      return {
        name: check.name,
        header: check.header,
        status: hasHeader ? "pass" : (check.severity === "low" ? "warn" : "fail"),
        message: hasHeader ? check.passMessage : check.failMessage,
      };
    });

    // Calculate summary
    const summary = {
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      warnings: results.filter((r) => r.status === "warn").length,
      total: results.length,
    };

    return NextResponse.json({
      url: targetUrl.toString(),
      timestamp: new Date().toISOString(),
      results,
      summary,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan the target" },
      { status: 500 }
    );
  }
}
