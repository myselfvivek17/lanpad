import { Route, Routes } from "react-router-dom";
import Devices from "./pages/Devices";
import Pair from "./pages/Pair";
import Control from "./pages/Control";
import Trackpad from "./pages/Trackpad";
import Keyboard from "./pages/Keyboard";
import Media from "./pages/Media";
import Power from "./pages/Power";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Devices />} />
      <Route path="/pair" element={<Pair />} />
      <Route path="/control" element={<Control />} />
      <Route path="/trackpad" element={<Trackpad />} />
      <Route path="/keyboard" element={<Keyboard />} />
      <Route path="/media" element={<Media />} />
      <Route path="/power" element={<Power />} />
    </Routes>
  );
}
