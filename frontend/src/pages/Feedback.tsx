import { useEffect, useState } from "react";

type Entry = {
  id: number;
  type: "bug" | "feature";
  note: string;
  status: "open" | "closed";
  created?: string;               // adjust if your column is named differently
};

export default function Feedback() {
  const [type, setType] = useState<"bug" | "feature">("bug");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  /** fetch all rows once on mount */
  useEffect(() => {
    fetch("/api/feedback.php")
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => {}); // ignore initial load error
  }, []);

  /** form submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/public_html/api/feedback.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          note,                // php expects "note"
          prompt: null,        // optional for future AI use
          status: "open",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Request failed");
      }

      // optimistic: add the new row locally
      setEntries((prev) => [
        {
          id: data.id,
          type,
          note,
          status: "open",
          created: new Date().toISOString(),
        },
        ...prev,
      ]);

      setNote("");
      setType("bug");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "bug" | "feature")
            }
            className="border rounded p-2 w-full"
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border rounded p-2 w-full"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Submitting…" : "Submit"}
        </button>

        {status === "success" && (
          <p className="text-green-600">Thank you for your feedback!</p>
        )}
        {status === "error" && (
          <p className="text-red-600">
            {errorMsg ?? "Something went wrong. Please try again."}
          </p>
        )}
      </form>

      {/* TABLE */}
      {entries.length > 0 && (
        <table className="mt-8 w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Note</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="p-2 border">{f.type}</td>
                <td className="p-2 border">{f.note}</td>
                <td className="p-2 border">{f.status}</td>
                <td className="p-2 border">
                  {f.created
                    ? new Date(f.created).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
