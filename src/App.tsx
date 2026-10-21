import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import ExcelViewer from './components/ExcelViewer';
import type { ExcelViewerRef } from './components/ExcelViewer';
import WordViewer from './components/WordViewer';
import StatusBar from './components/StatusBar';
import DropOverlay from './components/DropOverlay';
import UploadLanding from './components/UploadLanding';
import DiffSidebar from './components/DiffSidebar';
import CompareModal from './components/CompareModal';
import type { FileType, WordMode, SheetItem, DiffItem } from './types/office';
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
import { compareExcelSheets } from './utils/excelDiffUtils';
import { compareWordDocs } from './utils/wordDiffUtils';
import UrlOpenModal from './components/UrlOpenModal';
import { extractUrlFromLocation, fetchRemoteFile } from './utils/remoteFileUtils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
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

  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [diffList, setDiffList] = useState<DiffItem[]>([]);
  const [activeDiffId, setActiveDiffId] = useState<string | null>(null);
  const [showDiffSidebar, setShowDiffSidebar] = useState<boolean>(true);
  const [selectedSheetFilter, setSelectedSheetFilter] = useState<string>('all');
  const [compareFileA, setCompareFileA] = useState<{ name: string } | null>(null);
  const [compareFileB, setCompareFileB] = useState<{ name: string } | null>(null);

  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [isIframeView, setIsIframeView] = useState<boolean>(false);
  const [remoteUrl, setRemoteUrl] = useState<string>('');
  const [remoteLoadError, setRemoteLoadError] = useState<string | null>(null);

  const excelViewerRef = useRef<ExcelViewerRef>(null);

  const handleOpenFile = useCallback(async (file: File) => {
    setIsDragging(false);
    setIsCompareMode(false);
    setDiffList([]);
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

  const handleOpenRemoteUrl = useCallback(
    async (url: string, asIframe = false) => {
      setLoading(true);
      setRemoteLoadError(null);
      setRemoteUrl(url);
      if (asIframe) {
        setIsIframeView(true);
      }

      try {
        const file = await fetchRemoteFile(url);
        await handleOpenFile(file);
      } catch (err: any) {
        setRemoteLoadError(
          err?.message || 'Không thể tải tệp tin từ đường dẫn được cung cấp. Vui lòng kiểm tra lại URL.'
        );
      } finally {
        setLoading(false);
      }
    },
    [handleOpenFile]
  );

  useEffect(() => {
    let inIframe = false;
    try {
      if (window.self !== window.top) {
        inIframe = true;
      }
    } catch {
      inIframe = true;
    }

    const config = extractUrlFromLocation();
    if (config && config.url) {
      handleOpenRemoteUrl(config.url, config.isIframe || inIframe);
    } else if (inIframe) {
      setIsIframeView(true);
    }
  }, [handleOpenRemoteUrl]);

  const handleStartCompare = useCallback(
    async (fileA: File, fileB: File, type: FileType) => {
      setLoading(true);
      setCompareFileA({ name: fileA.name });
      setCompareFileB({ name: fileB.name });
      setFileType(type);
      setFileName(`${fileA.name} ⟷ ${fileB.name}`);

      try {
        if (type === 'excel') {
          const parsedA = await parseExcelFile(fileA);
          const parsedB = await parseExcelFile(fileB);
          const { diffSheets, diffList: calculatedDiffs } = compareExcelSheets(
            parsedA,
            parsedB
          );

          setSheets(diffSheets);
          setDiffList(calculatedDiffs);
          setIsCompareMode(true);
          setShowDiffSidebar(true);
          setSelectedSheetFilter('all');
          setFileVersion((v) => v + 1);
          setIsFileOpened(true);
        } else {
          const htmlA = await parseDocxToHtml(fileA);
          const htmlB = await parseDocxToHtml(fileB);
          const { diffHtml, diffList: calculatedDiffs } = compareWordDocs(
            htmlA,
            htmlB
          );

          setWordHtml(diffHtml);
          setDocxBuffer(null);
          setDiffList(calculatedDiffs);
          setWordMode('view');
          setIsCompareMode(true);
          setShowDiffSidebar(true);
          setIsFileOpened(true);
        }
      } catch {
        alert('Có lỗi xảy ra khi so sánh 2 tệp. Vui lòng kiểm tra lại định dạng!');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleJumpToDiff = useCallback(
    (item: DiffItem) => {
      setActiveDiffId(item.id);

      if (fileType === 'excel') {
        excelViewerRef.current?.jumpToCell(
          item.row !== undefined ? item.row : 0,
          item.col !== undefined ? item.col : 0,
          item.sheetIndex,
          item.sheetName
        );
      } else {
        const el =
          document.getElementById(item.id) ||
          document.getElementById(`${item.id}-del`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('diff-pulse-active');
          setTimeout(() => el.classList.remove('diff-pulse-active'), 2000);
        }
      }
    },
    [fileType]
  );

  const handleExitCompareMode = useCallback(() => {
    setIsCompareMode(false);
    setDiffList([]);
    setActiveDiffId(null);
  }, []);

  const handleNewExcel = useCallback(() => {
    setIsDragging(false);
    setIsCompareMode(false);
    setDiffList([]);
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
    setIsCompareMode(false);
    setDiffList([]);
    setWordHtml(`
      <h1 style="text-align: center; color: #1e3a8a;">TIÊU ĐỀ TÀI LIỆU MỚI</h1>
      <p style="text-align: center; color: #64748b; font-style: italic;">Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</p>
      <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
      <p>Bắt đầu nhập nội dung văn bản của bạn tại đây...</p>
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
    setIsCompareMode(false);
    setDiffList([]);
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
      if (files && files.length >= 2) {
        const ext0 = files[0].name.substring(files[0].name.lastIndexOf('.')).toLowerCase();
        const ext1 = files[1].name.substring(files[1].name.lastIndexOf('.')).toLowerCase();
        const isEx0 = ext0 === '.xlsx' || ext0 === '.xls' || ext0 === '.csv';
        const isEx1 = ext1 === '.xlsx' || ext1 === '.xls' || ext1 === '.csv';
        const isW0 = ext0 === '.docx' || ext0 === '.doc';
        const isW1 = ext1 === '.docx' || ext1 === '.doc';

        if (isEx0 && isEx1) {
          handleStartCompare(files[0], files[1], 'excel');
          return;
        }
        if (isW0 && isW1) {
          handleStartCompare(files[0], files[1], 'word');
          return;
        }
      }

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
  }, [isFileOpened, handleOpenFile, handleStartCompare]);

  const { wordCount, charCount } = useMemo(() => {
    const text = wordHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return { wordCount: 0, charCount: 0 };
    return {
      wordCount: text.split(' ').filter(Boolean).length,
      charCount: text.length
    };
  }, [wordHtml]);

  if (remoteLoadError && !isFileOpened) {
    return (
      <div className="app-container">
        <div className="remote-error-screen">
          <div className="remote-error-card">
            <div className="remote-error-icon">
              <AlertTriangle size={36} />
            </div>
            <h2 className="remote-error-title">Không Thể Tải Tệp Tin</h2>
            <p className="remote-error-desc">
              Không thể tải tệp từ đường dẫn trực tuyến:
            </p>
            <div className="remote-error-url-box">
              <code>{remoteUrl}</code>
            </div>
            <p className="remote-error-detail">{remoteLoadError}</p>
            <div className="remote-error-actions">
              <button
                type="button"
                className="remote-retry-btn"
                onClick={() => handleOpenRemoteUrl(remoteUrl, isIframeView)}
              >
                <RefreshCw size={15} />
                <span>Thử Lại</span>
              </button>
              {!isIframeView && (
                <button
                  type="button"
                  className="remote-home-btn"
                  onClick={() => {
                    setRemoteLoadError(null);
                    setRemoteUrl('');
                    window.history.replaceState({}, '', '/');
                  }}
                >
                  <span>Về Trang Chủ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isFileOpened) {
    return (
      <div className="app-container">
        <UploadLanding
          onFileSelect={handleOpenFile}
          onNewExcel={handleNewExcel}
          onNewWord={handleNewWord}
          onOpenCompare={() => setIsCompareModalOpen(true)}
          onOpenUrlModal={() => setIsUrlModalOpen(true)}
          onCompareFiles={handleStartCompare}
        />
        <CompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          onStartCompare={handleStartCompare}
        />
        <UrlOpenModal
          isOpen={isUrlModalOpen}
          onClose={() => setIsUrlModalOpen(false)}
          onSubmitUrl={(url) => handleOpenRemoteUrl(url, false)}
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
    <div className={`app-container ${isIframeView ? 'is-iframe-view' : ''}`}>
      {!isIframeView && (
        <Navbar
          fileName={fileName}
          fileType={fileType}
          wordMode={wordMode}
          isCompareMode={isCompareMode}
          diffCount={diffList.length}
          showDiffSidebar={showDiffSidebar}
          isIframe={isIframeView}
          onOpenInNewTab={() => window.open(window.location.href, '_blank')}
          onFileNameChange={setFileName}
          onWordModeChange={setWordMode}
          onOpenFile={handleOpenFile}
          onNewExcel={handleNewExcel}
          onNewWord={handleNewWord}
          onCloseFile={handleCloseFile}
          onOpenCompareModal={() => setIsCompareModalOpen(true)}
          onExitCompareMode={handleExitCompareMode}
          onToggleDiffSidebar={() => setShowDiffSidebar((v) => !v)}
          onExportXlsx={handleExportXlsx}
          onExportCsv={handleExportCsv}
          onExportDocx={handleExportDocx}
          onExportDocHtml={handleExportDocHtml}
          onPrint={handlePrint}
        />
      )}

      <main className={`app-main-content ${isCompareMode && showDiffSidebar ? 'with-sidebar' : ''} ${isIframeView ? 'iframe-main' : ''}`}>
        <div className="workspace-viewer-area">
          {fileType === 'excel' ? (
            <ExcelViewer
              ref={excelViewerRef}
              sheets={sheets}
              onChange={setSheets}
              fileName={fileName}
              fileVersion={fileVersion}
              isIframe={isIframeView}
            />
          ) : (
            <WordViewer
              htmlContent={wordHtml}
              docxBuffer={docxBuffer}
              mode={isIframeView ? 'view' : wordMode}
              onContentChange={setWordHtml}
              zoom={zoom}
              onZoomChange={setZoom}
              isIframe={isIframeView}
            />
          )}
        </div>

        {isCompareMode && showDiffSidebar && (
          <DiffSidebar
            diffList={diffList}
            activeDiffId={activeDiffId}
            onJumpToDiff={handleJumpToDiff}
            onClose={() => setShowDiffSidebar(false)}
            fileAName={compareFileA?.name || 'File A'}
            fileBName={compareFileB?.name || 'File B'}
            sheetNames={fileType === 'excel' ? sheets.map((s) => s.name) : undefined}
            selectedSheetFilter={selectedSheetFilter}
            onSelectSheetFilter={setSelectedSheetFilter}
          />
        )}
      </main>

      {!isIframeView && (
        <StatusBar
          fileType={fileType}
          wordMode={wordMode}
          sheetCount={sheets.length}
          wordCount={wordCount}
          charCount={charCount}
          zoom={zoom}
        />
      )}

      <DropOverlay
        isDragging={isDragging}
        onDropFile={handleOpenFile}
        onDismiss={() => setIsDragging(false)}
      />

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onStartCompare={handleStartCompare}
      />

      {loading && (
        <div className="loading-spinner-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <p>Đang tải và so sánh tệp tin...</p>
          </div>
        </div>
      )}
    </div>
  );
}
