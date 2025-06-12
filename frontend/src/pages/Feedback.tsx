import { useEffect, useState } from "react";

type Entry = {
  id: number;
  type: "bug" | "feature";
  note: string;
  status: "open" | "closed";
  created?: string; // ISO string from DB
};

export default function Feedback() {
  /* form state */
  const [type, setType] = useState<"bug" | "feature">("bug");
  const [note, setNote] = useState("");

  /* request / ui state */
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* table data */
  const [entries, setEntries] = useState<Entry[]>([]);

  /** toggle status for a single entry */
  const toggleStatus = async (entry: Entry) => {
    const newStatus = entry.status === "open" ? "closed" : "open";
    try {
      await fetch("/api/feedback.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, status: newStatus }),
      });
      fetchEntries();      // refresh list
    } catch {
      /* ignore errors for now */
    }
  };


  /* ------------------------------------------------------------------ */
  /** fetch all rows */
  const fetchEntries = () =>
    fetch("/api/feedback.php")
      .then((r) => r.json())
      .then((rows: any[]) =>
        // map DB keys → Entry (rename created_at → created, etc.)
        rows.map((r) => ({
          id: r.id,
          type: r.type,
          note: r.note,
          status: r.status,
          created: r.created ?? r.created_at ?? undefined,
        })) as Entry[]
      )
      .then(setEntries)
      .catch(() => {}); // swallow initial load errors silently

  /* load once on mount */
  useEffect(() => {
    fetchEntries();
  }, []);

  /* ------------------------------------------------------------------ */
  /** submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feedback.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          note,
          prompt: "", // send empty string (column allows NULL, but this is fine)
          status: "open",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Request failed");
      }

      /* refresh list from DB so we show server-truth */
      await fetchEntries();

      /* reset form */
      setNote("");
      setType("bug");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "bug" | "feature")}
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
      {entries.length > 0 ? (
        <table className="mt-8 w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Note</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Created</th>
              <th className="border p-2 text-left">Action</th>
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
                <td className="p-2 border text-center">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => toggleStatus(f)}
                  >
                    {f.status === "open" ? "Close" : "Reopen"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-8 text-gray-600">No feedback yet.</p>
      )}
    </div>
  );
}
