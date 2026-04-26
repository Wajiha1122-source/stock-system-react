import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Manager from "./pages/Manager";
import Owner from "./pages/Owner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/owner" element={<Owner />} />

      </Routes>
    </BrowserRouter>
  );
}