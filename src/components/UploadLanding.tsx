import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  FileSpreadsheet,
  FileText,
  UploadCloud,
  FileUp,
  Plus,
  GitCompare,
  ArrowRight
} from 'lucide-react';

import type { FileType } from '../types/office';

interface UploadLandingProps {
  onFileSelect: (file: File) => void;
  onNewExcel: () => void;
  onNewWord: () => void;
  onOpenCompare: () => void;
  onCompareFiles?: (fileA: File, fileB: File, type: FileType) => void;
}

export default function UploadLanding({
  onFileSelect,
  onNewExcel,
  onNewWord,
  onOpenCompare,
  onCompareFiles
}: UploadLandingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHoveringDrop(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsHoveringDrop(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHoveringDrop(false);

    const files = e.dataTransfer.files;
    if (files && files.length >= 2 && onCompareFiles) {
      const ext0 = files[0].name.substring(files[0].name.lastIndexOf('.')).toLowerCase();
      const ext1 = files[1].name.substring(files[1].name.lastIndexOf('.')).toLowerCase();
      const isEx0 = ext0 === '.xlsx' || ext0 === '.xls' || ext0 === '.csv';
      const isEx1 = ext1 === '.xlsx' || ext1 === '.xls' || ext1 === '.csv';
      const isW0 = ext0 === '.docx' || ext0 === '.doc';
      const isW1 = ext1 === '.docx' || ext1 === '.doc';

      if (isEx0 && isEx1) {
        onCompareFiles(files[0], files[1], 'excel');
        return;
      }
      if (isW0 && isW1) {
        onCompareFiles(files[0], files[1], 'word');
        return;
      }
    }

    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className="landing-root"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-brand-icons">
            <span className="brand-dot green" />
            <span className="brand-dot blue" />
          </div>
          <span className="landing-brand-name">office-zerodev</span>
        </div>

        <button
          type="button"
          className="landing-header-compare-btn"
          onClick={onOpenCompare}
        >
          <GitCompare size={15} />
          <span>So Sánh 2 File</span>
        </button>
      </header>

      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="landing-title">
            Xem và Chỉnh Sửa <span className="highlight-excel">Excel</span> & <span className="highlight-word">Word</span> Trực Tuyến
          </h1>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".xlsx,.xls,.csv,.docx,.doc"
          onChange={handleFileInputChange}
        />

        <div
          className={`landing-dropzone ${isHoveringDrop ? 'active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon-box">
            <UploadCloud size={44} className="dropzone-cloud-icon" />
          </div>
          <h2 className="dropzone-heading">Kéo thả tệp Word hoặc Excel vào đây</h2>
          <p className="dropzone-sub">hoặc nhấn để chọn tệp từ máy tính của bạn</p>

          <button
            type="button"
            className="dropzone-browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileUp size={16} />
            <span>Chọn Tệp Từ Thiết Bị</span>
          </button>

          <div className="supported-formats">
            <div className="format-tag excel">
              <FileSpreadsheet size={15} />
              <span>Excel (.xlsx, .xls, .csv)</span>
            </div>
            <div className="format-tag word">
              <FileText size={15} />
              <span>Word (.docx, .doc)</span>
            </div>
          </div>
        </div>

        <div className="blank-options-section">
          <span className="section-label">Hoặc bắt đầu với trang trắng mới:</span>
          <div className="blank-cards-grid">
            <button
              type="button"
              className="blank-card excel-blank"
              onClick={onNewExcel}
            >
              <div className="blank-icon-wrap excel">
                <FileSpreadsheet size={22} />
              </div>
              <div className="blank-info">
                <span className="blank-title">Bảng Tính Excel Trống</span>
                <span className="blank-desc">Tạo bảng tính mới dạng .xlsx</span>
              </div>
              <Plus size={18} className="blank-plus" />
            </button>

            <button
              type="button"
              className="blank-card word-blank"
              onClick={onNewWord}
            >
              <div className="blank-icon-wrap word">
                <FileText size={22} />
              </div>
              <div className="blank-info">
                <span className="blank-title">Tài Liệu Word Trống</span>
                <span className="blank-desc">Tạo văn bản mới dạng .docx</span>
              </div>
              <Plus size={18} className="blank-plus" />
            </button>
          </div>

          <button
            type="button"
            className="landing-compare-card"
            onClick={onOpenCompare}
          >
            <div className="blank-icon-wrap compare">
              <GitCompare size={22} />
            </div>
            <div className="blank-info">
              <span className="blank-title">So Sánh Sự Khác Biệt Giữa 2 File</span>
              <span className="blank-desc">
                Tự động highlight các vị trí khác nhau, liệt kê danh sách và click để nhảy đến ô/văn bản thay đổi
              </span>
            </div>
            <ArrowRight size={18} className="blank-plus" />
          </button>
        </div>
      </main>
    </div>
  );
}
