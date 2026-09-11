# Lesson 3 — Props & State

## Topic

Props & State

- What are Props?
- Passing Props
- Props Destructuring
- What is State?
- useState
- State Update
- Multiple States
- Previous State
- Event Handling
- Controlled Input

## Definition

Props are short for properties. They are used to pass data from a parent component to a child component. Props are read-only and cannot be modified by the child component.

State is a built-in object in React that stores data belonging to a component. When the state changes, the component re-renders automatically to reflect the updated data.

useState is a React hook that allows functional components to manage state. It returns an array with the current state value and a function to update it.

## Detailed Meaning

Props are like function arguments. When a parent component renders a child component, it can pass data as props. The child component receives these props and uses them to display content or make decisions.

Props flow in one direction — from parent to child. A child component can never modify the props it receives from its parent. This makes the data flow predictable and easy to debug.

Passing props is done by adding attributes to the component tag. For example, <User name="John" age={25} /> passes name and age as props to the User component.

Props destructuring is a cleaner way to access props inside a component. Instead of writing props.name, you can directly extract name from the props object in the function parameters.

State is different from props because it is managed inside the component and can be changed over time. When a button is clicked or an input is typed, the state updates and the UI reflects the change.

The useState hook returns an array with two elements — the current state value and a setter function. The setter function is used to update the state value. Whenever the state updates, React re-renders the component.

Multiple states can be managed in a component using multiple useState calls. Each call manages a separate piece of state independently.

Previous state refers to the state value before the update. When updating state based on the previous value, a callback function should be passed to the setter function to ensure the correct value is used.

Event handling in React is done using camelCase attributes like onClick, onChange, onSubmit. Event handlers are functions that run when the event occurs.

Controlled input is a technique where the input value is controlled by React state. The input value is bound to a state variable, and any change in the input updates the state through an onChange handler.

## Example

A React component that demonstrates props passing, state management, and controlled input:

```jsx
function UserCard({ name, role }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Role: {role}</p>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <UserCard name="John" role="Developer" />
      <UserCard name="Jane" role="Designer" />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}
```

## Code Example

```jsx
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState(18);
  const [score, setScore] = useState(0);

  const handleIncrement = () => {
    setScore((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setScore((prev) => prev - 1);
  };

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />

      <p>Hello, {name || "Guest"}!</p>

      <button onClick={() => setAge(age + 1)}>Age: {age}</button>

      <div>
        <button onClick={handleDecrement}>-</button>
        <span>Score: {score}</span>
        <button onClick={handleIncrement}>+</button>
      </div>
    </div>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates props, state, useState hook, previous state pattern, event handling, and controlled input.

The name state is initialized with an empty string and updated through the onChange event of the input field. This is controlled input where the input value is bound to state.

The expression {name || "Guest"} displays the entered name or "Guest" if the name is empty. This is a JavaScript expression in JSX using the logical OR operator.

The age state is incremented when the button is clicked using setAge(age + 1).

The score state uses the previous state pattern with a callback function. Instead of writing setScore(score + 1), a callback function (prev) => prev + 1 is passed to ensure the correct value is used even with rapid clicks.

The handleIncrement and handleDecrement functions are defined separately for cleaner code and passed as event handlers to the buttons.

This demonstrates the complete flow of props for passing data between components and state for managing data within a component.

## Video

[Watch Props & State in Hindi](https://youtu.be/uUbTd-lALjc?si=LhU2QGMmCevTbRRG)

## Notes

[Download Lesson 3 Notes PDF](http://localhost:3000/uploads/notes/react-l3.pdf)
