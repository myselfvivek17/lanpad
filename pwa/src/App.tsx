import { Route, Routes } from "react-router-dom";
import Devices from "./pages/Devices";
import Pair from "./pages/Pair";
import Control from "./pages/Control";
import Trackpad from "./pages/Trackpad";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Devices />} />
      <Route path="/pair" element={<Pair />} />
      <Route path="/control" element={<Control />} />
      <Route path="/trackpad" element={<Trackpad />} />
      <Route path="/keyboard" element={<div className="screen">Keyboard TBD next task</div>} />
      <Route path="/media" element={<div className="screen">Media TBD next task</div>} />
      <Route path="/power" element={<div className="screen">Power TBD next task</div>} />
    </Routes>
  );
}
