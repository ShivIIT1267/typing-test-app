import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig.js";
import { useAuthState } from "react-firebase-hooks/auth";
import ResultTable from "../Components/ResultTable.jsx";
import Graph from "../Components/Graph.jsx";
import UserInfo from "../Components/UserInfo.jsx";
import { useTheme } from "../Context/ThemeContext.jsx";
import { CircularProgress } from "@mui/material";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const UserPage = () => {
  const [data, setData] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [user, loading] = useAuthState(auth);
  const { theme } = useTheme();

  const fetchUserData = async () => {
    const { uid } = auth.currentUser;
    const resultsRef = collection(db, "Results");
    const q = query(
      resultsRef,
      where("userID", "==", uid),
      orderBy("timeStamp", "desc")
    );

    try {
      const snapshot = await getDocs(q);
      let tempData = [];
      let tempGraphData = [];
      snapshot.docs.forEach((doc) => {
        tempData.push({ ...doc.data() });
        tempGraphData.push([doc.data().timeStamp, doc.data().wpm]);
      });

      setData(tempData);
      setGraphData(tempGraphData.reverse());
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchUserData();
    }
  }, [loading]);

  if (!loading && !user) {
    return (
      <div className="center-of-screen">
        <span>Login to view user page!</span>
      </div>
    );
  }

  if (loading || dataLoading) {
    return (
      <div className="center-of-screen">
        <CircularProgress size={300} color={theme.title} />
      </div>
    );
  }

  if (!loading && !dataLoading && data.length === 0) {
    return (
      <div className="center-of-screen">
        <span>Take some tests then come back!!</span>
      </div>
    );
  }

  return (
    <div className="canvas">
      <UserInfo totalTestTaken={data.length} />
      <div className="graph">
        <Graph graphData={graphData} type="date" />
      </div>
      <ResultTable data={data} />
    </div>
  );
};

export default UserPage;
