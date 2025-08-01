import { useState } from "react";
import axios from "axios";
import { GetJWT, SetJWT } from "../config/configureJWT";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      setUploading(true);
      const jwtToken = GetJWT();
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v3/convert/excel-upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${jwtToken}`,
          "Cache-Control": "no-cache"
        },
      });
      alert("File uploaded successfully!");
      SetJWT(response.headers.authorization);
      setFile(null);
      setUploading(false);

      // Clear the file input field
      document.getElementById("fileInput").value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-111px)] min-w-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <h1 className="text-xl font-semibold mb-7 text-center">Upload Edge OTN Excel File</h1>

        {/* File Upload */}
        <div
          className="border-dashed border-2 border-gray-300 rounded-lg px-6 py-20 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer"
          onClick={() => document.getElementById("fileInput").click()}
        >
          {file ? (
            <p className="text-gray-600">{file.name}</p>
          ) : (
            <>
              <p className="text-blue-500 font-medium">Drag files here</p>
              <p className="text-gray-500">or click to browse files</p>
            </>
          )}
          <input
            id="fileInput"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => {
              setFile(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-200 rounded-lg hover:bg-yellow-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
              uploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
