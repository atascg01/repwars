import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RepWars — The Strava for Lifting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#18181b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 48,
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
            }}
          >
            ⚔️
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -2,
          }}
        >
          RepWars
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            marginTop: 12,
          }}
        >
          Compete with your crew. Break PRs. Win badges.
        </div>
      </div>
    ),
    { ...size },
  );
}
