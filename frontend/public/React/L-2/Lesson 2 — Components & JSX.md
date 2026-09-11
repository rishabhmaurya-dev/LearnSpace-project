# Lesson 2 — Components & JSX

## Topic

Components & JSX

- Functional Components
- Component reuse
- Component nesting
- JSX attributes
- JavaScript expressions in JSX
- className
- Fragments
- Component organization

## Definition

Components are the building blocks of a React application. A component is an independent, reusable piece of user interface that has its own logic and appearance.

Functional components are JavaScript functions that return JSX. They are the most common way to create components in modern React development.

JSX is a syntax extension that allows writing HTML-like code inside JavaScript files. It makes React code readable and easy to understand.

## Detailed Meaning

React applications are built using components. Every part of the user interface can be divided into small, independent pieces called components.

A functional component is simply a JavaScript function that returns JSX. The function name must start with a capital letter, and it returns the UI that should be displayed on the screen.

Component reuse is one of the biggest advantages of React. Once a component is created, it can be used multiple times in the same application or in different applications with different data.

Component nesting means using one component inside another component. For example, a Dashboard component can contain a Navbar component, a Sidebar component, and a Content component. This creates a tree-like structure of components.

JSX attributes are used to pass information to elements. They work similarly to HTML attributes but use camelCase naming. For example, class becomes className, onclick becomes onClick, and tabindex becomes tabIndex.

JavaScript expressions in JSX allow embedding dynamic values inside the UI. Any valid JavaScript expression can be written inside curly braces {} in JSX, including variables, function calls, calculations, and ternary operators.

className is the JSX version of the HTML class attribute. Since class is a reserved keyword in JavaScript, React uses className instead to apply CSS styles to elements.

Fragments are used to group multiple elements without adding an extra node to the DOM. They are written as <></> and help return multiple elements from a component without using unnecessary wrapper divs.

Component organization is the practice of structuring files and folders in a logical way. Components should be organized based on their functionality, and related components should be placed together in the same folder.

## Example

A React component that demonstrates component reuse and nesting with multiple child components:

```jsx
function StudentCard({ name, course, grade }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Course: {course}</p>
      <p>Grade: {grade}</p>
    </div>
  );
}

function StudentList() {
  const students = [
    { name: "John", course: "React", grade: "A" },
    { name: "Jane", course: "Node.js", grade: "B+" },
    { name: "Mike", course: "MongoDB", grade: "A-" },
  ];

  return (
    <div>
      <h1>Student Dashboard</h1>
      {students.map((student, index) => (
        <StudentCard
          key={index}
          name={student.name}
          course={student.course}
          grade={student.grade}
        />
      ))}
    </div>
  );
}
```

## Code Example

```jsx
import { Fragment } from "react";

function Header({ title }) {
  return <h1 className="header-title">{title}</h1>;
}

function Footer({ year }) {
  return <footer className="footer">© {year} My Website</footer>;
}

function App() {
  const courses = ["React", "Node.js", "MongoDB"];

  return (
    <Fragment>
      <Header title="Welcome to LMS" />

      <main>
        <h2>Available Courses</h2>
        <ul>
          {courses.map((course, index) => (
            <li key={index}>{course}</li>
          ))}
        </ul>
      </main>

      <Footer year={2024} />
    </Fragment>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates component reuse, nesting, className, fragments, and JavaScript expressions in JSX.

The Header and Footer components are created as separate functional components and reused inside the App component. This is component nesting where child components are used inside a parent component.

The Header component receives a title prop and displays it inside an h1 tag with className "header-title":

<Header title="Welcome to LMS" />

The courses array contains course names which are rendered dynamically using the map method inside a Fragment.

Fragment is used instead of a div wrapper to avoid adding an unnecessary node to the DOM. This keeps the DOM structure clean.

className is used instead of class to apply CSS styles since class is a reserved keyword in JavaScript.

The Footer component receives the year as a prop and displays it with copyright text using a JavaScript expression inside JSX.

This demonstrates the complete flow of component organization — creating small reusable components and combining them to build a complete user interface.

## Video

[Watch Components & JSX in Hindi](https://youtu.be/TyZQORWcquU?si=yXnGTOck63QYBJo6)

## Notes

[Download Lesson 2 Notes PDF](http://localhost:3000/uploads/notes/react-l2.pdf)
