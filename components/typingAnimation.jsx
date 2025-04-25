"use client";

import { useState, useEffect } from 'react';

const TypingAnimation = () => {
  const words = ["Smartness", "Insights", "Clarity"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 150; // faster when deleting
    const pauseTime = 2000; // time to pause on complete word
    
    // If we're done showing the complete word, pause before deleting
    if (!isDeleting && displayText === words[currentWordIndex]) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timeout);
    }
    
    // If we've deleted the word, move to the next word
    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      return;
    }
    
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(words[currentWordIndex].substring(0, displayText.length - 1));
      } else {
        setDisplayText(words[currentWordIndex].substring(0, displayText.length + 1));
      }
    }, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex, words]);
  
  return <span>{displayText}<span className="cursor">|</span></span>;
};

export default TypingAnimation;