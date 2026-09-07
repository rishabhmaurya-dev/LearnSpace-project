# Lesson 4 — Events, Forms & Conditional Rendering

## Topic

Events, Forms & Conditional Rendering

- onClick
- onChange
- onSubmit
- Form Handling
- Conditional Rendering
- Ternary Operator
- &&
- if/else
- Rendering Arrays
- Basic List Rendering

## Definition

Events are actions that happen in the browser, such as clicking a button, typing in an input field, or submitting a form. React handles events with attributes like onClick, onChange, and onSubmit.

Forms are used to collect user input. In React, form inputs are controlled by state, and form submission is handled with the onSubmit event.

Conditional rendering is the technique of displaying different UI based on a condition. React uses JavaScript operators like the ternary operator, the logical AND (&&), and if/else statements to conditionally render content.

## Detailed Meaning

Event handling in React is similar to plain JavaScript but with some differences. Event names are written in camelCase, like onClick instead of onclick, and event handlers are passed as functions inside curly braces instead of strings.

The onClick event runs a function when an element is clicked. It is commonly used on buttons, cards, and list items.

The onChange event runs when the value of an input field changes. It is used to update state as the user types.

The onSubmit event runs when a form is submitted. It is usually attached to the form element, and the default page reload behavior is prevented using the preventDefault method.

Form handling in React uses controlled components. A controlled component binds the input value to a state variable, and every change updates the state through the onChange handler. This keeps the form data and the UI always in sync.

HTML form elements naturally keep their own internal state based on user input. In React, this state is moved into the component state so that the component has full control over the form values.

Conditional rendering means showing different UI depending on the state or data. For example, a dashboard might show a loading spinner while data is fetching and then show the actual content once the data arrives.

The ternary operator is a shorthand for if/else. It has the form condition ? valueIfTrue : valueIfFalse. When the condition is true, the first value is returned, otherwise the second value is returned.

The logical AND operator (&&) is used for short-circuit rendering. It evaluates the left side first. If the left side is truthy, the right side is rendered. If the left side is falsy, the right side is ignored and nothing is rendered.

If/else statements are used for more complex conditional logic. They cannot be written directly inside JSX, so they are placed inside the function body before the return statement, and the result is stored in a variable that is then rendered.

Rendering arrays means displaying a list of data in the UI. The map method is used to transform an array of data into an array of JSX elements.

Basic list rendering works by calling map on an array and returning a JSX element for each item. Each item in the list should receive a unique key prop so React can efficiently update and reorder the list.

## Example

A React component that demonstrates event handling, form handling, conditional rendering, and list rendering:

```jsx
function App() {
  const courses = ["React", "Node.js", "MongoDB"];
  const isLoggedIn = true;

  return (
    <div>
      {isLoggedIn ? <p>Welcome back!</p> : <p>Please log in</p>}
      <ul>
        {courses.map((course) => (
          <li key={course}>{course}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Code Example

```jsx
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [tasks, setTasks] = useState(["Learn JSX", "Build a component"]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    setSubmitted(name);
  };

  const handleAddTask = () => {
    if (!submitted) return;
    setTasks([...tasks, submitted]);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button type="submit">Submit</button>
      </form>

      {submitted ? (
        <h2>Hello, {submitted}!</h2>
      ) : (
        <h2>Please submit the form</h2>
      )}

      {tasks.length > 0 && (
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates events, form handling, conditional rendering, and list rendering.

The name state stores the text typed in the input field. The onChange event updates the state with every keystroke using e.target.value.

The onSubmit event is attached to the form with handleSubmit. The preventDefault method stops the page from reloading. If the name is not empty, the submitted state is updated with the entered name.

Conditional rendering is used to show a welcome message if the form has been submitted, otherwise a request to submit. This uses the ternary operator with the condition submitted ? ... : ....

The AND operator (&&) is used to render the task list only if there are tasks. The expression tasks.length > 0 && (...) checks the condition first. If the array is empty, nothing is rendered.

The map method renders the tasks array into list items. The key prop helps React identify each item in the list for efficient updates.

This demonstrates the complete flow of event handling, controlled forms, conditional rendering, and list rendering in React.

## Video

[Watch Events, Forms & Conditional Rendering in Hindi](https://youtu.be/7o5FPaVA9m0?si=YuhFZZbP2eGu_J6a)

## Notes

[Download Lesson 4 Notes PDF](http://localhost:3000/uploads/notes/react-l4.pdf)
