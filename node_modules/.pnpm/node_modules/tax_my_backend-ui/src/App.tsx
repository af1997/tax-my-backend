import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";

export default function App() {
  return (
    <div className="min-h-screen p-4">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoices/*" element={<Invoices />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
