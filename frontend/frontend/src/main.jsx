import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";

import App from "./App";

import { store } from "./app/store";

import { Toaster } from "react-hot-toast";

import { setupAxiosInterceptors } from "./services/axios";

import "./styles/variables.css";
import "./styles/global.css";
import "./index.css";
import "./styles/responsive.css";

setupAxiosInterceptors(store);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <Toaster position="top-right" />
  </Provider>,
);
