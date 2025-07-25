import { useEffect } from "react";
import { ThemeProvider } from "styled-components";
import Footer from "../Components/Footer";
import TypingBox from "../Components/TypingBox";
import { useTheme } from "../Context/ThemeContext";
import { GlobalStyles } from "../Styles/global";
import { auth } from "../firebaseConfig";
import Header from "../Components/Header";
import { generate } from "random-words";

const HomePage = () => {
  
    const words = generate(100);

  return (
   
      <div className="canvas">
        <Header/>
        <TypingBox words={words}/>
        <Footer/>
      </div>
  );
}

export default HomePage