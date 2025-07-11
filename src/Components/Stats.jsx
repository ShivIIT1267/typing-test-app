import React, { useEffect } from "react";
import Graph from "./Graph";
import { db, auth } from "../firebaseConfig";
import { useAlert } from "../Context/AlertContext";
import { useAuthState } from "react-firebase-hooks/auth";

// 🆕 modular Firestore imports
import { collection, addDoc } from "firebase/firestore";

const Stats = ({
  wpm,
  resetTest,
  accuracy,
  correctChars,
  incorrectChars,
  missedChars,
  extraChars,
  graphData,
}) => {
  const { setAlert } = useAlert();
  const [user] = useAuthState(auth);

  // 📊 deduplicate timestamps for the graph
  const timeSet = new Set();
  const newGraph = graphData.filter((pt) => {
    if (!timeSet.has(pt[0])) {
      timeSet.add(pt[0]);
      return true;
    }
    return false;
  });

  // ⏫ save result to Firestore (modular syntax)
  const pushResultToDatabase = async () => {
    if (isNaN(accuracy)) {
      setAlert({
        open: true,
        type: "error",
        message: "invalid test",
      });
      return;
    }

    try {
      const resultsRef = collection(db, "Results");
      const { uid } = auth.currentUser;

      await addDoc(resultsRef, {
        wpm,
        accuracy,
        characters: `${correctChars}/${incorrectChars}/${missedChars}/${extraChars}`,
        userID: uid,
        timeStamp: new Date(),
      });

      setAlert({
        open: true,
        type: "success",
        message: "result saved to db",
      });
    } catch (err) {
      console.error("Error saving result:", err);
      setAlert({
        open: true,
        type: "error",
        message: "failed to save result",
      });
    }
  };

  /* run once after test ends */
  useEffect(() => {
    if (user) {
      pushResultToDatabase();
    } else {
      setAlert({
        open: true,
        type: "warning",
        message: "login to save results",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentional empty deps ‑ run only once

  /* UI */
  return (
    <div className="stats-box">
      <div className="left-stats">
        <div className="title">WPM</div>
        <div className="subtitle">{wpm}</div>

        <div className="title">Accuracy</div>
        <div className="subtitle">{accuracy}%</div>

        <div className="title">Characters</div>
        <div className="subtitle">
          {correctChars}/{incorrectChars}/{missedChars}/{extraChars}
        </div>

        <div className="subtitle" onClick={resetTest}>
          Restart
        </div>
      </div>

      <div className="right-stats">
        <Graph graphData={newGraph} />
      </div>
    </div>
  );
};

export default Stats;
