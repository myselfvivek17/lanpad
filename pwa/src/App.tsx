import { Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="screen">Phone Remote (scaffold)</div>} />
    </Routes>
  );
}
