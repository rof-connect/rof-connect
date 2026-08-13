import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#E8B93F" }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#E8B93F" }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#E8B93F" }} />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 110,
            fontWeight: 800,
            color: "#7FC4EC",
            fontFamily: "Georgia, serif",
          }}
        >
          R
        </div>
      </div>
    ),
    { ...size },
  );
}
