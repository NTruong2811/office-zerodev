import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  FileSpreadsheet,
  FileText,
  UploadCloud,
  FileUp,
  Plus,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface UploadLandingProps {
  onFileSelect: (file: File) => void;
  onNewExcel: () => void;
  onNewWord: () => void;
}

export default function UploadLanding({
  onFileSelect,
  onNewExcel,
  onNewWord
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
      </header>

      <main className="landing-main">
        <div className="landing-hero">
          <div className="landing-badge">
            <Zap size={14} className="text-amber" />
            <span>Hiệu năng cao &bull; Phản hồi tức thì</span>
          </div>
          <h1 className="landing-title">
            Xem và Chỉnh Sửa <span className="highlight-excel">Excel</span> & <span className="highlight-word">Word</span> Trực Tuyến
          </h1>
          <p className="landing-desc">
            Kéo thả tệp tin bất kỳ để bắt đầu. Hệ thống tự động phân loại và mở giao diện xử lý tối ưu nhất.
          </p>
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
        </div>

        <div className="landing-features">
          <div className="feature-item">
            <Cpu size={16} className="feature-icon" />
            <span>Canvas GPU 60 FPS</span>
          </div>
          <div className="feature-item">
            <Zap size={16} className="feature-icon" />
            <span>Mở tệp &lt; 300ms</span>
          </div>
          <div className="feature-item">
            <ShieldCheck size={16} className="feature-icon" />
            <span>100% Client-Side Bảo Mật</span>
          </div>
        </div>
      </main>
    </div>
  );
}
