# Lesson 6 — React Hooks

## Topic

React Hooks

- Hooks kya hain?
- Rules of Hooks
- useEffect
- Dependency Array
- Cleanup Function
- API Calls with useEffect
- useRef
- useMemo
- useCallback
- Custom Hooks Introduction

## Definition

Hooks are special functions in React that allow functional components to use state and other React features, such as lifecycle methods, without writing a class.

useEffect is a hook used to perform side effects in a component, like fetching data, updating the document title, or setting up event listeners.

useRef is a hook that returns a mutable object which persists across renders without causing the component to re-render.

useMemo is a hook that memoizes the result of a computed value so it is only recalculated when its dependencies change.

useCallback is a hook that memoizes a function so the same function reference is reused unless its dependencies change.

## Detailed Meaning

In older React, only class components could use state and lifecycle methods. Functional components were used only for simple static display. Hooks were introduced in React 16.8 to give functional components access to these features.

Hooks kya hain (what are hooks) is a common question. Hooks are functions that let you "hook into" React state and lifecycle features from functional components. The most common hooks are useState, useEffect, useRef, useMemo, and useCallback.

There are rules for using hooks. Hooks must only be called at the top level of a component, never inside loops, conditions, or nested functions. This ensures the hooks are always called in the same order on every render.

Hooks should only be called from React functions, either from functional components or from custom hooks. They should not be called from regular JavaScript functions.

Effects, or side effects, are operations that interact with the outside world, such as fetching data, updating the DOM, using timers, or subscribing to events. The useEffect hook handles these operations.

The useEffect hook runs a function after the component renders. It takes two arguments — a callback function and an optional dependency array. The dependency array tells React when the effect should run again.

If the dependency array is empty, the effect runs only once after the initial render. If the dependency array has values, the effect runs after every render where any of those values change. If the dependency array is omitted, the effect runs after every render.

The cleanup function is a function returned from the effect callback. It runs before the effect runs again and before the component unmounts. It is used to clean up timers, remove event listeners, or cancel network requests.

API calls with useEffect are done inside the effect. Data is fetched using the fetch function or an HTTP library, and the result is stored in state to be rendered in the UI.

The useRef hook returns a ref object with a current property. It can store any value, and the value persists across renders without triggering a re-render. Common uses include storing the previous value, focusing an input, or referencing a DOM element directly.

The useMemo hook improves performance by storing the result of a calculation and returning the same stored result unless the dependencies change. This avoids expensive calculations on every render.

The useCallback hook is similar to useMemo but stores a function instead of a value. It returns a memoized reference to a function so that the function identity stays the same between renders unless its dependencies change. This prevents unnecessary re-renders of child components.

Custom hooks are user-defined functions that begin with the word "use" and may call other hooks. They allow developers to extract and reuse logic across multiple components, keeping components clean and avoiding duplicated code.

## Example

A React component that demonstrates useEffect, dependency array, and cleanup function:

```jsx
import { useEffect } from "react";

function Timer() {
  useEffect(() => {
    const id = setInterval(() => console.log("tick"), 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>Timer is running</h1>;
}
```

## Code Example

```jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const doubled = useMemo(() => {
    return count * 2;
  }, [count]);

  const handleIncrement = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
      />
      <button onClick={handleIncrement}>Count: {count}</button>
      <p>Doubled: {doubled}</p>
    </div>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates several React hooks: useState, useEffect, useRef, useMemo, and useCallback.

The count and search states are managed with useState.

The useRef hook creates inputRef with an initial null value. The ref is attached to the input element with ref={inputRef}.

The useEffect hook with an empty dependency array runs once after the initial render. It calls inputRef.current.focus(), which focuses the input field automatically when the page loads. Because inputRef is a ref, it can directly access the DOM element.

The useMemo hook calculates the doubled value. It depends on count, so the calculation only runs again when count changes. If other state like search changes, the memoized value is reused.

The useCallback hook memoizes handleIncrement. Because its dependency array is empty, the same function reference is kept across renders. This prevents child components that receive this function from re-rendering unnecessarily.

The flow is — useState manages data, useRef accesses DOM elements, useEffect handles side effects, useMemo optimizes expensive calculations, and useCallback optimizes function references.

## Video

[Watch React Hooks in Hindi](https://youtu.be/6wf5dIrryoQ?si=DmMxsR3k5KsWVYWA)

## Notes

[Download Lesson 6 Notes PDF](http://localhost:3000/uploads/notes/react-l6.pdf)
