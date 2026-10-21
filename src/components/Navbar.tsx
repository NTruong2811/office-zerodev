import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
  Plus,
  Eye,
  Edit3,
  Printer,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import type { FileType, WordMode } from '../types/office';

interface NavbarProps {
  fileName: string;
  fileType: FileType;
  wordMode: WordMode;
  onFileNameChange: (name: string) => void;
  onWordModeChange: (mode: WordMode) => void;
  onOpenFile: (file: File) => void;
  onNewExcel: () => void;
  onNewWord: () => void;
  onCloseFile: () => void;
  onExportXlsx: () => void;
  onExportCsv: () => void;
  onExportDocx: () => void;
  onExportDocHtml: () => void;
  onPrint: () => void;
}

export default function Navbar({
  fileName,
  fileType,
  wordMode,
  onFileNameChange,
  onWordModeChange,
  onOpenFile,
  onNewExcel,
  onNewWord,
  onCloseFile,
  onExportXlsx,
  onExportCsv,
  onExportDocx,
  onExportDocHtml,
  onPrint
}: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
    }
    e.target.value = '';
  };

  return (
    <header className="navbar-root">
      <div className="navbar-left">
        <button
          type="button"
          className="back-home-btn"
          onClick={onCloseFile}
          title="Quay lại màn hình kéo thả file"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="app-brand">
          <div className="brand-icon">
            {fileType === 'excel' ? (
              <FileSpreadsheet className="text-green" size={20} />
            ) : (
              <FileText className="text-blue" size={20} />
            )}
          </div>
          <div className="brand-text">
            <span className="brand-title">office-zerodev</span>
          </div>
        </div>

        <div className="navbar-divider" />

        <div className="file-info-group">
          <input
            type="text"
            className="file-name-input"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            title="Nhấn để đổi tên file"
          />
          <span className={`file-type-badge ${fileType}`}>
            {fileType === 'excel' ? 'EXCEL' : 'WORD'}
          </span>
        </div>
      </div>

      <div className="navbar-center">
        {fileType === 'word' && (
          <div className="mode-toggle-pill">
            <button
              type="button"
              className={`mode-toggle-btn ${wordMode === 'view' ? 'active' : ''}`}
              onClick={() => onWordModeChange('view')}
            >
              <Eye size={15} />
              <span>Xem Bố Cục</span>
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${wordMode === 'edit' ? 'active' : ''}`}
              onClick={() => onWordModeChange('edit')}
            >
              <Edit3 size={15} />
              <span>Soạn Thảo</span>
            </button>
          </div>
        )}
      </div>

      <div className="navbar-right">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".xlsx,.xls,.csv,.docx,.doc"
          onChange={handleFileChange}
        />

        <button
          type="button"
          className="nav-action-btn primary-open"
          onClick={() => fileInputRef.current?.click()}
          title="Mở file từ máy tính (.xlsx, .xls, .csv, .docx)"
        >
          <Upload size={16} />
          <span>Mở File Khác</span>
        </button>

        <div className="dropdown-wrapper">
          <button
            type="button"
            className="nav-action-btn"
            onClick={() => {
              setShowNewMenu(!showNewMenu);
              setShowExportMenu(false);
            }}
          >
            <Plus size={16} />
            <span>Tạo Mới</span>
            <ChevronDown size={14} />
          </button>
          {showNewMenu && (
            <div className="dropdown-menu">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  onNewExcel();
                  setShowNewMenu(false);
                }}
              >
                <FileSpreadsheet size={16} className="text-green" />
                <span>Bảng tính Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  onNewWord();
                  setShowNewMenu(false);
                }}
              >
                <FileText size={16} className="text-blue" />
                <span>Tài liệu Word (.docx)</span>
              </button>
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            type="button"
            className="nav-action-btn primary-export"
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowNewMenu(false);
            }}
          >
            <Download size={16} />
            <span>Xuất File</span>
            <ChevronDown size={14} />
          </button>
          {showExportMenu && (
            <div className="dropdown-menu export-menu">
              {fileType === 'excel' ? (
                <>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      onExportXlsx();
                      setShowExportMenu(false);
                    }}
                  >
                    <FileSpreadsheet size={16} className="text-green" />
                    <div className="menu-text-wrap">
                      <span className="menu-main-title">Xuất file Excel (.xlsx)</span>
                      <span className="menu-sub-title">Đầy đủ công thức & định dạng</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      onExportCsv();
                      setShowExportMenu(false);
                    }}
                  >
                    <Download size={16} />
                    <div className="menu-text-wrap">
                      <span className="menu-main-title">Xuất CSV (.csv)</span>
                      <span className="menu-sub-title">Dữ liệu dạng bảng thuần</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      onExportDocx();
                      setShowExportMenu(false);
                    }}
                  >
                    <FileText size={16} className="text-blue" />
                    <div className="menu-text-wrap">
                      <span className="menu-main-title">Xuất file Word (.docx)</span>
                      <span className="menu-sub-title">Tương thích Microsoft Word</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      onExportDocHtml();
                      setShowExportMenu(false);
                    }}
                  >
                    <FileText size={16} />
                    <div className="menu-text-wrap">
                      <span className="menu-main-title">Xuất file Word (.doc)</span>
                      <span className="menu-sub-title">Bản tương thích HTML/Doc</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      onPrint();
                      setShowExportMenu(false);
                    }}
                  >
                    <Printer size={16} />
                    <div className="menu-text-wrap">
                      <span className="menu-main-title">In ấn / Lưu thành PDF</span>
                      <span className="menu-sub-title">Xuất qua hộp thoại Print</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
