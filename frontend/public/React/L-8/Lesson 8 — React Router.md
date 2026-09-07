# Lesson 8 — React Router

## Topic

React Router

- React Router Setup
- Routes
- Link
- NavLink
- useNavigate
- useParams
- Nested Routes
- Dynamic Routes
- 404 Page
- Protected Routes
- Login/Logout Routing

## Definition

React Router is a library that enables navigation between different views or pages in a React application without reloading the entire page.

A route is a mapping between a URL path and a component. When the user visits a path, React Router renders the corresponding component.

Link is a React Router component that creates a clickable navigation link. NavLink is a special version of Link that adds an active class to the currently active link.

## Detailed Meaning

React Router is the standard library for client-side routing in React. It allows a single-page application to have multiple views while keeping the page from reloading when the user navigates.

First, React Router must be installed with the package manager. Then it is set up in the main file by wrapping the application with the BrowserRouter component, which keeps the UI in sync with the URL.

The Routes component contains Route elements. Each Route has a path and an element. When the URL matches a path, React Router renders the matching element.

Routes are matched in order. The first route that matches the current URL is rendered. The path "/" typically matches the home page.

The Link component is used for navigation instead of the regular anchor tag. Link prevents the default page reload and updates the URL and content instantly. Its to prop specifies the destination path.

NavLink is used for navigation menus and navigation bars. It works like Link but adds an "active" class to the link when its path matches the current URL, which is used for highlighting the currently selected menu item.

The useNavigate hook returns a navigate function. It is used to programmatically redirect the user, such as after a form is submitted or a login succeeds. Calling navigate("/path") moves the user to that path.

The useParams hook returns the dynamic parameters from the current URL. It is used in dynamic routes to read values such as an id from the URL, for example /course/:id gives access to the id param.

Nested routes are routes placed inside a parent route. They share the parent layout and render their content inside an outlet of the parent component. This is useful for pages with a common header, sidebar, or layout.

Dynamic routes are routes with variable parts in the path. The variable part is written with a colon, like /course/:id. Dynamic routes allow a single route pattern to handle many different records.

A 404 page is shown when the user visits a path that does not match any route. It is created by adding a route with the path "\*", which acts as a catch-all. The 404 page typically shows a "Page Not Found" message with a link back home.

Protected routes restrict access to certain pages based on authentication. If the user is not logged in, they are redirected to the login page. This is implemented by checking the login state and conditionally rendering either the protected page or a redirect.

Login and logout routing handles the flow of signing in and out. When the user logs in, they are navigated to the protected page. When they log out, the session is cleared and they are redirected back to the login page.

## Example

A set of routes that demonstrate basic routing with home and course pages:

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/courses" element={<Courses />} />
    <Route path="/course/:id" element={<CourseDetail />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

## Code Example

```jsx
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";

function Home() {
  return <h1>Welcome to the LMS</h1>;
}

function CourseDetail() {
  const { id } = useParams();
  return <h1>Course {id} details</h1>;
}

function Login() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/dashboard");
  };
  return <button onClick={handleLogin}>Log in</button>;
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const courses = ["React", "Node.js", "MongoDB"];

  return (
    <BrowserRouter>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/login">Login</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CoursesList courses={courses} />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route
          path="/dashboard"
          element={loggedIn ? <h1>Dashboard</h1> : <Navigate to="/login" />}
        />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates React Router setup, routes, Link, NavLink, useNavigate, useParams, dynamic routes, a 404 page, and protected routes.

The BrowserRouter component wraps the whole application. All routing components must live inside it.

The nav element uses NavLink for navigation. The active link is automatically highlighted by React Router.

The Routes component contains Route elements. Each path maps to a component. The route /course/:id is a dynamic route where :id is a variable.

The CourseDetail component uses the useParams hook. It reads the id value from the URL with const { id } = useParams(). This is how dynamic routes receive their parameters.

The dashboard route is a protected route. Its element is a ternary — if loggedIn is true, the dashboard renders. Otherwise, the Navigate component redirects the user to the login page.

The route path "\*" is the catch-all route. Any URL that does not match another route renders the 404 page.

The Login component uses the useNavigate hook. When the button is clicked, navigate("/dashboard") moves the user to the dashboard page.

This demonstrates the complete routing flow — setup, navigation links, dynamic parameters, programmatic navigation, and protected routes.

## Video

[Watch React Router in Hindi](https://youtu.be/VJov5QWEKE4?si=EYlU8SghYMUXHXOn)

## Notes

[Download Lesson 8 Notes PDF](http://localhost:3000/uploads/notes/react-l8.pdf)
