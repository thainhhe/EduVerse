import { deleteFile, getDownloadUrl } from "@/services/minio";
import { FileText, Video, Download, Trash2, Calendar, HardDrive } from "lucide-react";
import "./FileList.css";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";

const FileList = ({ files, onFileClick, onFileDeleted, canDelete = true, canUpdate = true }) => {
    const handleDelete = async (e, fileId) => {
        e.stopPropagation();

        try {
            await deleteFile(fileId);
            if (onFileDeleted) {
                onFileDeleted(fileId);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete file");
        }
    };

    const handleDownload = (e, fileId) => {
        e.stopPropagation();
        window.open(getDownloadUrl(fileId), "_blank");
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (files.length === 0) {
        return (
            <div className="empty-state">
                <p>No files uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="file-grid">
            {files.map((file) => (
                <div
                    key={file._id}
                    className={`file-card ${
                        file.fileType === "video" || file.fileType === "document" ? "clickable" : ""
                    }`}
                    onClick={() => {
                        if (file.fileType === "video" || file.fileType === "document") {
                            onFileClick && onFileClick(file);
                        }
                    }}
                >
                    <div className="file-icon">
                        {file.fileType === "video" ? <Video size={40} /> : <FileText size={40} />}
                    </div>

                    <div className="file-info">
                        <h3 className="file-name">{file.originalName}</h3>

                        <div className="file-meta">
                            <span className="meta-item">
                                <HardDrive size={14} />
                                {formatFileSize(file.size)}
                            </span>
                            <span className="meta-item">
                                <Calendar size={14} />
                                {formatDate(file.uploadDate)}
                            </span>
                        </div>
                    </div>

                    <div className="file-actions">
                        <button
                            className="action-btn download-btn"
                            onClick={(e) => handleDownload(e, file._id)}
                            title="Download"
                        >
                            <Download size={18} />
                        </button>
                        {canDelete && canUpdate && (
                            <ConfirmationHelper
                                trigger={
                                    <button
                                        className="action-btn delete-btn"
                                        title="Delete"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                }
                                onConfirm={(e) => handleDelete(e, file._id)}
                                title="Delete File"
                                description="Are you sure you want to delete this file?"
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FileList;
