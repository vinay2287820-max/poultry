import React, { useState } from "react";
import { Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

export default function FileUpload({ onFileSelect }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    if (onFileSelect) {
      onFileSelect(droppedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Drag & Drop Zone */}
      <div
        className="w-full max-w-md h-40 border-2 border-dashed border-gray-400 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 transition"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <CloudUpload className="text-gray-400 mb-2" fontSize="large" />
        <p className="text-sm">Drag & drop your file here or click to browse</p>
        <input
          type="file"
          className="hidden"
          id="fileInput"
          onChange={handleFileChange}
        />
      </div>

      {/* Button Upload */}
      <label htmlFor="fileInput" className="mt-4">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUpload />}
          className="rounded-2xl"
        >
          Upload File
        </Button>
      </label>

      {/* Show Selected File */}
      {file && (
        <p className="mt-3 text-sm text-gray-700">
          Selected: <span className="font-semibold">{file.name}</span>
        </p>
      )}
    </div>
  );
}
