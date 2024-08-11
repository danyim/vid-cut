import { useMemo, useState } from "react";
import { chunkArray } from "../utils";

export const useTimecode = () => {
  const [timecodes, setTimecodes] = useState<number[]>([]);
  const [initialTimecodes, setInitialTimecodes] = useState<number[]>([]);

  const timecodeSegments = useMemo(() => {
    return chunkArray(timecodes, 2);
  }, [timecodes]);

  const initTimecode = (start: number, end: number) => {
    setTimecodes([start, end]);
    setInitialTimecodes([start, end]);
  };

  const addTimecode = (start: number, end: number) => {
    setTimecodes((prevTimecodes) => {
      return [...prevTimecodes, start, end];
    });
  };

  /** Splits the current segment at the time */
  const splitAtTime = (sec: number) => {
    setTimecodes((prevTimecodes) => {
      const timecodes = [...prevTimecodes];
      let idx = null;
      for (let k = 0; k < timecodes.length; k += 2) {
        const start = timecodes[k];
        const end = timecodes[k + 1];
        // Mark the first timecode pair we encounter that consists of the target
        if (sec > start && sec < end) {
          idx = k;
          break;
        }
      }
      if (idx === null) {
        // If nothing is found then the timecode is invalid since we expect at least one match for
        // the entire duration
        return prevTimecodes;
      }
      // Now we know where to splice
      const end = timecodes[idx + 1];
      timecodes[idx + 1] = sec;
      timecodes.splice(idx + 2, 0, sec, end);
      return timecodes;
    });
  };

  /** Remove at index */
  const removeTimecodeWithStart = (start: number) => {
    setTimecodes((prevTimecodes) => {
      const startTimecodes = prevTimecodes.filter((_, i) => i % 2 === 0);
      const index = startTimecodes.findIndex((v) => v === start);
      if (index === undefined || index === 0 || prevTimecodes.length <= 2) {
        console.warn("Error with timecode provided", start);
        return prevTimecodes;
      }

      const timecodes = [...prevTimecodes];
      // Take note of the end
      const start2 = timecodes[index + 1];

      timecodes.splice(index, 2);
      return timecodes;
    });
  };

  const clearTimecodes = () => {
    setTimecodes([]);
  };

  /** Reset to the initial */
  const resetTimecodes = (segments: number = 1) => {
    if (
      segments > 2 &&
      !confirm(`${segments} existing splits will be deleted. Reset?`)
    ) {
      return;
    }

    if (initialTimecodes.length === 2) {
      setTimecodes([initialTimecodes[0], initialTimecodes[1]]);
    } else {
      clearTimecodes();
    }
  };

  return {
    addTimecode,
    initTimecode,
    clearTimecodes,
    removeTimecodeWithStart,
    resetTimecodes,
    splitAtTime,
    timecodes,
    timecodeSegments,
  };
};
