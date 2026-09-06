# State & useState Hook

## Topic

Managing Component State with the useState Hook

## Definition

State is data that a component owns and can change over time. The useState hook lets a function component declare state variables and update them, triggering a re-render of the component.

## Detailed Meaning

When a component's state changes, React re-renders the component to reflect the new values in the UI. useState returns an array with two values: the current state value and a setter function to update it. The setter can accept a new value or a function of the previous value.

State updates are asynchronous and batched. If you need to update based on the previous state, always pass a function to the setter. State is local to the component that declares it unless it is lifted up to a common parent and passed down as props.

## Example

A simple counter that increments and decrements:

```jsx
const [count, setCount] = useState(0);
```

## Code Example

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>+</button>
      <button onClick={() => setCount((prev) => prev - 1)}>-</button>
    </div>
  );
}
```

## Code Explanation

The Counter component declares a state variable count initialized to 0. The increment button uses the functional form of the setter, setCount((prev) => prev + 1), which guarantees it uses the latest value even under batching.

## Video

[Watch: useState Explained](https://www.youtube.com/watch?v=O6P86uwfdR0)

## Notes

[Download State Notes PDF](http://localhost:3000/uploads/notes/proj.pdf)
