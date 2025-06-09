import { useEffect, useState } from "react";

export default function Feedback() {
  const [type, setType] = useState("bug");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [entries, setEntries] = useState<{
    id: number;
    type: string;
    description: string;
    createdAt: string;
  }[]>([]);

  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description })
      });
      setEntries((prev) => [
        { id: Date.now(), type, description, createdAt: new Date().toISOString() },
        ...prev
      ]);
      setDescription("");
      setType("bug");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded p-2 w-full"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={status === "loading"}
        >
          Submit
        </button>
        {status === "success" && (
          <p className="text-green-600">Thank you for your feedback!</p>
        )}
        {status === "error" && (
          <p className="text-red-600">Something went wrong. Please try again.</p>
        )}
      </form>
      {entries.length > 0 && (
        <table className="mt-8 w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="p-2 border">{f.type}</td>
                <td className="p-2 border">{f.description}</td>
                <td className="p-2 border">
                  {new Date(f.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
