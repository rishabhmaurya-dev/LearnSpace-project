# Introduction to React

## Topic

What is React and Why Use It?

- React kya hai?
- React library vs framework
- Meta and React
- React features
- Real-world use cases
- Why React is popular

## Definition

React is an open-source JavaScript library used for building fast, interactive, and dynamic user interfaces.

It is maintained by Meta and a large global community of developers. React allows developers to create modern web applications by dividing the user interface into small, reusable pieces called components.

React is mainly used for building the frontend or user interface of web applications. It helps developers create dynamic applications where the UI can automatically update when application data changes.

## Detailed Meaning

React is a JavaScript library that focuses on building user interfaces.

A user interface includes everything that users see and interact with in an application, such as buttons, navigation bars, forms, cards, dashboards, product lists, and user profiles.

Before React, developers commonly used HTML, CSS, and JavaScript directly to create interactive web pages. As an application becomes larger, manually managing and updating different parts of the DOM can become difficult.

React solves this problem using a component-based approach.

A component is a reusable piece of the user interface. For example, an LMS application can have separate components for a Navbar, Sidebar, Course Card, Lesson List, Quiz, Progress Bar, and User Profile.

Instead of writing the same UI code repeatedly, developers can create a component once and reuse it multiple times with different data.

React is called a library because its primary focus is building and managing the user interface. Developers can combine React with other libraries depending on their application requirements. For example, React Router can be used for navigation, Axios or Fetch can be used for API requests, and Redux Toolkit can be used for global state management.

React was originally developed at Facebook, which is now known as Meta. Today, React is maintained by Meta and supported by a large open-source community of developers.

One of the important features of React is its declarative approach. Instead of manually telling the browser how to update every individual DOM element, developers describe what the UI should look like based on the current data or state. When the state changes, React updates the required user interface.

React also uses a virtual representation of the user interface to efficiently manage updates. When application data changes, React compares the new UI representation with the previous one and determines the necessary updates for the actual DOM.

React follows a component-based architecture, supports reusable UI, provides one-way data flow, and has a large ecosystem of tools and libraries.

React is commonly used for building single-page applications, learning management systems, e-commerce applications, social media interfaces, admin dashboards, SaaS platforms, and other interactive web applications.

React is popular because it allows developers to build reusable components, manage dynamic data, create interactive user interfaces, organize large applications efficiently, and use a large ecosystem of libraries and tools.

## Example

A simple React component that displays a welcome message:

function Welcome({ name }) {
  return <h1>Welcome, {name}!</h1>;
}

export default Welcome;

## Code Example

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>React Counter</h1>

      <p>You clicked {count} times</p>

      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;

## Code Explaination

The Counter component demonstrates how React can create an interactive user interface.

The useState hook is imported from React to manage component state.

The following code creates a state variable named count with an initial value of 0:

const [count, setCount] = useState(0);

The count variable stores the current number of clicks, while setCount is used to update its value.

When the user clicks the button, the following code runs:

setCount(count + 1);

This updates the value of count by adding 1.

After the state changes, React re-renders the component and displays the updated value on the screen.

This demonstrates one of the main advantages of React: the user interface automatically updates when the component state changes.

## Video

[Watch Introduction to React in Hindi](https://www.youtube.com/watch?v=tiLWCNFzThE)

## Notes

[Download Lesson Notes PDF](https://localhost:3000/notes/introduction-to-react.pdf)
