import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Palette ─────────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#1a1208",
  bgLight: "#2b1f0e",
  cream: "#f5ead4",
  creamDim: "#c9b99a",
  gold: "#d4a84b",
  goldLight: "#e8c87a",
  green: "#4a7c59",
  greenLight: "#6aab7e",
  mushroom: "#8b6f4e",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useFade(startFrame: number, durationFrames: number) {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function useSlideUp(
  startFrame: number,
  durationFrames: number,
  distance = 40
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 1 },
  });
  const y = interpolate(progress, [0, 1], [distance, 0]);
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationFrames * 0.6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return { y, opacity };
}

// ─── SVG Mushroom ─────────────────────────────────────────────────────────────
const MushroomSVG: React.FC<{ size?: number; color?: string; opacity?: number }> = ({
  size = 120,
  color = COLORS.gold,
  opacity = 1,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ opacity }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Cap */}
    <ellipse cx="50" cy="42" rx="38" ry="26" fill={color} />
    <path
      d="M12 42 Q50 10 88 42"
      stroke={color}
      strokeWidth="3"
      fill={color}
      opacity="0.85"
    />
    {/* Stem */}
    <rect x="40" y="58" width="20" height="26" rx="8" fill={color} opacity="0.75" />
    {/* Gills */}
    <line x1="30" y1="55" x2="40" y2="68" stroke={COLORS.bgLight} strokeWidth="2" opacity="0.6" />
    <line x1="42" y1="57" x2="50" y2="84" stroke={COLORS.bgLight} strokeWidth="2" opacity="0.6" />
    <line x1="58" y1="57" x2="50" y2="84" stroke={COLORS.bgLight} strokeWidth="2" opacity="0.6" />
    <line x1="70" y1="55" x2="60" y2="68" stroke={COLORS.bgLight} strokeWidth="2" opacity="0.6" />
    {/* Spots */}
    <circle cx="40" cy="35" r="5" fill="white" opacity="0.3" />
    <circle cx="58" cy="30" r="3.5" fill="white" opacity="0.3" />
    <circle cx="68" cy="40" r="4" fill="white" opacity="0.3" />
  </svg>
);

// ─── Scene 1 — Brand Intro (frames 0 – 120) ──────────────────────────────────
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineSlide = useSlideUp(35, 30);
  const subtitleSlide = useSlideUp(55, 30);

  // Pulsing ring
  const ringScale = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.bgLight} 0%, ${COLORS.bg} 65%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Decorative ring */}
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          border: `2px solid ${COLORS.gold}22`,
          transform: `scale(${ringScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          border: `1px solid ${COLORS.gold}33`,
          transform: `scale(${1 / ringScale})`,
        }}
      />

      {/* Logo mushroom */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 32,
          filter: `drop-shadow(0 0 40px ${COLORS.gold}66)`,
        }}
      >
        <MushroomSVG size={180} color={COLORS.gold} />
      </div>

      {/* Brand name */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${0.85 + 0.15 * logoScale})`,
          textAlign: "center",
          letterSpacing: 12,
          fontSize: 72,
          fontFamily: "'Georgia', serif",
          fontWeight: 700,
          color: COLORS.cream,
          textTransform: "uppercase",
          lineHeight: 1,
          filter: `drop-shadow(0 2px 24px ${COLORS.gold}44)`,
        }}
      >
        Myco
        <span style={{ color: COLORS.gold }}>Café</span>
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 24,
          opacity: taglineSlide.opacity,
          transform: `translateY(${taglineSlide.y}px)`,
          fontSize: 28,
          fontFamily: "'Georgia', serif",
          fontStyle: "italic",
          color: COLORS.creamDim,
          letterSpacing: 4,
          textAlign: "center",
        }}
      >
        Nourish from within
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginTop: 16,
          opacity: subtitleSlide.opacity,
          transform: `translateY(${subtitleSlide.y}px)`,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ width: 60, height: 1, background: COLORS.gold, opacity: 0.5 }} />
        <span
          style={{
            fontSize: 20,
            fontFamily: "sans-serif",
            color: COLORS.gold,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Champignons médicinaux
        </span>
        <div style={{ width: 60, height: 1, background: COLORS.gold, opacity: 0.5 }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2 — Products (frames 120 – 300) ───────────────────────────────────
interface Product {
  name: string;
  latin: string;
  benefit: string;
  enterFrame: number;
  mushroomColor: string;
}

const PRODUCTS: Product[] = [
  {
    name: "Lion's Mane",
    latin: "Hericium erinaceus",
    benefit: "Clarté mentale & concentration",
    enterFrame: 0,
    mushroomColor: COLORS.cream,
  },
  {
    name: "Reishi",
    latin: "Ganoderma lucidum",
    benefit: "Sérénité & immunité",
    enterFrame: 40,
    mushroomColor: COLORS.goldLight,
  },
  {
    name: "Chaga",
    latin: "Inonotus obliquus",
    benefit: "Antioxydant puissant",
    enterFrame: 80,
    mushroomColor: COLORS.greenLight,
  },
];

const ProductCard: React.FC<{ product: Product; localFrame: number }> = ({
  product,
  localFrame,
}) => {
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: localFrame - product.enterFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const opacity = interpolate(
    localFrame,
    [product.enterFrame, product.enterFrame + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const x = interpolate(progress, [0, 1], [80, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 32,
        opacity,
        transform: `translateX(${x}px)`,
        background: `linear-gradient(135deg, ${COLORS.bgLight}cc, ${COLORS.bg}aa)`,
        border: `1px solid ${COLORS.gold}33`,
        borderRadius: 24,
        padding: "28px 40px",
        width: "100%",
      }}
    >
      <MushroomSVG size={80} color={product.mushroomColor} />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 38,
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
            color: COLORS.cream,
            lineHeight: 1.1,
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            color: COLORS.gold,
            marginTop: 4,
          }}
        >
          {product.latin}
        </div>
        <div
          style={{
            fontSize: 24,
            fontFamily: "sans-serif",
            color: COLORS.creamDim,
            marginTop: 8,
            letterSpacing: 1,
          }}
        >
          {product.benefit}
        </div>
      </div>
    </div>
  );
};

const SceneProducts: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const titleSlide = (() => {
    const frame = localFrame;
    const { fps } = useVideoConfig();
    const progress = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
    const y = interpolate(progress, [0, 1], [30, 0]);
    const opacity = interpolate(frame, [0, 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { y, opacity };
  })();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 20%, ${COLORS.bgLight} 0%, ${COLORS.bg} 70%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 60px",
        gap: 32,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleSlide.opacity,
          transform: `translateY(${titleSlide.y}px)`,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            color: COLORS.gold,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
            marginBottom: 12,
          }}
        >
          Notre sélection
        </div>
        <div
          style={{
            fontSize: 64,
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
            color: COLORS.cream,
            lineHeight: 1,
          }}
        >
          Les champignons
          <br />
          <span style={{ color: COLORS.gold }}>du bien-être</span>
        </div>
      </div>

      {/* Product cards */}
      {PRODUCTS.map((product) => (
        <ProductCard key={product.name} product={product} localFrame={localFrame} />
      ))}
    </AbsoluteFill>
  );
};

// ─── Scene 3 — CTA (frames 300 – 450) ────────────────────────────────────────
const SceneCTA: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(localFrame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 90 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(localFrame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hashOpacity = interpolate(localFrame, [40, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hashY = interpolate(localFrame, [40, 65], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(localFrame, [70, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow for CTA button
  const pulse = 1 + 0.03 * Math.sin((localFrame / fps) * Math.PI * 3);

  // Floating mushrooms
  const mushroomFloat = (offset: number) =>
    8 * Math.sin(((localFrame + offset) / fps) * Math.PI * 1.5);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 60%, ${COLORS.green}55 0%, ${COLORS.bg} 60%)`,
        opacity: bgOpacity,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
        padding: "0 80px",
      }}
    >
      {/* Decorative floating mushrooms */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 60,
          transform: `translateY(${mushroomFloat(0)}px) rotate(-20deg)`,
          opacity: 0.2,
        }}
      >
        <MushroomSVG size={140} color={COLORS.greenLight} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 200,
          right: 40,
          transform: `translateY(${mushroomFloat(30)}px) rotate(15deg)`,
          opacity: 0.15,
        }}
      >
        <MushroomSVG size={100} color={COLORS.gold} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 300,
          left: 80,
          transform: `translateY(${mushroomFloat(60)}px) rotate(-10deg)`,
          opacity: 0.12,
        }}
      >
        <MushroomSVG size={80} color={COLORS.cream} />
      </div>

      {/* Main CTA text */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            color: COLORS.gold,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
            marginBottom: 20,
          }}
        >
          Découvrez notre boutique
        </div>
        <div
          style={{
            fontSize: 72,
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
            color: COLORS.cream,
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          Le café
          <br />
          qui vous
          <br />
          <span
            style={{
              color: COLORS.gold,
              filter: `drop-shadow(0 0 20px ${COLORS.gold}77)`,
            }}
          >
            transforme
          </span>
        </div>
      </div>

      {/* Hashtags */}
      <div
        style={{
          opacity: hashOpacity,
          transform: `translateY(${hashY}px)`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
          marginBottom: 56,
        }}
      >
        {["#MycoCafé", "#FonctionnelMushroom", "#BienÊtre", "#CaféSanté"].map(
          (tag) => (
            <span
              key={tag}
              style={{
                fontSize: 22,
                fontFamily: "sans-serif",
                color: COLORS.greenLight,
                letterSpacing: 1,
              }}
            >
              {tag}
            </span>
          )
        )}
      </div>

      {/* CTA button */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${pulse})`,
          background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
          borderRadius: 60,
          padding: "28px 72px",
          textAlign: "center",
          filter: `drop-shadow(0 0 30px ${COLORS.gold}66)`,
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontFamily: "sans-serif",
            fontWeight: 700,
            color: COLORS.bg,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Commander maintenant
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          marginTop: 32,
          opacity: ctaOpacity,
          fontSize: 26,
          fontFamily: "'Georgia', serif",
          fontStyle: "italic",
          color: COLORS.creamDim,
          letterSpacing: 2,
        }}
      >
        mycocafe.fr
      </div>
    </AbsoluteFill>
  );
};

// ─── Transition overlay ───────────────────────────────────────────────────────
const TransitionWipe: React.FC<{
  startFrame: number;
  endFrame: number;
  direction?: "in" | "out";
}> = ({ startFrame, endFrame, direction = "in" }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = direction === "in" ? progress : 1 - progress;
  if (Math.abs(progress) < 0.01 || Math.abs(progress - 1) < 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const MycoCafeStory: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene ranges
  const SCENE1_END = 135;
  const SCENE2_START = 120;
  const SCENE2_END = 315;
  const SCENE3_START = 300;

  const showScene1 = frame < SCENE1_END;
  const showScene2 = frame >= SCENE2_START - 15 && frame < SCENE2_END;
  const showScene3 = frame >= SCENE3_START - 15;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Scene 1 — Intro */}
      {showScene1 && (
        <AbsoluteFill>
          <SceneIntro />
        </AbsoluteFill>
      )}

      {/* Scene 2 — Products */}
      {showScene2 && (
        <AbsoluteFill>
          <SceneProducts localFrame={frame - SCENE2_START} />
        </AbsoluteFill>
      )}

      {/* Scene 3 — CTA */}
      {showScene3 && (
        <AbsoluteFill>
          <SceneCTA localFrame={frame - SCENE3_START} />
        </AbsoluteFill>
      )}

      {/* Cross-fade transitions */}
      <TransitionWipe startFrame={115} endFrame={130} direction="out" />
      <TransitionWipe startFrame={130} endFrame={145} direction="in" />
      <TransitionWipe startFrame={295} endFrame={308} direction="out" />
      <TransitionWipe startFrame={308} endFrame={322} direction="in" />
    </AbsoluteFill>
  );
};
