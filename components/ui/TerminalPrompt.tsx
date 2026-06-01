"use client";

import React, { useState, useEffect } from 'react';

export function TerminalPrompt() {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0); // 0: typing, 1: pausing, 2: deleting, 3: pausing before next
  const [wordIdx, setWordIdx] = useState(0);
  
  const phrases = [
    'compiling ideas into community',
    'deploying code to production',
    'connecting passionate developers',
    'building open-source futures'
  ];
  
  useEffect(() => {
    let timer: any;
    const currentPhrase = phrases[wordIdx];
    
    if (phase === 0) {
      // Typing
      timer = setTimeout(() => {
        setText(currentPhrase.substring(0, text.length + 1));
        if (text.length === currentPhrase.length) {
          setPhase(1);
        }
      }, 70 + Math.random() * 40);
    } else if (phase === 1) {
      // Pause at end
      timer = setTimeout(() => {
        setPhase(2);
      }, 2000);
    } else if (phase === 2) {
      // Deleting
      timer = setTimeout(() => {
        setText(currentPhrase.substring(0, text.length - 1));
        if (text.length === 0) {
          setPhase(3);
        }
      }, 35);
    } else if (phase === 3) {
      // Pause before next
      timer = setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % phrases.length);
        setPhase(0);
      }, 500);
    }
    
    return () => clearTimeout(timer);
  }, [text, phase, wordIdx]);

  return (
    <div className="font-mono text-sm text-text-secondary/80 flex items-center min-h-[20px] select-none">
      <span>&gt; {text}</span>
      <span className="ml-1 w-1.5 h-4 bg-accent animate-pulse" />
    </div>
  );
}
