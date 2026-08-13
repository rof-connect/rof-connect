import { ImageResponse } from "next/og";

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
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 20%, #132A5E 0%, #05070C 62%)",
        }}
      >
        <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#E8B93F" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#E8B93F" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#E8B93F" }} />
        </div>
        <div style={{ display: "flex", fontSize: 160, fontWeight: 800, color: "#7FC4EC", fontFamily: "Georgia, serif" }}>
          R
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#FFFFFF",
            textTransform: "uppercase",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Royal <span style={{ color: "#E8B93F", marginLeft: 16 }}>On Field</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 26,
            letterSpacing: 6,
            color: "#93A1BC",
            textTransform: "uppercase",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Baseball · Softball · Québec
        </div>
      </div>
    ),
    { ...size },
  );
}
