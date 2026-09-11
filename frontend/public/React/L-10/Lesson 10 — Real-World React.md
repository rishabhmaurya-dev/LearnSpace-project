# Lesson 10 — Real-World React

## Topic

Real-World React

- Project architecture
- Authentication
- Protected dashboard
- CRUD application
- API integration
- Form validation
- Reusable components
- Global state
- Error handling
- Environment variables
- Code optimization
- Production build
- Deployment
- React best practices

## Definition

Real-World React is the practice of building a complete, production-ready React application by combining authentication, protected routes, CRUD operations, API integration, form validation, reusable components, global state, error handling, environment variables, optimization, and deployment.

It moves beyond small demos and applies React best practices to build scalable, secure, and maintainable applications that behave reliably in production.

## Detailed Meaning

Building a real-world React application requires understanding how many features work together rather than in isolation. A typical application has a clear project architecture, a working login system, protected pages, data management, and a reliable deployment process.

Project architecture is the way files and folders are organized. A good structure separates concerns. Common folders include components, pages, hooks, services, utils, and context. Components holds reusable UI pieces, pages holds full screens, services holds API functions, and context or store holds global state. A clean architecture makes the project easy to navigate, test, and extend.

Authentication is the process of verifying who a user is. On the frontend, this usually means sending a username and password to a backend API and receiving a token in response. The token is stored safely, often in localStorage or a cookie, and is sent with every protected request. On page load, the application checks the token to decide whether the user is logged in.

A protected dashboard is a page that only logged-in users can access. It is implemented using protected routes. If the user is not authenticated, they are redirected to the login page. If they are authenticated, they see their private dashboard. React Router provides the Navigate component and route guards to handle this.

A CRUD application is one that supports Create, Read, Update, and Delete operations on data. For example, an LMS can create a course, list all courses, update a course, and delete a course. Each operation is usually connected to a backend API endpoint.

API integration is the process of connecting the frontend to a backend. A service layer wraps the fetch or Axios calls. Functions like getCourses or createCourse handle the request, convert the response into usable data, and return it to the components. Centralizing these calls in a service file keeps components clean.

Form validation ensures that user input is correct before it is submitted. Rules can require a field to be filled, an email to be in the right format, or a password to be long enough. Validation can be done manually with state or with a library such as react-hook-form. The form shows errors and only submits when the data is valid.

Reusable components are small, focused UI pieces used across the application. Buttons, inputs, modals, cards, and loaders are examples. They accept props for customization and follow a consistent design. Building reusable components reduces duplication and keeps the user interface consistent.

Global state holds data that many parts of the application need, such as the current user. It can be managed with the Context API or a library like Redux Toolkit. A single source of truth avoids passing the same data through many layers and keeps the app consistent.

Error handling ensures the application responds gracefully when something goes wrong. This includes catching errors from API calls, showing friendly messages, and showing loading states while requests are pending. Every request that can fail should have handling for both success and failure.

Environment variables store configuration values that differ between environments, such as the API base URL. They are defined in files like .env and .env.production and accessed through the import.meta.env object in Vite. Sensitive values are never placed in the frontend bundle.

Code optimization improves performance. Techniques include code splitting to load only what is needed, memoizing expensive values, avoiding unnecessary re-renders, and keeping bundle size small. A faster application feels better and reduces server load.

A production build creates an optimized version of the application that is ready to be served to users. Build tools minify the code, remove development-only code, and split bundles. The result is a dist or build folder containing static files.

Deployment is the process of putting the production build online so users can access it. The application is hosted on a service such as Vercel, Netlify, or a custom server. The backend and environment variables are configured on the hosting platform, and a build and deploy step serves the final application over HTTPS.

React best practices include keeping components small and focused, following naming conventions, managing state at the right level, using keys correctly in lists, writing clear and reusable code, handling side effects with hooks, and keeping sensitive data out of the client.

A real-world React application combines all of these pieces into one reliable product: a well-organized project, secure authentication, protected pages, working CRUD features, validated forms, reusable components, shared global state, careful error handling, environment-specific configuration, optimized bundles, and a smooth deployment process.

## Example

A protected route that only renders the dashboard when the user is logged in:

```jsx
<Route
  path="/dashboard"
  element={user ? <Dashboard /> : <Navigate to="/login" replace />}
/>
```

## Code Example

```jsx
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function useAuth() {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null,
  );

  const login = async (credentials) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, login, logout };
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates a small real-world application with authentication, protected routes, API integration, and error handling.

The API_URL constant reads the backend base URL from an environment variable using import.meta.env. This keeps the URL configurable per environment without hardcoding it.

A custom hook called useAuth manages the current user. It initializes the user from localStorage using lazy initial state in useState. The login function sends a POST request to the API, throws an error if the response is not ok, and otherwise stores the user in localStorage and in state. The logout function removes the user and clears state.

The Login component uses useState to manage the email, password, and error message. On submit, it calls the login function inside a try/catch block. If login fails, the error message is shown in red. On success, the user is navigated to the dashboard.

The Dashboard component reads the user from useAuth and displays a welcome message. The logout button calls logout and navigates back to the login page.

Back in App, the useAuth hook checks whether a user exists. The dashboard route is protected with a ternary: if a user is logged in, Dashboard is rendered; otherwise, the Navigate component redirects to the login page. The catch-all route redirects any unknown path to the dashboard.

This shows the core real-world flow of authentication, protected navigation, state management, API integration, and error handling working together in one application.

## Video

[Watch Real-World React in Hindi](https://youtu.be/tNn0vMDvuVU?si=7iVhwScR5U1b3PoN)

## Notes

[Download Lesson 10 Notes PDF](http://localhost:3000/uploads/notes/react-l10.pdf)
