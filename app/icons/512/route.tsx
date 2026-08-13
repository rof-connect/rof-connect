import { ImageResponse } from "next/og";

export async function GET() {
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
          background: "radial-gradient(circle at 50% 30%, #152340 0%, #05070C 70%)",
        }}
      >
        <div style={{ display: "flex", gap: 26, marginBottom: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#E8B93F" }} />
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#E8B93F" }} />
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#E8B93F" }} />
        </div>
        <div style={{ display: "flex", fontSize: 314, fontWeight: 800, color: "#7FC4EC", fontFamily: "Georgia, serif" }}>
          R
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
