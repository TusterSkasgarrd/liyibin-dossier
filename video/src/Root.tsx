import { Composition } from 'remotion';
import { HeroBg } from './HeroBg';

export const RemotionRoot = () => {
  return (
    <Composition
      id="HeroBg"
      component={HeroBg}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
