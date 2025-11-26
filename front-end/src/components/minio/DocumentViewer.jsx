import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";

import TiptapViewer from "./TiptapViewer";
import ExcelViewer from "./ExcelViewer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { getDownloadUrl, getStreamUrl } from "@/services/minio";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentViewer = ({ file, onClose }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    const isPDF = file.mimeType === "application/pdf";

    // Check for Tiptap supported formats (Docx and Text)
    const isTiptapSupported =
        [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "text/plain", // .txt
        ].includes(file.mimeType) ||
        file.originalName.toLowerCase().endsWith(".docx") ||
        file.originalName.toLowerCase().endsWith(".txt");

    // Check for Excel supported formats
    const isExcelSupported =
        [
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        ].includes(file.mimeType) ||
        file.originalName.toLowerCase().endsWith(".xls") ||
        file.originalName.toLowerCase().endsWith(".xlsx");

    // Supported formats for Office Viewer (Fallback for others)
    const isOfficeSupported = [
        "application/msword", // .doc
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
        "application/rtf", // .rtf
    ].includes(file.mimeType);

    // Memoize file prop to prevent unnecessary reloads
    const fileConfig = useMemo(
        () => ({
            url: getStreamUrl(file._id),
            httpHeaders: {
                Accept: "application/pdf",
            },
            withCredentials: false,
        }),
        [file._id]
    );

    // Memoize options prop
    const pdfOptions = useMemo(
        () => ({
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
        }),
        []
    );

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const goToPrevPage = () => {
        setPageNumber((prev) => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setPageNumber((prev) => Math.min(numPages, prev + 1));
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(2.0, prev + 0.2));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(0.5, prev - 0.2));
    };

    const handleDownload = () => {
        window.open(getDownloadUrl(file._id), "_blank");
    };

    // Get Office Online Viewer URL (works better with localhost)
    const getOfficeViewerUrl = () => {
        const fileUrl = encodeURIComponent(getStreamUrl(file._id));
        return `https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`;
    };

    return (
        <div className="flex flex-col flex-1 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="">{file.originalName}</h2>
                <button className="text-red-500" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            {isPDF && (
                <div className="flex items-center justify-start gap-8">
                    <div className="flex items-center gap-2">
                        <button className="" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                            <ChevronLeft size={20} />
                        </button>
                        <span className="">
                            Page {pageNumber} of {numPages || "..."}
                        </span>
                        <button className="" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="" onClick={zoomOut}>
                            <ZoomOut size={20} />
                        </button>
                        <span className="">{Math.round(scale * 100)}%</span>
                        <button className="" onClick={zoomIn}>
                            <ZoomIn size={20} />
                        </button>
                    </div>

                    <button className="flex items-center gap-2" onClick={handleDownload}>
                        <Download size={20} />
                        Download
                    </button>
                </div>
            )}

            <div className="flex-1">
                {isPDF ? (
                    <Document
                        file={fileConfig}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div className="flex items-center justify-center">Loading PDF...</div>}
                        error={
                            <div className="flex items-center justify-center">
                                Failed to load PDF.
                                <button onClick={handleDownload} className="">
                                    Download instead
                                </button>
                            </div>
                        }
                        options={pdfOptions}
                        className="flex items-center justify-center"
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    </Document>
                ) : isTiptapSupported ? (
                    <TiptapViewer
                        fileUrl={getStreamUrl(file._id)}
                        fileName={file.originalName}
                        mimeType={file.mimeType}
                        onClose={onClose}
                    />
                ) : isExcelSupported ? (
                    <ExcelViewer
                        fileUrl={getStreamUrl(file._id)}
                        fileName={file.originalName}
                        onClose={onClose}
                    />
                ) : file.mimeType === "application/msword" ||
                  file.originalName.toLowerCase().endsWith(".doc") ? (
                    <div className="flex-1">
                        <p>
                            ⚠️ <strong>.doc format not supported</strong>
                        </p>
                        <p>
                            The Tiptap viewer only supports modern Word documents (<strong>.docx</strong>) and
                            text files.
                        </p>
                        <p>
                            Please save your file as <strong>.docx</strong> and upload again to view and
                            convert to PDF.
                        </p>
                        <button onClick={handleDownload} className="">
                            Download Original File
                        </button>
                    </div>
                ) : isOfficeSupported ? (
                    <div className="flex-1">
                        <iframe src={getOfficeViewerUrl()} className="" title={file.originalName} />
                        <div className="flex-1">
                            <p>
                                📝 <strong>Note:</strong> If the document doesn't load, it's because Office
                                Online Viewer requires a publicly accessible URL.
                            </p>
                            <p>
                                For localhost testing, you can download the file or use a tool like{" "}
                                <strong>ngrok</strong> to expose your MinIO server.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1">
                        <p>Preview not available for this file type.</p>
                        <button onClick={handleDownload} className="">
                            Download to view
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentViewer;
