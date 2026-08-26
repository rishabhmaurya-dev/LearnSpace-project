# Introduccdcsdtion to Reactwd

## Topic

React Fundamenddfdtals - Components, JSX & First AppXXX

## Definition

React is an open-source JavaScript library used for building fast and interactive user interfaces.
It is maintained by Meta (Facebook) and a large community of developers.
React lets you build reusable UI components and efficiently update the DOM using a virtual DOM.

## Detailed Meaning

React works on the concept of components.

A component is a reusable piece of UI that can manage its own state and receive data through props.
Instead of writing separate HTML, CSS and JavaScript files, React allows you to co-locate your markup and logic inside a component using JSX.
When a component's state or props change, React compares the new virtual DOM with the previous one (a process called diffing) and updates only the parts of the real DOM that actually changed.
This makes updates very fast and predictable.
React uses a one-way data flow: data is passed from parent to child components via props, and changes are propagated by events and state.

## Example

A simple React component that renders a welcome message:

function Welcome({ name }) {
return <h1>Welcome, {name}!</h1>;
}

export default Welcome;

## Code Example

```
import { useState } from "react";

function Counter() {
const [count, setCount] = useState(0);

return (

<div>
<p>You clicked {count} times</p>
<button onClick={() => setCount(count + 1)}>Click me</button>
</div>
);
}

export default Counter;
```

## Code Explanation

The Counter component uses the useState hook to create a piece of state named count. Every time the button is clicked, the setCount function updates count, causing the component to re-render with the new value.

## Video

[Watch Introduction to React](https://youtu.be/ve22BzqebKg?si=TyIIucHY9So8K9iB)

## Notes

[Download Lesson Notes PDF](https://localhost:3000/notes/proj.pdf)
