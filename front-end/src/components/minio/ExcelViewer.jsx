import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Loader, Download, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import "./ExcelViewer.css";

const ExcelViewer = ({ fileUrl, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    const loadFile = async () => {
      if (!fileUrl) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        const data = new Uint8Array(response.data);

        const wb = XLSX.read(data, { type: "array" });
        setWorkbook(wb);

        if (wb.SheetNames.length > 0) {
          const firstSheetName = wb.SheetNames[0];
          setActiveSheet(firstSheetName);
          const ws = wb.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          setSheetData(jsonData);
        }
      } catch (err) {
        console.error("Error loading Excel file:", err);
        setError("Failed to load Excel file");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileUrl]);

  const handleSheetChange = (sheetName) => {
    if (!workbook) return;
    setActiveSheet(sheetName);
    const ws = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
    setSheetData(jsonData);
  };

  const handleExportPdf = () => {
    const element = document.querySelector(".excel-paper");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `${fileName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spin" size={24} />
        <span>Loading spreadsheet...</span>
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
    <div className="excel-viewer-container">
      <div className="excel-toolbar">
        <div className="excel-sheets-tabs">
          {workbook?.SheetNames.map((name) => (
            <button
              key={name}
              className={`sheet-tab ${activeSheet === name ? "active" : ""}`}
              onClick={() => handleSheetChange(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="excel-actions">
          <button onClick={handleExportPdf} className="excel-btn">
            <Download size={18} />
            Export PDF
          </button>
          <button onClick={onClose} className="excel-btn excel-close-btn">
            <X size={18} />
            Close
          </button>
        </div>
      </div>

      <div className="excel-content-area">
        <div className="excel-paper">
          {sheetData.length > 0 ? (
            <table className="excel-table">
              <tbody>
                {sheetData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell !== null && cell !== undefined ? String(cell) : ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-sheet">No data in this sheet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;
