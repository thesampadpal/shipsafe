import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Seclure - Security Scanner for AI-Built Apps";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          position: "relative",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          {/* Terminal badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "18px",
              color: "#00d4ff",
              fontFamily: "monospace",
              letterSpacing: "0.2em",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#00d4ff",
              }}
            />
            SECURITY_FOR_VIBE_CODERS
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#00d4ff",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
            }}
          >
            SECLURE
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "32px",
              color: "#e0e0e0",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            We don't just find security holes.
            <span style={{ color: "#00d4ff" }}> We fix them.</span>
          </div>

          {/* Tools list */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {["Cursor", "Claude Code", "Lovable", "Bolt", "Replit"].map((tool) => (
              <div
                key={tool}
                style={{
                  fontSize: "16px",
                  color: "#666",
                  padding: "8px 16px",
                  border: "1px dashed #333",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              >
                {tool}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #00d4ff, transparent)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
