import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Giuliano Bentevenga — Senior Backend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#060b14",
          fontFamily: "monospace",
          padding: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
            zIndex: 1,
          }}
        />

        {/* Cyan glow top */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,220,255,0.07) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />

        {/* Border */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(0,220,255,0.25)",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: "1px solid rgba(0,220,255,0.08)",
            zIndex: 2,
          }}
        />

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "64px 72px",
            gap: 0,
          }}
        >
          {/* Top label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ff6b7a",
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ffe066",
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00e87a",
              }}
            />
            <div
              style={{
                marginLeft: 12,
                color: "rgba(0,220,255,0.4)",
                fontSize: 13,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              portfolio.exe
            </div>
          </div>

          {/* Name */}
          <div
            style={{
              color: "#00dcff",
              fontSize: 62,
              fontWeight: 700,
              letterSpacing: "0.04em",
              lineHeight: 1.1,
              textShadow: "0 0 30px rgba(0,220,255,0.4)",
            }}
          >
            Giuliano Bentevenga
          </div>

          {/* Role */}
          <div
            style={{
              color: "#ffe066",
              fontSize: 22,
              marginTop: 16,
              letterSpacing: "0.08em",
              textShadow: "0 0 12px rgba(255,224,102,0.3)",
            }}
          >
            &gt; Senior Backend Engineer
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 22,
                background: "#00dcff",
                marginLeft: 6,
                opacity: 0.8,
                verticalAlign: "middle",
              }}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Tech pills */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 28,
            }}
          >
            {[
              "Django",
              "Python",
              "PostgreSQL",
              "Redis",
              "Docker",
              "Next.js",
              "Payments",
              "Identity",
            ].map((tag) => (
              <div
                key={tag}
                style={{
                  border: "1px solid rgba(0,220,255,0.3)",
                  color: "rgba(0,220,255,0.75)",
                  fontSize: 13,
                  padding: "5px 14px",
                  letterSpacing: "0.12em",
                  background: "rgba(0,220,255,0.05)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Bottom line */}
          <div
            style={{
              color: "rgba(143,163,176,0.6)",
              fontSize: 14,
              letterSpacing: "0.12em",
            }}
          >
            Distributed systems · Payments · Identity · Production at scale
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
