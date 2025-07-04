// pages/SignatureReview.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const SignatureReview = () => {
  const { user } = useAuth();
  const [signatures, setSignatures] = useState([]);

  const fetchSignatures = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/signatures/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSignatures(res.data);
    } catch (err) {
      toast.error("Failed to fetch signatures");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/signatures/status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      toast.success("Status updated");
      fetchSignatures(); // Refresh
    } catch {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Signature Review Panel</h2>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-sm text-left">
            <th className="p-2 border">Doc ID</th>
            <th className="p-2 border">Page</th>
            <th className="p-2 border">Signer</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {signatures.map((sig) => (
            <tr key={sig._id} className="text-sm">
              <td className="p-2 border">
                <Link to={`/documents/${sig.fileId}`} className="text-blue-600 underline">
                  {sig.fileId}
                </Link>
              </td>
              <td className="p-2 border">{sig.pageNumber}</td>
              <td className="p-2 border">{sig.signer?.email || sig.signer}</td>
              <td className="p-2 border capitalize">{sig.status}</td>
              <td className="p-2 border text-center space-x-2">
                <button
                  onClick={() => handleStatusChange(sig._id, "signed")}
                  className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleStatusChange(sig._id, "rejected")}
                  className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                >
                  ❌ Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SignatureReview;
