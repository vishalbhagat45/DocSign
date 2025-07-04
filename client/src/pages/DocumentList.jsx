import React, { useState, useEffect, useRef } from "react";
import { FaSignOutAlt, FaGoogleDrive, FaDropbox } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Document, Page, pdfjs } from "react-pdf";
import fileDownload from "js-file-download";
import PDFSigner from "../components/PDFSigner";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef();
  const dropRef = useRef();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.token) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const token = user?.token || JSON.parse(localStorage.getItem("docsign-user"))?.token;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/documents/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Session expired or unauthorized. Please login again.");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out");
    navigate("/");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    loadFile(file);
  };

  const loadFile = (file) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPageNumber(1);
    } else {
      toast.error("Please select a PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    loadFile(file);
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const handleUploadPDF = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("PDF uploaded successfully!");
      fetchDocuments();
    } catch (err) {
      toast.error("Failed to upload PDF.");
      console.error(err);
    }
  };

  const handlePreviewClick = (doc) => {
    setSelectedDoc(doc);
    setSelectedFile(null);
    const fullUrl = `${import.meta.env.VITE_API_URL}/uploads/${doc.path || doc.filename}`;
    setPreviewUrl(fullUrl);
  };

  const handleDownloadSignedPDF = async (fileId, filename = "signed.pdf") => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/signatures/generate/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        return alert("❌ Download failed: " + err.message);
      }

      const blob = await response.blob();
      fileDownload(blob, filename.replace(".pdf", "-signed.pdf"));
    } catch (err) {
      console.error("❌ Error downloading signed PDF:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDeletePDF = async (doc) => {
  if (!window.confirm("Are you sure you want to delete this PDF?")) return;

  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/documents/${doc._id}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    toast.success("✅ PDF deleted");
    fetchDocuments(); // Refresh list
  } catch (err) {
    console.error("❌ Error deleting PDF:", err);
    toast.error("Failed to delete PDF");
  }
};


  const handlePdfClick = async (e) => {
    if (!selectedDoc) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/signatures`,
        {
          fileId: selectedDoc._id,
          pageNumber,
          x,
          y,
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success("✔ Signature placed.");
    } catch (err) {
      console.error("❌ Signature placement failed:", err);
      toast.error("Failed to place signature.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-cyan-800 dark:bg-cyan-900 dark:text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-white dark:bg-zinc-800 shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-cyan-600 cursor-pointer" onClick={() => navigate("/")}>
          DocSign
        </h1>
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1 rounded text-cyan-600 border border-cyan-500 hover:bg-cyan-100"
            >
              <FaSignOutAlt /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-cyan-600 font-medium hover:underline">
                Login
              </Link>
              <Link to="/register" className="text-cyan-600 font-medium hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Upload UI */}
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">Sign PDF</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 ">Your tool to eSign documents. Upload and sign your PDF.</p>

        <label className="relative cursor-pointer bg-teal-500 hover:bg-teal-600 text-white font-semibold text-lg px-6 py-3 rounded-lg shadow inline-block mb-3">
          Select PDF file
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            ref={fileInputRef}
          />
        </label>
        <button
          onClick={handleUploadPDF}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-lg px-6 py-3 rounded-lg shadow inline-block mb-3 ml-4"
        >
          Upload PDF
        </button>

        <div
          ref={dropRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-cyan-300 rounded-lg w-80 h-32 flex items-center justify-center text-zinc-400 mb-6"
        >
          Drop PDF here
        </div>

        <div className="flex gap-4 mb-4">
          <button className="bg-white border rounded-full shadow p-3 hover:bg-gray-100">
            <FaGoogleDrive size={24} color="teal" />
          </button>
          <button className="bg-white border rounded-full shadow p-3 hover:bg-gray-100">
            <FaDropbox size={24} color="teal" />
          </button>
        </div>
      </div>

      {/* Preview Viewer */}
      {previewUrl && (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto mb-10">
          <div className="flex justify-between items-center mb-4">
            <div className="space-x-2">
              <button onClick={() => setPageNumber((p) => Math.max(p - 1, 1))} disabled={pageNumber <= 1} className="px-3 py-1 bg-zinc-200 text-zinc-600 rounded hover:bg-zinc-300">
                ◀ Prev
              </button>
              <button onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages} className="px-3 py-1 bg-zinc-200 text-zinc-600 rounded hover:bg-zinc-300">
                Next ▶
              </button>
              <span className="text-sm text-zinc-600">
                Page {pageNumber} / {numPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">Zoom</span>
              <input type="range" min="0.5" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
              <span className="text-sm text-zinc-600">{zoom.toFixed(1)}x</span>
            </div>
          </div>

          <div className="border shadow rounded overflow-hidden mx-auto w-fit text-zinc-600" onClick={handlePdfClick}>
            <Document file={previewUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} width={600 * zoom} />
            </Document>
          </div>
        </div>
      )}

      {/* Uploaded Documents */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h3 className="text-2xl font-bold mb-4">Your Documents</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="border p-4 rounded bg-white shadow">
              <h4 className="font-semibold truncate mb-2">{doc.originalName || doc.filename}</h4>
              <div className="text-sm text-gray-600">Uploaded: {new Date(doc.createdAt).toLocaleString()}</div>

              <div className="mt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setPreviewUrl(`${import.meta.env.VITE_API_URL}/${doc.path || `uploads/${doc.filename}`}`);
                  }}
                  className="text-sm bg-cyan-500 text-white rounded px-3 py-1 hover:bg-cyan-600"
                >
                  Preview / Sign
                </button>

                <button
                  onClick={() => handleDownloadSignedPDF(doc._id, doc.filename)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Download Signed PDF
                </button>

                <button
                  onClick={() => handleDeletePDF(doc)}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Signer */}
      {selectedDoc && (
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <h3 className="text-xl font-bold mb-4">Sign Document: {selectedDoc.originalName}</h3>
          <PDFSigner fileUrl={`${import.meta.env.VITE_API_URL}/uploads/${selectedDoc.filename}`} fileId={selectedDoc._id} />
          <button onClick={() => setSelectedDoc(null)} className="mt-4 text-sm text-cyan-600 hover:underline">
            ⬅ Back to Document List
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
