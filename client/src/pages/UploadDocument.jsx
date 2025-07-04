// src/pages/UploadDocument.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { FaFilePdf, FaUpload } from 'react-icons/fa';

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Only PDF files are allowed');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Only PDF files are allowed');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select a PDF to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      await axios.post(`${import.meta.env.VITE_API_URL}/documents/upload`
, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      toast.success('File uploaded successfully!');
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Upload PDF Document</h2>

        <label className="cursor-pointer block w-full py-4 px-6 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
          <FaUpload className="mx-auto mb-2 text-3xl text-cyan-500" />
          <span className="text-zinc-700 dark:text-zinc-300">
            Drag & drop or click to select a PDF file
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {selectedFile && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
            <FaFilePdf className="text-xl" />
            <span>{selectedFile.name}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          className="mt-6 w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700 transition"
        >
          Upload Document
        </button>
      </div>
    </div>
  );
};

export default UploadDocument;
