import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome to Tax My Backend</h1>
      <nav className="flex flex-col space-y-2">
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          Dashboard
        </Link>
        <Link to="/invoices" className="text-blue-500 hover:underline">
          Invoices
        </Link>
      </nav>
    </div>
  );
}
