import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Video } from "lucide-react";
import { uploadDocument, uploadVideo } from "@/services/minio";
import "./UploadZone.css";

const UploadZone = ({ onUploadSuccess, data, type = "document" }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadType, setUploadType] = useState(type);

    useEffect(() => {
        setUploadType(type);
    }, [type]);

    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];
            setUploading(true);
            setProgress(0);

            try {
                const uploadFn = uploadType === "document" ? uploadDocument : uploadVideo;
                const response = await uploadFn(file, data, (percent) => {
                    setProgress(percent);
                });

                if (onUploadSuccess) {
                    onUploadSuccess(response.data.file);
                }

                setProgress(100);
                setTimeout(() => {
                    setUploading(false);
                    setProgress(0);
                }, 1000);
            } catch (error) {
                console.error("Upload error:", error);
                alert("Upload failed: " + (error.response?.data?.error || error.message));
                setUploading(false);
                setProgress(0);
            }
        },
        [uploadType, onUploadSuccess, data]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept:
            uploadType === "document"
                ? {
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                      "text/plain": [".txt"],
                      "application/vnd.ms-excel": [".xls"],
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                  }
                : {
                      "video/mp4": [".mp4"],
                      "video/avi": [".avi"],
                      "video/quicktime": [".mov"],
                      "video/x-msvideo": [".avi"],
                  },
    });

    return (
        <div className="upload-zone-container">
            <div className="upload-type-selector">
                <button
                    className={`type-btn ${uploadType === "document" ? "active" : ""}`}
                    onClick={() => setUploadType("document")}
                >
                    <FileText size={20} />
                    Documents
                </button>
                <button
                    className={`type-btn ${uploadType === "video" ? "active" : ""}`}
                    onClick={() => setUploadType("video")}
                >
                    <Video size={20} />
                    Videos
                </button>
            </div>

            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? "drag-active" : ""} ${uploading ? "uploading" : ""}`}
            >
                <input {...getInputProps()} />
                <Upload size={48} className="upload-icon" />
                {uploading ? (
                    <div className="upload-progress">
                        <p>Uploading... {progress}%</p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="upload-text">
                        <p className="primary-text">
                            {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
                        </p>
                        <p className="secondary-text">
                            {uploadType === "document"
                                ? "Supported: PDF, DOC, DOCX, TXT, XLS, XLSX"
                                : "Supported: MP4, AVI, MOV"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadZone;
