import { ImageResponse } from "next/og";

export const alt = "GoPort — expose localhost to the internet with one command";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card. Generated rather than checked in as a PNG so the headline
 * and the palette stay in sync with the site instead of drifting from it.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#081113",
          backgroundImage:
            "radial-gradient(circle at 78% 8%, rgba(56,217,150,0.20), transparent 45%), radial-gradient(circle at 5% 95%, rgba(49,202,199,0.13), transparent 42%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#38d996",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#07120e",
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ color: "#eff7f5", fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>GoPort</div>
          <div
            style={{
              marginLeft: 12,
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid rgba(239,247,245,0.18)",
              color: "rgba(239,247,245,0.70)",
              fontSize: 22,
            }}
          >
            Open source · MIT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#eff7f5",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              maxWidth: 940,
            }}
          >
            Expose localhost to the internet with one command.
          </div>
          <div style={{ color: "rgba(239,247,245,0.62)", fontSize: 30, marginTop: 24, maxWidth: 900 }}>
            A public HTTPS URL for your local app, API, or webhook handler. Self-hostable.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 28px",
              borderRadius: 16,
              background: "rgba(239,247,245,0.05)",
              border: "1px solid rgba(56,217,150,0.25)",
            }}
          >
            <span style={{ color: "#38d996", fontSize: 26 }}>$</span>
            <span style={{ color: "#eff7f5", fontSize: 26, fontFamily: "monospace" }}>goport http 8080</span>
          </div>
          <div style={{ color: "rgba(239,247,245,0.55)", fontSize: 26 }}>goport.uz</div>
        </div>
      </div>
    ),
    size,
  );
}
