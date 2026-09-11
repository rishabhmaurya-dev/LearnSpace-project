# Lesson 1 — React Introduction & Setup

## Topic

React Introduction & Setups

## Definition

React is an open-source JavaScript library used for building fast, interactive, and dynamic user interfaces.

It is maintained by Meta (Facebook) and a large global community of developers. React allows developers to create modern web applications by dividing the user interface into small, reusable pieces called components.

React mainly focuses on building the frontend or user interface of web applications. It helps developers create dynamic applications where the UI automatically updates when the data changes.

## Detailed Meaning

React is a JavaScript library that focuses on building user interfaces.

A user interface includes everything that users see and interact with in an application — buttons, navigation bars, forms, cards, dashboards, product lists, and user profiles.

Before React, developers commonly used HTML, CSS, and JavaScript directly to create interactive web pages. As an application becomes larger, manually managing and updating different parts of the DOM becomes difficult.

React solves this problem using a component-based approach.

A component is a reusable piece of the user interface. For example, an LMS application can have separate components for Navbar, Sidebar, Course Card, Lesson List, Quiz, Progress Bar, and User Profile.

Instead of writing the same UI code repeatedly, developers can create a component once and reuse it multiple times with different data.

React is called a library because its primary focus is building and managing the user interface. Developers can combine React with other libraries depending on their application requirements — React Router for navigation, Axios for API requests, and Redux Toolkit for state management.

React was originally developed at Facebook, which is now known as Meta. Today, React is maintained by Meta and supported by a large open-source community of developers.

One of the important features of React is its declarative approach. Instead of manually telling the browser how to update every individual DOM element, developers describe what the UI should look like based on the current data or state. When the state changes, React updates the required user interface.

React also uses a virtual representation of the user interface to efficiently manage updates. When application data changes, React compares the new UI representation with the previous one and determines the necessary updates for the actual DOM.

React follows a component-based architecture, supports reusable UI, provides one-way data flow, and has a large ecosystem of tools and libraries.

React is commonly used for building single-page applications, learning management systems, e-commerce applications, social media interfaces, admin dashboards, and other interactive web applications.

## Example

A simple React component that demonstrates JSX expressions, conditional rendering, and list rendering using map method:

```jsx
const student = {
  name: "John",
  isEnrolled: true,
  courses: ["React", "Node.js", "MongoDB"],
};

const element = (
  <div>
    <h1>Welcome, {student.name}!</h1>
    {student.isEnrolled ? <p>You are enrolled</p> : <p>Please enroll</p>}
    <ul>
      {student.courses.map((course, index) => (
        <li key={index}>{course}</li>
      ))}
    </ul>
  </div>
);
```

## Code Example

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const courseName = "React Introduction";
  const topics = ["JSX", "Components", "Setup"];

  return (
    <div>
      <h1>{courseName}</h1>
      <p>Topics: {topics.join(", ")}</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates React and JSX basics.

First, the useState hook is imported from React to manage component state.

The courseName variable stores the course name which is directly rendered in JSX:

const courseName = "React Introduction";

The topics array contains chapter names which are converted into a comma-separated string using the join method:

const topics = ["JSX", "Components", "Setup"];

When the user clicks the button, the setCount function updates the count:

setCount(count + 1);

After the state changes, React re-renders the component and the updated value is displayed on the screen.

This is the basic flow of React — state update, re-render, UI update.

## Video

[Watch React Introduction & Setup in Hindi](https://www.youtube.com/watch?v=tiLWCNFzThE)

## Notes

[Download Lesson 1 Notes PDF](https://learnspace-kappa.vercel.app/notes/react-l1.pdf)
