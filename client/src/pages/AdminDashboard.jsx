// pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [signatures, setSignatures] = useState([]);

  const [filterStatus, setFilterStatus] = useState("all");

  const fetchSignatures = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/signatures/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSignatures(res.data);
    } catch (err) {
      toast.error("Error loading signature data");
    }
  };

  useEffect(() => {
    fetchSignatures();
    const fetchLogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/activities`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setLogs(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch activity logs:", err);
    }
  };

  fetchLogs();
  }, []);

  const filtered = filterStatus === "all"
    ? signatures
    : signatures.filter((sig) => sig.status === filterStatus);

  const total = signatures.length;
  const signed = signatures.filter((s) => s.status === "signed").length;
  const pending = signatures.filter((s) => s.status === "pending").length;
  const rejected = signatures.filter((s) => s.status === "rejected").length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold mb-6">📊 Admin Signature Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Total</h3>
          <p className="text-2xl">{total}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Signed</h3>
          <p className="text-2xl">{signed}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Pending</h3>
          <p className="text-2xl">{pending}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Rejected</h3>
          <p className="text-2xl">{rejected}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center mb-4">
        <label>
          <span className="text-sm mr-2">Filter by Status:</span>
          <select
            className="border px-3 py-1 rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="signed">Signed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      {/* Table */}
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-50 text-sm text-left">
          <tr>
            <th className="p-2 border">Doc ID</th>
            <th className="p-2 border">Page</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Signed By</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((sig) => (
            <tr key={sig._id} className="text-sm">
              <td className="p-2 border">{sig.fileId}</td>
              <td className="p-2 border">{sig.pageNumber}</td>
              <td className="p-2 border capitalize">{sig.status}</td>
              <td className="p-2 border">{sig.signer?.email || "Unknown"}</td>
              <td className="p-2 border">{new Date(sig.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-10 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-cyan-700">🕒 Signature Activity Timeline</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500">No activity recorded yet.</p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log._id} className="p-4 border bg-white rounded shadow text-sm">
              <p>
                <strong>{log.user?.name || "Unknown User"}</strong> signed <strong>{log.fileId?.originalName}</strong>
              </p>
              <p className="text-zinc-500">{new Date(log.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>

    </div>
  );
};

export default AdminDashboard;
