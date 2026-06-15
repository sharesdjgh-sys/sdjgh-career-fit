import { ImageResponse } from "next/og";

// iOS 홈화면 추가용 아이콘 (브랜드 나침반, 빌드 시 PNG 생성)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#D6456B",
        }}
      >
        {/* 나침반 링 */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 9999,
            border: "9px solid #FBF9F6",
          }}
        >
          {/* N 바늘 (위) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderBottom: "42px solid #FBF9F6",
            }}
          />
          {/* S 바늘 (아래, 연한 톤) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: "42px solid #F2A9BE",
            }}
          />
          {/* 중심점 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: "#FBF9F6",
              border: "5px solid #8E2647",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
