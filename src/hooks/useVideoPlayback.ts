import { MutableRefObject, SyntheticEvent, useCallback, useState } from "react";

export const useVideoPlayback = (
  videoRef: MutableRefObject<HTMLVideoElement | null>
) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const handlePlay = () => {
    setIsPlaying(true);
  };
  const handleStopPause = () => {
    setIsPlaying(false);
  };

  const handleSeekTo = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds;
      }
    },
    [videoRef]
  );

  const handleSeeked = useCallback(
    (e: SyntheticEvent<HTMLVideoElement, Event>) => {
      setCurrentTime(videoRef.current?.currentTime!);
    },
    [videoRef]
  );

  const handleProgress = useCallback(
    (e: SyntheticEvent<HTMLVideoElement, Event>) => {
      // console.log(e.target?.buffered);
    },
    [videoRef]
  );

  const handleTimeUpdate = useCallback(
    (e: SyntheticEvent<HTMLVideoElement, Event>) => {
      if (videoRef.current) {
        const time = Math.trunc(videoRef.current.currentTime * 1000) / 1000;
        setCurrentTime(time);
      }
    },
    [videoRef]
  );

  const playPause = useCallback(() => {
    isPlaying ? videoRef.current?.pause() : videoRef.current?.play();
  }, [videoRef, isPlaying]);

  return {
    isPlaying,
    currentTime,
    handlePlay,
    handleProgress,
    handleStopPause,
    handleSeeked,
    handleSeekTo,
    handleTimeUpdate,
    playPause,
  };
};
