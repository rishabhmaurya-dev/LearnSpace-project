# Lesson 5 — Lists, Keys & Component Communication

## Topic

Lists, Keys & Component Communication

- map()
- Keys
- Why keys are important
- Parent → Child
- Child → Parent
- Callback Props
- Lifting State Up
- Shared State
- Reusable Components

## Definition

Lists in React are rendered by transforming an array of data into an array of JSX elements using the map method. Each item in the rendered list requires a unique key prop.

Keys are special string attributes that help React identify which items have changed, been added, or been removed in a list.

Component communication is the way data and events flow between components. It happens from parent to child through props and from child to parent through callback props.

## Detailed Meaning

Rendering lists is a common task in React. Instead of writing each list item manually, the map method iterates over an array and returns a new array of JSX elements for each value.

The map method receives a callback that runs once for every item in the array. The callback can return a JSX element, and the result is an array of elements that React renders as a list.

Keys are required whenever a list is rendered. A key is a unique identifier for each item, passed as key prop, such as key={item.id}. Keys help React track each element so it can update the list efficiently.

Keys are important because React uses them to match items between renders. Without keys, React cannot tell which items changed, causing unexpected behavior when items are added, removed, or reordered. Using a unique, stable key avoids these problems.

Data flows from parent to child through props. A parent component passes data to a child component by adding attributes to the child tag, and the child receives and uses those props.

Data flows from child to parent through callback props. A parent passes a function down to the child as a prop. The child calls that function, usually with some data as an argument, and the parent receives the data and reacts to it.

Lifting state up means moving shared state from a child component to its closest common parent component. This allows multiple children to access and update the same piece of state.

Shared state is state that is used by more than one component. By lifting the state up to a common parent, the state is placed in one location where all related children can read it and update it through callbacks.

Reusable components are components designed to be used in multiple places with different data. By receiving data through props and sending updates through callbacks, the same component can be used again and again without duplication.

## Example

A React component that demonstrates list rendering with keys and parent-child component communication:

```jsx
function TodoItem({ todo, onRemove }) {
  return (
    <li>
      {todo.text}
      <button onClick={() => onRemove(todo.id)}>Delete</button>
    </li>
  );
}

function App() {
  const todos = [
    { id: 1, text: "Learn JSX" },
    { id: 2, text: "Build a component" },
  ];

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onRemove={handleRemove} />
      ))}
    </ul>
  );
}
```

## Code Example

```jsx
import { useState } from "react";

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
}

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React", completed: false },
    { id: 2, text: "Build a form", completed: false },
  ]);

  const handleToggle = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDelete = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div>
      <h1>My Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
```

## Code Explanation

The App component holds the shared todos state. This is lifting state up — the state lives in the parent and is shared with all the child TodoItem components.

Each todo object has an id, text, and completed field. The id is used as the unique key for each list item.

The map method renders each todo into a TodoItem component. The key prop is set to todo.id to give React a stable identity for each item.

The TodoItem component receives data from the parent through the todo prop, which is parent to child communication.

The onToggle and onDelete props are callback props. They are functions passed from the parent to the child. When the child calls these functions with the todo's id, the data flows from child to parent.

handleToggle updates the todos state by toggling the completed value of the matching todo. It uses the map method to create a new array with the updated item.

handleDelete removes the selected todo from the list using the filter method, which keeps only the todos whose id does not match.

This demonstrates the full communication cycle — data flows down through props and events flow up through callback props, with the state lifted to the common parent.

## Video

[Watch Lists, Keys & Component Communication in Hindi](https://youtu.be/IT28ZrwJea0?si=u5GuY9bmGxoMMaCj)

## Notes

[Download Lesson 5 Notes PDF](http://localhost:3000/uploads/notes/react-l5.pdf)
