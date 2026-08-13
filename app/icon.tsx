import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070C",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
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
