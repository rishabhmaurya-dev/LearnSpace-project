# Lesson 9 — Advanced React & State Management

## Topic

Advanced React & State Management

- Context API
- useContext
- useReducer
- Context vs Redux
- Redux Concepts
- Redux Toolkit
- Store
- Slice
- Actions
- Selectors
- Async Thunks
- Custom Hooks
- React Performance Basics
- Lazy Loading

## Definition

The Context API is a React feature that allows data to be shared across multiple components without passing props manually through every level of the component tree.

useContext is a hook that reads the value from a context. useReducer is a hook that manages complex state using a reducer function and action objects.

Redux is a library for managing global state. Redux Toolkit is the official, modern way to write Redux logic, providing a store, slices, actions, selectors, and async thunks with less boilerplate.

## Detailed Meaning

The Context API solves the problem of prop drilling. Prop drilling is when props must be passed through many intermediate components just to reach a deeply nested component that needs them. The Context API lets a value be provided at a high level and consumed directly by any component that needs it.

A context is created with the createContext function. It returns a provider and a consumer. The provider supplies the value to its children, and the consumer or useContext hook reads it.

The useContext hook is used inside a component to read the current value of a context. It takes the context object and returns its value, without having to wrap every component with a consumer.

The useReducer hook is an alternative to useState. It is better for complex state logic that involves multiple related values. It takes a reducer function and an initial state, and returns the current state and a dispatch function.

A reducer is a function that receives the current state and an action, then returns the new state. An action is an object with a type property that describes what change to make. The dispatch function is used to send actions to the reducer.

Context and Redux both manage shared state, but they differ. Context is built into React and is good for simple shared values like themes or authentication. Redux is a separate library that is more powerful and structured, better suited for large applications with complex state.

Redux follows a pattern with a single store, actions, and reducers. The core Redux concepts are the store, actions, reducers, and selectors.

The store is the single source of truth that holds the entire application state. The whole state is kept in one store object.

A slice is a part of the Redux store that manages a specific feature. With Redux Toolkit, a slice combines the state, reducers, and actions for that feature into one place using the createSlice function.

Actions are plain objects that describe what happened, like { type: "course/add" }. Reducers respond to actions and compute the new state. In Redux Toolkit, action creators are generated automatically from the slice.

Selectors are functions that read a specific part of the state from the store. They keep components decoupled from the structure of the state.

Async thunks handle asynchronous operations like API calls in Redux. They are created with createAsyncThunk and manage the pending, fulfilled, and rejected states of the request.

Custom hooks allow logic to be extracted into reusable functions. They start with the word "use" and can call other hooks.

React performance basics focus on reducing unnecessary re-renders. Techniques include memoizing components with React.memo, memoizing values with useMemo, memoizing functions with useCallback, and keeping component tree structure stable.

Lazy loading splits the application into smaller chunks that are loaded on demand. It uses React.lazy to import a component lazily and Suspense to show a fallback while the component loads. This reduces the initial bundle size and speeds up the first load.

## Example

A Context that provides theme data to multiple components:

```jsx
const ThemeContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value={{ theme: "dark", toggle: toggleTheme }}>
      <Navbar />
      <Content />
    </ThemeContext.Provider>
  );
}
```

## Code Example

```jsx
import { createContext, useContext, useReducer } from "react";

const ThemeContext = createContext();

const initialState = { dark: true };

function reducer(state, action) {
  switch (action.type) {
    case "toggle":
      return { dark: !state.dark };
    default:
      return state;
  }
}

function Navbar() {
  const { state, dispatch } = useContext(ThemeContext);
  return (
    <div style={{ background: state.dark ? "#222" : "#fff" }}>
      <h1>Theme: {state.dark ? "Dark" : "Light"}</h1>
      <button onClick={() => dispatch({ type: "toggle" })}>Toggle</button>
    </div>
  );
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      <Navbar />
    </ThemeContext.Provider>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates useContext, useReducer, and the Context API together.

The ThemeContext is created with createContext. Its initial value is undefined until a provider is added.

The reducer function receives the current state and an action. When the action type is "toggle", it returns a new state with the dark value flipped. This is how the state update logic is kept in one place.

The useReducer hook is called in App with the reducer and initialState. It returns the state and the dispatch function. The dispatch function is used to send actions to the reducer.

The App wraps Navbar with the ThemeContext.Provider. The value provided contains both the state and the dispatch function, so any child component can read and update the theme.

The Navbar component uses the useContext hook to read the context value. It destructures state and dispatch from the context.

Navbar renders its background based on the state.dark value using the ternary operator. When the button is clicked, dispatch({ type: "toggle" }) sends an action, the reducer computes the new state, and the UI updates.

This demonstrates how Context shares data across the tree and how useReducer manages the state updates in a structured way.

## Video

[Watch Advanced React & State Management in Hindi](https://youtu.be/CoZY1svms-I?si=bq00F8vfgKuNJnBL)

## Notes

[Download Lesson 9 Notes PDF](http://localhost:3000/uploads/notes/react-l9.pdf)
