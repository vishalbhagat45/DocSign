import { useEffect, useState, useRef } from "react";
import { Document, Page } from "react-pdf";
import Draggable from "react-draggable";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const PDFSigner = ({ fileUrl, fileId }) => {
  const { user } = useAuth();
  const [numPages, setNumPages] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [signaturePreview, setSignaturePreview] = useState(false);
  const [zoom, setZoom] = useState(1.2);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [customText, setCustomText] = useState(""); // ⬅️ New

  const signatureRef = useRef(null);

  const onLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const fetchSignatures = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/signatures/file/${fileId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setSignatures(res.data);
    } catch (err) {
      toast.error("Failed to load signatures");
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, [fileId]);

  const handleDrop = async (e, data, pageNum) => {
  const pdfContainer = document.getElementById("pdf-page-" + pageNum);
  const rect = pdfContainer.getBoundingClientRect();

  const xRatio = (data.x - rect.left) / rect.width;
  const yRatio = (data.y - rect.top) / rect.height;

  const payload = {
    fileId,
    pageNumber: pageNum,
    x: xRatio,
    y: yRatio,
  };


    // Send image or text
    if (uploadedImageUrl) {
      payload.signatureImageUrl = uploadedImageUrl;
    } else if (customText.trim()) {
      payload.text = customText.trim();
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/signatures`,
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setSignatures((prev) => [...prev, res.data]);
      toast.success("Signature placed!");
    } catch (err) {
      console.error("Signature drop failed", err);
      toast.error("Signature failed");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/signatures/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedImageUrl(res.data.imageUrl);
      toast.success("Signature image uploaded");
    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  const handleDownload = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/signatures/generate/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        responseType: "blob", // 👈 Required for PDF
      }
    );
    console.log("PDF size (bytes):", response.data.size);

    if (response.data.size === 0) {
      toast.error("Received empty file. Check server logs.");
      return;
    }

    const blob = new Blob([response.data], { type: "application/pdf" });

    const blobURL = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobURL;
    a.download = "signed-document.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobURL);
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Download failed. Check console for details.");
  }
};



  return (
    <div className="w-full flex flex-col items-center">
      {/* Controls */}
      <div className="mb-4 flex gap-3 items-center flex-wrap">
      <button onClick={handleDownload} className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Download Signed PDF
      </button>


        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="bg-cyan-600 text-white px-3 py-1 rounded"
        >
          Zoom In +
        </button>
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="bg-cyan-600 text-white px-3 py-1 rounded"
        >
          Zoom Out -
        </button>
        <button
          onClick={() => setSignaturePreview(!signaturePreview)}
          className="bg-cyan-700 text-white px-3 py-1 rounded"
        >
          {signaturePreview ? "Hide Signature" : "Place Signature"}
        </button>

        <label className="text-sm text-white bg-zinc-800 px-3 py-1 rounded cursor-pointer hover:bg-zinc-700">
          Upload Signature Image
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {/* ➕ Text Signature Input */}
        <input
          type="text"
          placeholder="Enter Signature Text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="px-2 py-1 rounded border text-black"
        />
      </div>

      {/* PDF Viewer */}
      <Document file={fileUrl} onLoadSuccess={onLoadSuccess} className="border shadow-lg">
        {Array.from(new Array(numPages), (_, i) => {
          const pageNum = i + 1;
          return (
            <div key={pageNum} className="relative mb-6" id={`pdf-page-${pageNum}`}>
              <Page pageNumber={pageNum} scale={zoom} />

              {/* Render Existing Signatures */}
              {signatures
                .filter((sig) => sig.pageNumber === pageNum)
                .map((sig, idx) => (
                  <div
                    key={idx}
                    className="absolute"
                    style={{
                      top: `${sig.y * 100}%`,
                      left: `${sig.x * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {sig.signatureImageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${sig.signatureImageUrl}`}
                        alt="Signature"
                        className="w-16 h-8 object-contain"
                      />
                    ) : (
                      <div className="bg-green-500 text-white px-2 py-1 text-xs rounded shadow">
                        {sig.text || "✅ Signed"}
                      </div>
                    )}
                  </div>
                ))}

              {/* Draggable Signature Preview */}
              {signaturePreview && (
                <Draggable
                  bounds="parent"
                  nodeRef={signatureRef}
                  onStop={(e, data) => handleDrop(e, data, pageNum)}
                >
                  <div ref={signatureRef} className="absolute cursor-move">
                    {uploadedImageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${uploadedImageUrl}`}
                        alt="Preview"
                        className="w-16 h-8 object-contain border border-cyan-500"
                      />
                    ) : customText.trim() ? (
                      <div className="bg-cyan-600 text-white text-xs px-3 py-1 rounded shadow">
                        {customText}
                      </div>
                    ) : (
                      <div className="bg-cyan-600 text-white text-xs px-3 py-1 rounded shadow">
                        ✍️ Your Signature
                      </div>
                    )}
                  </div>
                </Draggable>
              )}
            </div>
          );
        })}
      </Document>
    </div>
  );
};

export default PDFSigner;
