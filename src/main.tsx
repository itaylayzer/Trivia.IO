import ReactDOM from "react-dom/client";
import Main from "./pages/main.tsx";
import Play from "./pages/play.tsx";
import Host from "./pages/host.tsx";
import "./index.css";
import {  RouterProvider, createBrowserRouter } from "react-router-dom";
const router = createBrowserRouter([
    {
        path: "Trivia.IO",
        element: <Main />,
    },
    {
        path: "/Trivia.IO/play",
        element: <Play />,
    },
    {
        path: "/Trivia.IO/host",
        element: <Host />,
    },

]);

function App() {

    return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
