import React from "react";
import { getMergeSortAnimations } from "../sortingAlgorithms/sortingAlgorithms.js";
import "./SortingVisualizer.css";

// Change this value for the speed of the animations.
const ANIMATION_SPEED_MS = 5;

// Change this value for the number of bars (value) in the array.
const NUMBER_OF_ARRAY_BARS = 100;

// This is the main color of the array bars.
const PRIMARY_COLOR = "turquoise";

// This is the color of array bars that are being compared throughout the animations.
const SECONDARY_COLOR = "red";

export default class SortingVisualizer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      array: [],
    };
  }

  componentDidMount() {
    this.resetArray();
  }

  resetArray() {
    const array = [];
    for (let i = 0; i < NUMBER_OF_ARRAY_BARS; i++) {
      array.push(randomIntFromInterval(5, 730));
    }
    this.setState({ array });
  }

  mergeSort() {
    const animations = getMergeSortAnimations(this.state.array);
    for (let i = 0; i < animations.length; i++) {
      const arrayBars = document.getElementsByClassName("array-bar");
      const isColorChange = i % 3 !== 2;
      if (isColorChange) {
        const [barOneIdx, barTwoIdx] = animations[i];
        const barOneStyle = arrayBars[barOneIdx].style;
        const barTwoStyle = arrayBars[barTwoIdx].style;
        const color = i % 3 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
        setTimeout(() => {
          barOneStyle.backgroundColor = color;
          barTwoStyle.backgroundColor = color;
        }, i * ANIMATION_SPEED_MS);
      } else {
        setTimeout(() => {
          const [barOneIdx, newHeight] = animations[i];
          const barOneStyle = arrayBars[barOneIdx].style;
          barOneStyle.height = `${newHeight}px`;
        }, i * ANIMATION_SPEED_MS);
      }
    }
  }

  quickSort() {
    const animations = getQuickSortAnimations(this.state.array);
    this.animate(animations);
  }

  heapSort() {
    const animations = getHeapSortAnimations(this.state.array);
    this.animate(animations);
  }

  bubbleSort() {
    const animations = getBubbleSortAnimations(this.state.array);
    this.animate(animations);
  }

  animate(animations) {
    const arrayBars = document.getElementsByClassName("array-bar");
    for (let i = 0; i < animations.length; i++) {
      const isColorChange = i % 3 !== 2;
      if (isColorChange) {
        const [barOneIdx, barTwoIdx] = animations[i];
        const color = i % 3 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
        setTimeout(() => {
          if (arrayBars[barOneIdx])
            arrayBars[barOneIdx].style.backgroundColor = color;
          if (arrayBars[barTwoIdx])
            arrayBars[barTwoIdx].style.backgroundColor = color;
        }, i * ANIMATION_SPEED_MS);
      } else {
        setTimeout(() => {
          const [barIdx, newHeight] = animations[i];
          if (arrayBars[barIdx])
            arrayBars[barIdx].style.height = `${newHeight}px`;
        }, i * ANIMATION_SPEED_MS);
      }
    }
  }

  testSortingAlgorithms() {
    const getSortedArray = (array) => array.slice().sort((a, b) => a - b);
    for (let i = 0; i < 100; i++) {
      const array = [];
      const length = randomIntFromInterval(1, 1000);
      for (let j = 0; j < length; j++) {
        array.push(randomIntFromInterval(-1000, 1000));
      }
      const javaScriptSortedArray = getSortedArray(array);
      const mergeSortedArray = getMergeSortAnimations(array.slice());

      if (!arraysAreEqual(javaScriptSortedArray, mergeSortedArray)) {
        console.error(
          "Sorting mismatch!",
          array,
          javaScriptSortedArray,
          mergeSortedArray
        );
      }
    }
  }

  render() {
    const { array } = this.state;

    return (
      <div className="array-container">
        {array.map((value, idx) => (
          <div
            className="array-bar"
            key={idx}
            style={{
              backgroundColor: PRIMARY_COLOR,
              height: `${value}px`,
            }}
          ></div>
        ))}
        <button onClick={() => this.resetArray()}>Generate New Array</button>
        <button onClick={() => this.mergeSort()}>Merge Sort</button>
        <button onClick={() => this.quickSort()}>Quick Sort</button>
        <button onClick={() => this.heapSort()}>Heap Sort</button>
        <button onClick={() => this.bubbleSort()}>Bubble Sort</button>
        <button onClick={() => this.testSortingAlgorithms()}>
          Test Sorting Algorithms (BROKEN)
        </button>
      </div>
    );
  }
}

// Utility functions
function randomIntFromInterval(min, max) {
  // min and max inclusive
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function arraysAreEqual(arrayOne, arrayTwo) {
  if (arrayOne.length !== arrayTwo.length) return false;
  for (let i = 0; i < arrayOne.length; i++) {
    if (arrayOne[i] !== arrayTwo[i]) return false;
  }
  return true;
}

// Sorting algorithms with animations

function getQuickSortAnimations(array) {
  const animations = [];
  const auxArray = array.slice();

  function partition(low, high) {
    const pivot = auxArray[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      animations.push([j, high]); // color for comparison
      animations.push([j, high]); // revert color
      if (auxArray[j] <= pivot) {
        i++;
        // Swap
        animations.push([i, auxArray[j]]);
        animations.push([j, auxArray[i]]);
        [auxArray[i], auxArray[j]] = [auxArray[j], auxArray[i]];
      }
    }
    // swap pivot into correct position
    animations.push([i + 1, auxArray[high]]);
    animations.push([high, auxArray[i + 1]]);
    [auxArray[i + 1], auxArray[high]] = [auxArray[high], auxArray[i + 1]];
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  quickSort(0, auxArray.length - 1);
  return animations;
}

function getHeapSortAnimations(array) {
  const animations = [];
  const arr = array.slice();

  function heapify(n, i) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n) {
      animations.push([l, largest]); // comparison
      animations.push([l, largest]);
      if (arr[l] > arr[largest]) {
        largest = l;
      }
    }

    if (r < n) {
      animations.push([r, largest]); // comparison
      animations.push([r, largest]);
      if (arr[r] > arr[largest]) {
        largest = r;
      }
    }

    if (largest !== i) {
      animations.push([i, arr[largest]]);
      animations.push([largest, arr[i]]);
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(n, largest);
    }
  }

  const n = arr.length;

  // Build heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  // Sorting
  for (let i = n - 1; i > 0; i--) {
    animations.push([0, arr[i]]);
    animations.push([i, arr[0]]);
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(i, 0);
  }

  return animations;
}

function getBubbleSortAnimations(array) {
  const animations = [];
  const arr = array.slice();
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      animations.push([j, j + 1]);
      animations.push([j, j + 1]);
      if (arr[j] > arr[j + 1]) {
        // swap
        animations.push([j, arr[j + 1]]);
        animations.push([j + 1, arr[j]]);
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return animations;
}
