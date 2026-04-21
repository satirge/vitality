import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { WhatsAppChat } from "./WhatsAppChat";
import { FinalScreen } from "./FinalScreen";

// Total: 630 frames at 30fps = 21 seconds
// Chat sequences: 0–570 (19s)
// Transition: 540–570 (1s)
// Final screen: 570–630 (2s)

const CHAT_END = 570;
const FINAL_START = 555;

export const MycoCafeStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle scale-in for the phone frame at start
  const phoneSpring = spring({ frame, fps, config: { damping: 18, stiffness: 80, mass: 1.2 } });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.92, 1]);

  // Chat fade out before final screen
  const chatOpacity = interpolate(frame, [FINAL_START, CHAT_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final screen fade in
  const finalOpacity = interpolate(frame, [FINAL_START, CHAT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a3a2a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, #2d5a3d 0%, #1a3a2a 60%)",
        }}
      />

      {/* Chat section */}
      {frame < CHAT_END && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: chatOpacity,
            transform: `scale(${phoneScale})`,
          }}
        >
          <WhatsAppChat />
        </div>
      )}

      {/* Final screen */}
      {frame >= FINAL_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: finalOpacity,
          }}
        >
          <Sequence from={FINAL_START}>
            <FinalScreen />
          </Sequence>
        </div>
      )}
    </AbsoluteFill>
  );
};
