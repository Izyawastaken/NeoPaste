import { Routes, Route, Navigate } from "react-router-dom";

import Creator from "./pages/Creator";
import ViewPage from "./pages/ViewPage"; // if you have it

export default function App() {
  return (
    <Routes>
      {/* Redirect root to /create */}
      <Route path="/" element={<Navigate to="/create" replace />} />

      {/* Creator page */}
      <Route path="/create" element={<Creator />} />

      {/* View page */}
      <Route path="/view" element={<ViewPage />} />

      {/* Fallback 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}
