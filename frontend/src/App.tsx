import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Feedback from "./pages/Feedback";
import Customers from "./pages/Customers";

export default function App() {
  return (
    <div className="min-h-screen p-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices/*" element={<Invoices />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
