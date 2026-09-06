# React Components & JSX

## Topic

Understanding Components, Props and JSX Syntax

## Definition

A React component is a reusable, self-contained piece of UI that can be composed to build complex interfaces. JSX is a syntax extension for JavaScript that looks like HTML and is used to describe what the UI should look like.

## Detailed Meaning

Components are the building blocks of any React application. They can be function-based or class-based. A function component accepts props (inputs) and returns JSX describing the UI. JSX gets compiled by tools like Babel into React.createElement calls, which create lightweight JavaScript objects describing the DOM structure.

Components can be nested, and data flows downward through props. This unidirectional data flow makes behavior predictable. State can be added to components using hooks such as useState to make them interactive.

## Example

A component that renders a product card:

function ProductCard({ name, price }) {
return (
<div className="card">
<h3>{name}</h3>
<p>${price}</p>
</div>
);
}

## Code Example

function App() {
const product = { name: "Wireless Mouse", price: 29.99 };

return <ProductCard name={product.name} price={product.price} />;
}

## Code Explanation

The App component creates a product object and passes its values down to ProductCard as props. ProductCard then uses those props to render the name and price. This demonstrates how data flows from parent to child in React.

## Video

[Watch: React Components Tutorial](https://www.youtube.com/watch?v=u6gN7Y0BcWc)

## Notes

[Download Components Notes PDF](http://localhost:3000/uploads/notes/proj.pdf)
