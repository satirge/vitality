import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const FinalScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const giftSpring = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const priceSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 14, stiffness: 90 } });
  const codeSpring = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 14, stiffness: 90 } });
  const ctaSpring = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 14, stiffness: 90 } });
  const zalandoSpring = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 14, stiffness: 90 } });

  const pulse = Math.sin(frame * 0.08) * 0.02 + 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fdf6ef",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 48px",
        gap: 0,
        opacity: fadeIn,
      }}
    >
      {/* Gift icon */}
      <div
        style={{
          fontSize: 90,
          transform: `scale(${giftSpring}) rotate(${Math.sin(frame * 0.05) * 5}deg)`,
          marginBottom: 28,
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))",
        }}
      >
        🎁
      </div>

      {/* -10 CHF */}
      <div
        style={{
          fontSize: 96,
          fontWeight: "900",
          color: "#1a3a2a",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
          lineHeight: 1,
          letterSpacing: -3,
          transform: `translateY(${interpolate(priceSpring, [0, 1], [30, 0])}px)`,
          opacity: priceSpring,
          marginBottom: 4,
        }}
      >
        -10 CHF
      </div>

      {/* avec le code */}
      <div
        style={{
          fontSize: 28,
          color: "#555",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          fontWeight: "400",
          marginBottom: 20,
          transform: `translateY(${interpolate(priceSpring, [0, 1], [20, 0])}px)`,
          opacity: priceSpring,
        }}
      >
        avec le code
      </div>

      {/* MAMAN26 code box */}
      <div
        style={{
          backgroundColor: "#1a3a2a",
          borderRadius: 14,
          padding: "18px 48px",
          marginBottom: 36,
          transform: `scale(${interpolate(codeSpring, [0, 1], [0.8, 1])} ) scale(${pulse})`,
          opacity: codeSpring,
          boxShadow: "0 8px 32px rgba(26,58,42,0.3)",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 46,
            fontWeight: "900",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
            letterSpacing: 4,
          }}
        >
          MAMAN26
        </span>
      </div>

      {/* Cadeau prêt en 2 min */}
      <div
        style={{
          fontSize: 30,
          fontWeight: "700",
          color: "#1a3a2a",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          marginBottom: 36,
          transform: `translateY(${interpolate(ctaSpring, [0, 1], [20, 0])}px)`,
          opacity: ctaSpring,
          textAlign: "center",
        }}
      >
        Cadeau prêt en 2 min ⚡
      </div>

      {/* Divider */}
      <div
        style={{
          width: "60%",
          height: 1,
          backgroundColor: "#ddd",
          marginBottom: 28,
          opacity: zalandoSpring,
        }}
      />

      {/* Zalando offer */}
      <div
        style={{
          transform: `translateY(${interpolate(zalandoSpring, [0, 1], [20, 0])}px)`,
          opacity: zalandoSpring,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: "#444",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            margin: "0 0 12px 0",
            lineHeight: 1.4,
          }}
        >
          + 30 CHF Zalando
          <br />
          <span style={{ fontSize: 20, color: "#666" }}>
            pour les 20 premières commandes
          </span>
        </p>

        {/* Zalando logo */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "white",
            borderRadius: 12,
            padding: "10px 24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            border: "1px solid #eee",
          }}
        >
          {/* Zalando orange triangle logo */}
          <div
            style={{
              width: 32,
              height: 32,
              background: "#ff6900",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          />
          <span
            style={{
              fontSize: 26,
              fontWeight: "700",
              color: "#1a1a1a",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: -0.5,
            }}
          >
            zalando
          </span>
        </div>
      </div>
    </div>
  );
};
