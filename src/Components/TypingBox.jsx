import { Dialog, DialogTitle } from "@mui/material";
import { generate } from "random-words";
import React, {
  createRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTestMode } from "../Context/TestModeContext";
import Stats from "./Stats";
import UpperMenu from "./UpperMenu";

const TypingBox = () => {
  const { testSeconds, testWords, testMode } = useTestMode();
  const [initialRender, setInitialRender] = useState(false);
  const [words, setWords] = useState(() =>
    testMode === "word" ? generate(testWords) : generate(300)
  );

  const [currCharIndex, setCurrCharIndex] = useState(0);
  const [currWordIndex, setCurrWordIndex] = useState(0);
  const [countDown, setCountDown] = useState(
    testMode === "word" ? 180 : testSeconds
  );
  const [testTime, setTestTime] = useState(
    testMode === "word" ? 180 : testSeconds
  );
  const [correctChars, setCorrectChars] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [incorrectChars, setIncorrectChar] = useState(0);
  const [missedChars, setMissedChars] = useState(0);
  const [extraChars, setExtraChars] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [testStart, setTestStart] = useState(false);
  const [testEnd, setTestEnd] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [open, setOpen] = useState(false);

  const inputRef = useRef(null);
  const emptySpans = () =>
    Array(words.length)
      .fill(0)
      .map(() => createRef(null));
  const [wordSpanRef, setWordSpanRef] = useState(emptySpans());

  const resetWordSpanRefClassname = () => {
    wordSpanRef.forEach((i) => {
      if (!i.current) return;
      Array.from(i.current.childNodes).forEach((j) => {
        if (j.className.includes("extra")) j.remove();
        else j.className = "char";
      });
    });

    if (wordSpanRef[0]?.current?.childNodes[0]) {
      wordSpanRef[0].current.childNodes[0].className = "char current";
    }
  };

  const focusInput = () => {
    inputRef.current.focus();
  };

  const resetTest = () => {
    setCurrCharIndex(0);
    setCurrWordIndex(0);
    setTestStart(false);
    setTestEnd(false);
    clearInterval(intervalId);

    if (testMode === "word") {
      setWords(generate(testWords));
      setWordSpanRef(emptySpans());
      setCountDown(180);
      setTestTime(180);
    } else {
      setWords(generate(300));
      setWordSpanRef(emptySpans());
      setCountDown(testSeconds);
      setTestTime(testSeconds);
    }

    setGraphData([]);
    setCorrectChars(0);
    setCorrectWords(0);
    setExtraChars(0);
    setIncorrectChar(0);
    setMissedChars(0);

    // Delay until refs are updated
    setTimeout(() => {
      resetWordSpanRefClassname();
      focusInput();
    }, 0);
  };

  const redoTest = () => {
    setCurrCharIndex(0);
    setCurrWordIndex(0);
    setTestStart(false);
    setTestEnd(false);
    clearInterval(intervalId);

    if (testMode === "word") {
      setCountDown(180);
      setTestTime(180);
    } else {
      setCountDown(testSeconds);
      setTestTime(testSeconds);
    }

    setGraphData([]);
    setCorrectChars(0);
    setCorrectWords(0);
    setExtraChars(0);
    setIncorrectChar(0);
    setMissedChars(0);

    setTimeout(() => {
      resetWordSpanRefClassname();
      focusInput();
    }, 0);
  };

  const startTimer = () => {
    const intervalId = setInterval(timer, 1000);
    setIntervalId(intervalId);

    function timer() {
      setCountDown((prev) => {
        setCorrectChars((chars) => {
          setGraphData((data) => [
            ...data,
            [
              testTime - prev,
              Math.round(chars / 5 / ((testTime - prev + 1) / 60)),
            ],
          ]);
          return chars;
        });

        if (prev === 1) {
          setTestEnd(true);
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 9) {
      if (testStart) clearInterval(intervalId);
      e.preventDefault();
      setOpen(true);
      return;
    }

    const allChildSpans = wordSpanRef[currWordIndex]?.current?.childNodes || [];

    if (e.keyCode !== 8 && e.key.length > 1) {
      e.preventDefault();
      return;
    }

    if (!testStart) {
      startTimer();
      setTestStart(true);
    }

    if (e.keyCode === 32) {
      if (currWordIndex === words.length - 1) {
        clearInterval(intervalId);
        setCurrWordIndex(currWordIndex + 1);
        setTestEnd(true);
        return;
      }

      const correctChars =
        wordSpanRef[currWordIndex].current.querySelectorAll(".correct");

      if (correctChars.length === allChildSpans.length) {
        setCorrectWords(correctWords + 1);
      }

      if (allChildSpans.length <= currCharIndex) {
        allChildSpans[currCharIndex - 1]?.classList.remove("right-current");
      } else {
        setMissedChars(missedChars + (allChildSpans.length - currCharIndex));
        for (let i = currCharIndex; i < allChildSpans.length; i++) {
          allChildSpans[i].className += " skipped";
        }
        allChildSpans[currCharIndex].className = allChildSpans[
          currCharIndex
        ].className.replace("current", "");
      }

      if (
        wordSpanRef[currWordIndex + 1]?.current?.offsetLeft <
        wordSpanRef[currWordIndex]?.current?.offsetLeft
      ) {
        wordSpanRef[currWordIndex].current.scrollIntoView();
      }

      wordSpanRef[currWordIndex + 1]?.current?.childNodes[0]?.classList.add(
        "current"
      );

      setCurrWordIndex(currWordIndex + 1);
      setCurrCharIndex(0);
      return;
    }

    if (e.keyCode === 8) {
      if (currCharIndex !== 0) {
        if (currCharIndex === allChildSpans.length) {
          if (allChildSpans[currCharIndex - 1].className.includes("extra")) {
            allChildSpans[currCharIndex - 1].remove();
            allChildSpans[currCharIndex - 2]?.classList.add("right-current");
          } else {
            allChildSpans[currCharIndex - 1].className = "char current";
          }
          setCurrCharIndex(currCharIndex - 1);
          return;
        }

        allChildSpans[currCharIndex].className = "char";
        allChildSpans[currCharIndex - 1].className = "char current";
        setCurrCharIndex(currCharIndex - 1);
      }
      return;
    }

    if (currCharIndex === allChildSpans.length) {
      setExtraChars(extraChars + 1);
      let newSpan = document.createElement("span");
      newSpan.innerText = e.key;
      newSpan.className = "char incorrect extra right-current";
      allChildSpans[currCharIndex - 1]?.classList.remove("right-current");
      wordSpanRef[currWordIndex]?.current?.append(newSpan);
      setCurrCharIndex(currCharIndex + 1);
      return;
    }

    if (e.key === allChildSpans[currCharIndex].innerText) {
      allChildSpans[currCharIndex].className = "char correct";
      setCorrectChars(correctChars + 1);
      if (
        currWordIndex === words.length - 1 &&
        currCharIndex === allChildSpans.length - 1
      ) {
        clearInterval(intervalId);
        setCurrWordIndex(currWordIndex + 1);
        setTestEnd(true);
        return;
      }
    } else {
      allChildSpans[currCharIndex].className = "char incorrect";
      setIncorrectChar(incorrectChars + 1);
    }

    if (currCharIndex + 1 === allChildSpans.length) {
      allChildSpans[currCharIndex].classList.add("right-current");
    } else {
      allChildSpans[currCharIndex + 1].className = "char current";
    }

    setCurrCharIndex(currCharIndex + 1);
  };

  const handleDialogBoxEvents = (e) => {
    if (e.keyCode === 32) {
      e.preventDefault();
      redoTest();
      setOpen(false);
      return;
    }
    if (e.keyCode === 9 || e.keyCode === 13) {
      e.preventDefault();
      resetTest();
      setOpen(false);
      return;
    }

    e.preventDefault();
    setOpen(false);
    startTimer();
  };

  const calculateWPM = () => {
    if (!graphData.length) return 0;
    return Math.round(
      correctChars / 5 / ((graphData[graphData.length - 1][0] + 1) / 60)
    );
  };

  const calculateAccuracy = () => {
    return Math.round((correctWords / currWordIndex) * 100) || 0;
  };

  useEffect(() => {
    focusInput();
    setTimeout(() => {
      wordSpanRef[0]?.current?.childNodes[0]?.classList.add("current");
    }, 0);
  }, []);

  useLayoutEffect(() => {
    if (initialRender) {
      resetTest();
    } else {
      setInitialRender(true);
    }
  }, [testSeconds, testWords, testMode]);

  return (
    <div>
      <UpperMenu countDown={countDown} currWordIndex={currWordIndex} />
      {testEnd ? (
        <Stats
          wpm={calculateWPM()}
          accuracy={calculateAccuracy()}
          correctChars={correctChars}
          incorrectChars={incorrectChars}
          missedChars={missedChars}
          extraChars={extraChars}
          graphData={graphData}
          resetTest={resetTest}
        />
      ) : (
        <div className="type-box" onClick={focusInput}>
          <div className="words">
            {words.map((word, index) => (
              <span className="word" ref={wordSpanRef[index]} key={index}>
                {word.split("").map((char, ind) => (
                  <span className="char" key={ind}>
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        className="hidden-input"
        ref={inputRef}
        onKeyDown={handleKeyDown}
      />

      <Dialog
        open={open}
        style={{ backdropFilter: "blur(2px)" }}
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        onKeyDown={handleDialogBoxEvents}
      >
        <DialogTitle>
          <div className="instruction">press SPACE to redo</div>
          <div className="instruction">press TAB/ENTER to restart</div>
          <div className="instruction">press any other key to exit</div>
        </DialogTitle>
      </Dialog>
    </div>
  );
};

export default TypingBox;
