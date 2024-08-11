import { MutableRefObject, useCallback, useEffect, useState } from "react";

export interface VideoInfo {
  filename: string;
  extension: string;
  duration: number;
  size: number;
}

export const useDragDrop = (
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  onLoad: (e: VideoInfo) => void = () => {}
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>();
  const [videoInfo, setVideoInfo] = useState<VideoInfo>();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsLoading(true);
      const file = e.dataTransfer.files[0];

      if (file?.type !== "video/mp4" && file?.type !== "video/quicktime") {
        console.warn(
          "Invalid file type. Only video files are allowed:",
          file.name
        );

        setIsDragging(false);
        return;
      }

      console.log("Dropped video file:", file);
      setFilename(file.name);

      const reader = new FileReader();
      reader.onload = function (
        this: FileReader,
        ev: ProgressEvent<FileReader>
      ) {
        const buffer = new Uint8Array(ev.target?.result as ArrayBuffer);
        const videoBlob = new Blob([buffer], {
          type: file.type,
        });
        const url = window.URL.createObjectURL(videoBlob);

        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.onloadeddata = () => {
            const videoInfo = {
              filename: file.name.substring(0, file.name.length - 4),
              extension: file.name.substring(file.name.length - 3),
              duration: videoRef.current?.duration!,
              size: file.size,
            };
            setVideoInfo(videoInfo);
            setIsLoading(false);
            videoRef.current?.play();
            videoRef.current?.pause();
            onLoad(videoInfo);
          };
        }
      };
      reader.readAsArrayBuffer(file);

      setIsDragging(false);
    },
    [videoRef, onLoad]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleStopDrag = () => {
    setIsDragging(false);
  };

  return {
    filename,
    isLoading,
    isDragging,
    handleDrop,
    handleDragOver,
    handleStopDrag,
    videoInfo,
  };
};
