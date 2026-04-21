import React from "react";
import { Composition } from "remotion";
import { MycoCafeStory } from "./MycoCafeStory";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MycoCafeStory"
      component={MycoCafeStory}
      durationInFrames={630}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
