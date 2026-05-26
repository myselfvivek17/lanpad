import { Route, Routes } from "react-router-dom";
import Devices from "./pages/Devices";
import Pair from "./pages/Pair";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Devices />} />
      <Route path="/pair" element={<Pair />} />
      <Route path="/control" element={<div className="screen">Control screen TBD in next tasks</div>} />
    </Routes>
  );
}
