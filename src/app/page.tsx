"use client";
import { useRef } from "react";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { useDragDrop } from "@/hooks/useDragDrop";
import { useTimecode } from "@/hooks/useTimecode";

const DEBUG = false;

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    initTimecode,
    removeTimecodeWithStart,
    resetTimecodes,
    splitAtTime,
    timecodes,
    timecodeSegments,
  } = useTimecode();

  const {
    filename,
    isLoading,
    isDragging,
    handleDrop,
    handleDragOver,
    handleStopDrag,
    videoInfo,
  } = useDragDrop(videoRef, (e) => {
    console.log(e);
    // Create a default timecode upon loading the video for the first time
    initTimecode(0, e.duration);
  });

  const {
    isPlaying,
    handlePlay,
    handleProgress,
    handleStopPause,
    handleSeeked,
    handleSeekTo,
    handleTimeUpdate,
    currentTime,
    playPause,
  } = useVideoPlayback(videoRef);

  return (
    <main
      className={`flex min-h-screen flex-col items-center gap-4 p-24 ${
        isDragging ? "bg-slate-500" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragExit={handleStopDrag}
      onDragLeave={handleStopDrag}
    >
      <video
        width={800}
        height={600}
        className="border border-white rounded"
        ref={videoRef}
        controls
        onPlay={handlePlay}
        onPause={handleStopPause}
        onProgress={handleProgress}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
      ></video>
      <div className="flex items-center gap-3">
        <p>
          Time: <code>{currentTime.toFixed(3)}</code> /{" "}
          <code>{videoRef.current?.duration.toFixed(3)}</code>
        </p>

        <button className={`p-1 border rounded min-w-14`} onClick={playPause}>
          {isPlaying ? "⏸️" : "▶️"}
        </button>
        <button
          className={`p-1 border rounded min-w-14`}
          onClick={() => splitAtTime(currentTime)}
        >
          &#9283; <span className="uppercase text-[10px]">Split</span>
        </button>
        <button
          className={`p-1 border rounded min-w-14`}
          onClick={() => resetTimecodes(timecodes.length / 2)}
        >
          <span className="uppercase text-[10px]">Reset</span>
        </button>
      </div>
      <div className="flex flex-row">
        <div>
          {timecodeSegments.map(([start, end], i) => (
            <div
              key={start}
              className="text-xs mr-2 bg-gray-800 px-2 text-right leading-4"
            >
              <code>
                <button onClick={() => handleSeekTo(start)}>
                  {start.toFixed(3)}
                </button>{" "}
                -{" "}
                <button onClick={() => handleSeekTo(end)}>
                  {end.toFixed(3)}
                </button>
              </code>

              <button
                className="ml-2 text-[8px] disabled:opacity-20"
                disabled={i === 0}
                onClick={() => removeTimecodeWithStart(start)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
        <div>
          <pre className="text-xs leading-4">
            {timecodeSegments.map(
              ([start, end], i) =>
                `ffmpeg -i ${filename} -ss ${start} ${
                  videoInfo?.duration === end ? "" : ` -to ${end}`
                } -c:v copy -c:a copy ${videoInfo?.filename}-${i}.${
                  videoInfo?.extension
                }\n`
            )}
          </pre>
        </div>
      </div>
      {DEBUG && (
        <section>
          <h3>Debug</h3>
          Segments: {timecodes.length / 2}
          <pre>
            {timecodes.map((v, i) =>
              i !== 1 && i % 2 === 0 ? `[${v}` : `, ${v}]\n`
            )}
          </pre>
        </section>
      )}
    </main>
  );
}
