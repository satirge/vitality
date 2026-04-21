import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

interface Message {
  id: number;
  text: string;
  time: string;
  isOutgoing: boolean;
  isRead?: boolean;
  isLinkPreview?: boolean;
  appearsAtFrame: number;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    text: "Tu prends quoi pour\nla fête des mères ?",
    time: "09:41",
    isOutgoing: false,
    appearsAtFrame: 20,
  },
  {
    id: 2,
    text: "Aucune idée 😅",
    time: "09:42",
    isOutgoing: true,
    isRead: true,
    appearsAtFrame: 90,
  },
  {
    id: 3,
    text: "Regarde ça 👉",
    time: "09:42",
    isOutgoing: false,
    appearsAtFrame: 160,
  },
  {
    id: 4,
    text: "",
    time: "09:42",
    isOutgoing: false,
    isLinkPreview: true,
    appearsAtFrame: 200,
  },
  {
    id: 5,
    text: "Un abonnement ? 🤔",
    time: "09:43",
    isOutgoing: true,
    isRead: true,
    appearsAtFrame: 300,
  },
  {
    id: 6,
    text: "Oui, elle reçoit un magazine\ntoute l'année 🙂",
    time: "09:43",
    isOutgoing: false,
    appearsAtFrame: 370,
  },
  {
    id: 7,
    text: "Ah ok... j'avoue\nc'est pas mal 😏",
    time: "09:44",
    isOutgoing: true,
    isRead: true,
    appearsAtFrame: 440,
  },
  {
    id: 8,
    text: "Je prends ça direct 🙌",
    time: "09:44",
    isOutgoing: true,
    isRead: true,
    appearsAtFrame: 510,
  },
];

const LinkPreview: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <div
    style={{
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "bottom left",
      backgroundColor: "#fff",
      borderRadius: 10,
      overflow: "hidden",
      width: 320,
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      border: "1px solid #e8e8e8",
    }}
  >
    {/* Image area */}
    <div
      style={{
        width: "100%",
        height: 180,
        background: "linear-gradient(135deg, #f4845f 0%, #e84393 30%, #9b59b6 60%, #3498db 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "20px 16px",
      }}
    >
      {/* Decorative leaves/tropical elements */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {/* Leaf shapes */}
        <div style={{
          position: "absolute", top: -20, left: -10,
          width: 120, height: 180,
          background: "rgba(255,255,255,0.08)",
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-30deg)"
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: 20,
          width: 100, height: 150,
          background: "rgba(255,255,255,0.06)",
          borderRadius: "0 50% 50% 50%",
          transform: "rotate(20deg)"
        }} />
        <div style={{
          position: "absolute", top: 10, left: 60,
          width: 80, height: 120,
          background: "rgba(34,139,34,0.3)",
          borderRadius: "50% 0 50% 50%",
          transform: "rotate(-15deg)"
        }} />
        <div style={{
          position: "absolute", bottom: 10, left: 100,
          width: 60, height: 100,
          background: "rgba(34,139,34,0.25)",
          borderRadius: "50% 50% 0 50%",
          transform: "rotate(25deg)"
        }} />
      </div>
      {/* Magazine mockup */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: 90,
        height: 120,
        background: "linear-gradient(135deg, #fff5e6 0%, #ffe0b2 100%)",
        borderRadius: 6,
        boxShadow: "4px 4px 12px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        padding: 8,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "60%", height: "100%",
          background: "linear-gradient(180deg, #f4845f 0%, #e84393 100%)",
          opacity: 0.4,
          borderRadius: "0 6px 6px 0",
        }} />
        <div style={{
          fontFamily: "Georgia, serif",
          fontSize: 18,
          fontWeight: "bold",
          color: "#2c5530",
          fontStyle: "italic",
          position: "relative",
          zIndex: 1,
          marginTop: "auto",
        }}>
          flow
        </div>
      </div>
    </div>
    {/* Text content */}
    <div style={{ padding: "12px 14px", backgroundColor: "#f9f9f9" }}>
      <p style={{
        margin: "0 0 8px 0",
        fontSize: 14,
        fontWeight: "600",
        color: "#111",
        lineHeight: 1.3,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        Un abonnement magazine qui dure toute l'année
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
        {["12 numéros", "Reçu à la maison", "Bon cadeau à imprimer"].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#25d366", fontSize: 12 }}>✓</span>
            <span style={{ fontSize: 12, color: "#444", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#888", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>edigroup.ch</span>
        <span style={{ fontSize: 11, color: "#888", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Abonnement magazine</span>
      </div>
    </div>
  </div>
);

const ChatBubble: React.FC<{
  message: Message;
  opacity: number;
  translateY: number;
  scale: number;
}> = ({ message, opacity, translateY, scale }) => {
  if (message.isLinkPreview) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: 4,
        paddingLeft: 8,
      }}>
        <LinkPreview opacity={opacity} scale={scale} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: message.isOutgoing ? "flex-end" : "flex-start",
        marginBottom: 4,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: message.isOutgoing ? "bottom right" : "bottom left",
      }}
    >
      <div
        style={{
          maxWidth: "72%",
          backgroundColor: message.isOutgoing ? "#dcf8c6" : "#ffffff",
          borderRadius: message.isOutgoing
            ? "18px 18px 4px 18px"
            : "18px 18px 18px 4px",
          padding: "10px 14px 6px 14px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 17,
            lineHeight: 1.4,
            color: "#111",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
            whiteSpace: "pre-line",
          }}
        >
          {message.text}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 3,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#8e8e8e",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {message.time}
          </span>
          {message.isOutgoing && (
            <span style={{ fontSize: 13, color: message.isRead ? "#34b7f1" : "#8e8e8e" }}>
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const WhatsAppChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#e5ddd5",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8bfb2' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* WhatsApp Header */}
      <div
        style={{
          backgroundColor: "#128C7E",
          padding: "52px 16px 12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {/* Back arrow */}
        <span style={{ color: "white", fontSize: 22, marginRight: -4 }}>‹</span>
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f093fb, #f5576c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          👩
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "white",
              fontSize: 17,
              fontWeight: "600",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Ma soeur ❤️
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            en ligne
          </div>
        </div>
        {/* Icons */}
        <div style={{ display: "flex", gap: 20, color: "white", fontSize: 22 }}>
          <span>🎥</span>
          <span>📞</span>
        </div>
      </div>

      {/* Date label */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(225,219,208,0.92)",
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 13,
            color: "#555",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          }}
        >
          Aujourd'hui
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "hidden",
          padding: "4px 12px 16px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 2,
        }}
      >
        {MESSAGES.map((msg) => {
          if (frame < msg.appearsAtFrame) return null;

          const elapsed = frame - msg.appearsAtFrame;
          const springVal = spring({
            frame: elapsed,
            fps,
            config: { damping: 15, stiffness: 120, mass: 0.8 },
          });

          const opacity = interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: "clamp" });
          const translateY = interpolate(springVal, [0, 1], [20, 0]);
          const scale = interpolate(springVal, [0, 1], [0.85, 1]);

          return (
            <ChatBubble
              key={msg.id}
              message={msg}
              opacity={opacity}
              translateY={translateY}
              scale={scale}
            />
          );
        })}
      </div>

      {/* Input bar */}
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderTop: "1px solid #ddd",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 24,
            padding: "10px 16px",
            fontSize: 16,
            color: "#aaa",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Message
        </div>
        <span style={{ fontSize: 28, color: "#128C7E" }}>🎤</span>
      </div>
    </div>
  );
};
