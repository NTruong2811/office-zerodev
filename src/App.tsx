import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import ExcelViewer from './components/ExcelViewer';
import WordViewer from './components/WordViewer';
import StatusBar from './components/StatusBar';
import DropOverlay from './components/DropOverlay';
import UploadLanding from './components/UploadLanding';
import type { FileType, WordMode, SheetItem } from './types/office';
import {
  parseExcelFile,
  exportToXlsx,
  exportToCsv
} from './utils/excelUtils';
import {
  parseDocxToHtml,
  exportHtmlToDocx,
  exportHtmlToWordHtml
} from './utils/wordUtils';
import './App.css';

export default function App() {
  const [isFileOpened, setIsFileOpened] = useState<boolean>(false);
  const [fileType, setFileType] = useState<FileType>('excel');
  const [fileName, setFileName] = useState<string>('');
  const [wordMode, setWordMode] = useState<WordMode>('view');
  const [sheets, setSheets] = useState<SheetItem[]>([]);
  const [wordHtml, setWordHtml] = useState<string>('');
  const [docxBuffer, setDocxBuffer] = useState<ArrayBuffer | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileVersion, setFileVersion] = useState<number>(0);

  const handleOpenFile = useCallback(async (file: File) => {
    setIsDragging(false);
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    setLoading(true);

    try {
      if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
        const parsedSheets = await parseExcelFile(file);
        setSheets(parsedSheets);
        setFileType('excel');
        setFileName(file.name);
        setFileVersion((v) => v + 1);
        setIsFileOpened(true);
      } else if (ext === '.docx' || ext === '.doc') {
        const buffer = await file.arrayBuffer();
        setDocxBuffer(buffer);
        const html = await parseDocxToHtml(buffer);
        setWordHtml(html);
        setFileType('word');
        setFileName(file.name);
        setWordMode('view');
        setIsFileOpened(true);
      } else {
        alert('Định dạng tệp không được hỗ trợ. Vui lòng chọn .xlsx, .xls, .csv, hoặc .docx');
      }
    } catch {
      alert('Không thể mở tệp. Vui lòng kiểm tra lại định dạng file!');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewExcel = useCallback(() => {
    setIsDragging(false);
    setSheets([
      {
        name: 'Sheet1',
        order: 0,
        status: 1,
        celldata: []
      }
    ]);
    setFileType('excel');
    setFileName('Bang_tinh_moi.xlsx');
    setIsFileOpened(true);
  }, []);

  const handleNewWord = useCallback(() => {
    setIsDragging(false);
    setWordHtml(`
      <h1 style="text-align: center; color: #1e3a8a;">TIÊU ĐỀ TÀI LIỆU MỚI</h1>
      <p style="text-align: center; color: #64748b; font-style: italic;">Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</p>
      <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
      <p>Bắt đầu nhập nội dung tài liệu tại đây...</p>
    `);
    setDocxBuffer(null);
    setFileType('word');
    setFileName('Tai_lieu_moi.docx');
    setWordMode('edit');
    setIsFileOpened(true);
  }, []);

  const handleCloseFile = useCallback(() => {
    setIsDragging(false);
    setIsFileOpened(false);
    setSheets([]);
    setWordHtml('');
    setDocxBuffer(null);
    setFileName('');
  }, []);

  const handleExportXlsx = useCallback(() => {
    exportToXlsx(sheets, fileName || 'Bang_tinh.xlsx');
  }, [sheets, fileName]);

  const handleExportCsv = useCallback(() => {
    exportToCsv(sheets, fileName || 'Bang_tinh.csv');
  }, [sheets, fileName]);

  const handleExportDocx = useCallback(() => {
    exportHtmlToDocx(wordHtml, fileName || 'Tai_lieu.docx');
  }, [wordHtml, fileName]);

  const handleExportDocHtml = useCallback(() => {
    exportHtmlToWordHtml(wordHtml, fileName || 'Tai_lieu.doc');
  }, [wordHtml, fileName]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (!isFileOpened) {
      setIsDragging(false);
      return;
    }

    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleOpenFile(files[0]);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [isFileOpened, handleOpenFile]);

  const { wordCount, charCount } = useMemo(() => {
    const text = wordHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return { wordCount: 0, charCount: 0 };
    return {
      wordCount: text.split(' ').filter(Boolean).length,
      charCount: text.length
    };
  }, [wordHtml]);

  if (!isFileOpened) {
    return (
      <div className="app-container">
        <UploadLanding
          onFileSelect={handleOpenFile}
          onNewExcel={handleNewExcel}
          onNewWord={handleNewWord}
        />
        {loading && (
          <div className="loading-spinner-overlay">
            <div className="loading-card">
              <div className="spinner" />
              <p>Đang tải và xử lý tệp tin...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        fileName={fileName}
        fileType={fileType}
        wordMode={wordMode}
        onFileNameChange={setFileName}
        onWordModeChange={setWordMode}
        onOpenFile={handleOpenFile}
        onNewExcel={handleNewExcel}
        onNewWord={handleNewWord}
        onCloseFile={handleCloseFile}
        onExportXlsx={handleExportXlsx}
        onExportCsv={handleExportCsv}
        onExportDocx={handleExportDocx}
        onExportDocHtml={handleExportDocHtml}
        onPrint={handlePrint}
      />

      <main className="app-main-content">
        {fileType === 'excel' ? (
          <ExcelViewer
            sheets={sheets}
            onChange={setSheets}
            fileName={fileName}
            fileVersion={fileVersion}
          />
        ) : (
          <WordViewer
            htmlContent={wordHtml}
            docxBuffer={docxBuffer}
            mode={wordMode}
            onContentChange={setWordHtml}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        )}
      </main>

      <StatusBar
        fileType={fileType}
        wordMode={wordMode}
        sheetCount={sheets.length}
        wordCount={wordCount}
        charCount={charCount}
        zoom={zoom}
      />

      <DropOverlay
        isDragging={isDragging}
        onDropFile={handleOpenFile}
        onDismiss={() => setIsDragging(false)}
      />

      {loading && (
        <div className="loading-spinner-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <p>Đang tải và xử lý tệp tin...</p>
          </div>
        </div>
      )}
    </div>
  );
}
