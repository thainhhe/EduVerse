import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as mammoth from "mammoth";
import html2pdf from "html2pdf.js";
import axios from "axios";
import { Loader, Download, X } from "lucide-react";
import "./TiptapViewer.css";

const TiptapViewer = ({ fileUrl, fileName, mimeType, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
        editable: false,
    });

    useEffect(() => {
        const loadContent = async () => {
            if (!fileUrl) return;

            setLoading(true);
            setError(null);

            try {
                // 1. Fetch the file
                const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
                const data = response.data;

                let contentHtml = "";

                // 2. Determine type
                const isDocx =
                    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                    fileName.toLowerCase().endsWith(".docx");
                const isText = mimeType === "text/plain" || fileName.toLowerCase().endsWith(".txt");

                // 3. Convert
                if (isDocx) {
                    // Handle potential import variations for mammoth
                    const convertFn = mammoth.convertToHtml || mammoth.default?.convertToHtml;

                    if (!convertFn) {
                        throw new Error("Mammoth library not loaded correctly");
                    }

                    const result = await convertFn({ arrayBuffer: data });
                    contentHtml = result.value;
                } else if (isText) {
                    const decoder = new TextDecoder("utf-8");
                    const text = decoder.decode(data);
                    contentHtml = text
                        .split("\n")
                        .map((line) => `<p>${line || "&nbsp;"}</p>`)
                        .join("");
                } else {
                    // Try to treat as text for other formats
                    try {
                        const decoder = new TextDecoder("utf-8");
                        const text = decoder.decode(data);
                        contentHtml = text
                            .split("\n")
                            .map((line) => `<p>${line || "&nbsp;"}</p>`)
                            .join("");
                    } catch (e) {
                        console.error("Error converting file to text:", e);
                        throw new Error("Unsupported file type for Tiptap conversion");
                    }
                }

                if (editor) {
                    editor.commands.setContent(contentHtml);
                }
            } catch (err) {
                console.error("[TiptapViewer] Error:", err);
                setError(`Failed to load document: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [fileUrl, mimeType, fileName, editor]);

    const handleExportPdf = () => {
        const element = document.querySelector(".ProseMirror");
        if (!element) return;

        const opt = {
            margin: 1,
            filename: `${fileName}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };

        html2pdf().set(opt).from(element).save();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader className="spin" size={24} />
                <span>Loading document...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="tiptap-viewer-container">
            {/* <div className="tiptap-toolbar">
                <button onClick={handleExportPdf} className="tiptap-btn">
                    <Download size={18} />
                    Download as PDF
                </button>
            </div> */}
            <div className="tiptap-scroll-area">
                <div className="tiptap-paper">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
};

export default TiptapViewer;
