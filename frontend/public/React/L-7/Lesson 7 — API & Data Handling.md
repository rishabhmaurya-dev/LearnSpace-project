# Lesson 7 — API & Data Handling

## Topic

API & Data Handling

- REST API Basics
- fetch()
- Axios
- GET Request
- POST Request
- PUT/PATCH
- DELETE
- Loading State
- Error Handling
- API Response Handling
- CRUD UI

## Definition

An API is a set of rules that allows different software applications to communicate with each other. In web development, an API is typically a server that provides data to the frontend.

REST is an architectural style for building APIs that uses standard HTTP methods like GET, POST, PUT, PATCH, and DELETE to perform operations on data.

fetch is a built-in JavaScript function used to make HTTP requests to an API. Axios is a popular JavaScript library that provides a simpler and more powerful way to make HTTP requests.

## Detailed Meaning

REST stands for Representational State Transfer. A REST API uses HTTP methods to communicate with a server. Each method has a meaning — GET retrieves data, POST creates new data, PUT and PATCH update existing data, and DELETE removes data.

These methods map to CRUD operations. CRUD stands for Create, Read, Update, and Delete, which are the four basic operations performed on data. GET maps to Read, POST maps to Create, PUT and PATCH map to Update, and DELETE maps to Delete.

The fetch function is built into the browser. It takes a URL and returns a promise that resolves to a Response object. The response must be converted to JSON by calling the json method, which also returns a promise.

Fetch uses a promise-based approach, so the then and catch methods, or async and await keywords, are used to handle the result and any errors.

Axios is a third-party library that must be installed. It provides a cleaner syntax and automatically converts the response to JSON. Axios also handles errors more conveniently with its catch block and error.response object.

A GET request is used to read or fetch data from the server. It is the most common request and is made when the page loads to display a list of records.

A POST request is used to create new data. The new data is sent in the request body as JSON. After a successful POST, the new record is typically added to the existing list in state.

PUT and PATCH are used to update existing data. PUT replaces the entire record, while PATCH updates only specific fields. Both send the updated data in the request body and identify the record by its id.

A DELETE request removes data from the server. When a delete succeeds, the deleted record is removed from the state list, and the UI updates.

Loading state tracks whether an API request is still in progress. It is usually a boolean stored in state. While loading is true, a spinner or message is shown instead of the data.

Error handling stores error information in state. When a request fails, an error message is displayed to the user. This keeps the UI informative and prevents silent failures.

API response handling means reading the data returned by the server and converting it into the correct shape for the component to render. Response data is usually stored in state and then rendered with the map method.

A CRUD UI combines all of this — a list that loads data from the server, forms to create and edit records, and buttons to delete them. The full CRUD flow keeps the UI in sync with the backend data.

## Example

A GET request using fetch to load data from an API:

```jsx
useEffect(() => {
  fetch("https://api.example.com/courses")
    .then((res) => res.json())
    .then((data) => setCourses(data))
    .catch(() => setError("Failed to load courses"));
}, []);
```

## Code Example

```jsx
import { useState, useEffect } from "react";

const API = "https://api.example.com/courses";

function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
    if (!title) return;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const newCourse = await res.json();
    setCourses([...courses, newCourse]);
    setTitle("");
  };

  const deleteCourse = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setCourses(courses.filter((course) => course.id !== id));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course title"
      />
      <button onClick={addCourse}>Add Course</button>

      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {course.title}
            <button onClick={() => deleteCourse(course.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

## Code Explanation

The App component demonstrates the full CRUD flow with loading and error states.

The loadCourses function performs a GET request using fetch and async/await. It sets loading to true before the request and clears any previous error.

Inside the try block, the response is checked with res.ok. If the request fails, an error is thrown. Otherwise, the response is converted to JSON and stored in state.

In the finally block, loading is set to false regardless of whether the request succeeded or failed. This ensures the loading indicator is always removed.

The addCourse function performs a POST request. The new data is sent in the request body using the headers property with Content-Type application/json. After success, the new course is appended to the state array.

The deleteCourse function performs a DELETE request using the course id in the URL. After success, the deleted course is removed from state with the filter method.

The useEffect hook calls loadCourses once when the component mounts, so the list loads automatically on page open.

Conditional rendering shows a loading message while data is fetching and an error message if the request fails. Otherwise, the list of courses is rendered with the map method.

This demonstrates the complete cycle of requesting data, handling responses, managing loading and error states, and updating the UI for a CRUD interface.

## Video

[Watch API & Data Handling in Hindi](https://youtu.be/NxAwOjb_NlA?si=guijFvdqbAyczdRX)

## Notes

[Download Lesson 7 Notes PDF](http://localhost:3000/uploads/notes/react-l7.pdf)
