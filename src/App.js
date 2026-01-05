import React, { useState, useEffect, useRef } from 'react';
import Controls from './components/Controls';
import Statistics from './components/Statistics';
import Visualizer from './components/Visualizer';
import Legend from './components/Legend';
import { bubbleSort, quickSort, mergeSort, insertionSort, selectionSort } from './algorithms/sortingAlgorithms';
import './App.css';

const App = () => {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [isSorting, setIsSorting] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [coloredBars, setColoredBars] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const audioContext = useRef(null);
  const timerRef = useRef(null);
  const sortingRef = useRef(false);

  useEffect(() => {
    generateArray();
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isSorting) {
      generateArray();
    }
  }, [arraySize]);

  const playSound = (frequency) => {
    if (!soundEnabled || !audioContext.current) return;
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.1);
    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + 0.1);
  };

  const generateArray = () => {
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 400) + 10);
    }
    setArray(newArray);
    setComparisons(0);
    setSwaps(0);
    setTimeElapsed(0);
    setColoredBars({});
  };

  const sleep = (ms) => {
    return new Promise(resolve => {
      const checkPause = setInterval(() => {
        if (!isPaused) {
          clearInterval(checkPause);
          setTimeout(resolve, ms);
        }
      }, 50);
    });
  };

  const startTimer = () => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimeElapsed(((Date.now() - startTime) / 1000).toFixed(2));
      }
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startSorting = async () => {
    if (isSorting) return;
    sortingRef.current = true;
    setIsSorting(true);
    setIsPaused(false);
    setComparisons(0);
    setSwaps(0);
    setTimeElapsed(0);
    startTimer();

    const arrCopy = [...array];
    const helpers = {
      setArray,
      setColoredBars,
      setComparisons,
      setSwaps,
      playSound,
      sleep,
      speed,
      sortingRef
    };
    
    switch (algorithm) {
      case 'bubble':
        await bubbleSort(arrCopy, helpers);
        break;
      case 'quick':
        await quickSort(arrCopy, helpers);
        break;
      case 'merge':
        await mergeSort(arrCopy, helpers);
        break;
      case 'insertion':
        await insertionSort(arrCopy, helpers);
        break;
      case 'selection':
        await selectionSort(arrCopy, helpers);
        break;
      default:
        break;
    }

    stopTimer();
    sortingRef.current = false;
    setIsSorting(false);
    
    // Completion animation
    for (let i = 0; i < arrCopy.length; i++) {
      setColoredBars(prev => ({ ...prev, [i]: 'sorted' }));
      playSound(400 + i * 5);
      await sleep(20);
    }
  };

  const stopSorting = () => {
    sortingRef.current = false;
    setIsSorting(false);
    setIsPaused(false);
    stopTimer();
    setColoredBars({});
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <header className="header">
          <h1 className="title">Sorting Visualizer Pro</h1>
          <p className="subtitle">Watch sorting algorithms come to life</p>
        </header>

        <Controls
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          arraySize={arraySize}
          setArraySize={setArraySize}
          speed={speed}
          setSpeed={setSpeed}
          isSorting={isSorting}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          startSorting={startSorting}
          stopSorting={stopSorting}
          generateArray={generateArray}
        />

        <Statistics
          algorithm={algorithm}
          comparisons={comparisons}
          swaps={swaps}
          timeElapsed={timeElapsed}
          darkMode={darkMode}
        />

        <Visualizer
          array={array}
          coloredBars={coloredBars}
          darkMode={darkMode}
        />

        <Legend darkMode={darkMode} />
      </div>
    </div>
  );
};

export default App;
