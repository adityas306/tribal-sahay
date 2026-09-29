import { useEffect, useState } from "react";

import API from "../api/api";
import Empty from "../components/Empty";

function Documents() {
  const [documents, setDocuments] =
    useState([]);

  const [uploading, setUploading] =
    useState(false);

  const loadDocuments = async () => {
    try {
      const response =
        await API.get("/api/documents");

      setDocuments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {
      await API.post(
        "/api/documents",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      await loadDocuments();

    } catch (error) {
      console.error(
        "Upload failed:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Document upload failed."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  return (
    <div className="page">

      <div className="pageTitle">

        <span className="eyebrow">
          DIGITAL DOCUMENT WALLET
        </span>

        <h1>
          My documents
        </h1>

        <p>
          Upload commonly required documents once
          for this prototype and track their
          verification state.
        </p>

      </div>

      {/* Upload */}
      <div className="upload">

        <div>
          <b>
            Upload a document
          </b>

          <span>
            PDF, JPG or PNG • Keep sensitive data secure.
          </span>
        </div>

        <label className="btn">
          {uploading
            ? "Uploading..."
            : "Choose file"}

          <input
            type="file"
            hidden
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

      </div>

      {/* Documents */}
      <section className="panel">

        {documents.length ? (
          documents.map((document) => (
            <div
              className="row"
              key={document.id}
            >
              <div>

                <b>
                  📄 {document.name}
                </b>

                <small>
                  {new Date(
                    document.uploaded_at
                  ).toLocaleString()}
                </small>

              </div>

              <span className="status">
                {document.status}
              </span>

            </div>
          ))
        ) : (
          <Empty
            text="Your document wallet is empty."
            link="/schemes"
            label="View required documents"
          />
        )}

      </section>
    </div>
  );
}

export default Documents;