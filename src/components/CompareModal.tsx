import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  X,
  GitCompare,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import type { FileType } from '../types/office';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCompare: (fileA: File, fileB: File, type: FileType) => void;
}

export default function CompareModal({
  isOpen,
  onClose,
  onStartCompare
}: CompareModalProps) {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getFileType = (file: File): FileType | null => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') return 'excel';
    if (ext === '.docx' || ext === '.doc') return 'word';
    return null;
  };

  const handleSelectA = (file: File) => {
    setError(null);
    const typeA = getFileType(file);
    if (!typeA) {
      setError('Định dạng tệp A không được hỗ trợ (.xlsx, .xls, .csv, .docx, .doc)');
      return;
    }
    if (fileB) {
      const typeB = getFileType(fileB);
      if (typeA !== typeB) {
        setError('Hai tệp phải cùng loại (cùng là Excel hoặc cùng là Word)');
        return;
      }
    }
    setFileA(file);
  };

  const handleSelectB = (file: File) => {
    setError(null);
    const typeB = getFileType(file);
    if (!typeB) {
      setError('Định dạng tệp B không được hỗ trợ (.xlsx, .xls, .csv, .docx, .doc)');
      return;
    }
    if (fileA) {
      const typeA = getFileType(fileA);
      if (typeA !== typeB) {
        setError('Hai tệp phải cùng loại (cùng là Excel hoặc cùng là Word)');
        return;
      }
    }
    setFileB(file);
  };

  const handleStart = () => {
    if (!fileA || !fileB) {
      setError('Vui lòng chọn đầy đủ cả 2 tệp tin để so sánh');
      return;
    }
    const typeA = getFileType(fileA);
    const typeB = getFileType(fileB);
    if (typeA !== typeB || !typeA) {
      setError('Hai tệp phải cùng loại (cùng là Excel hoặc cùng là Word)');
      return;
    }
    onStartCompare(fileA, fileB, typeA);
    onClose();
  };

  return (
    <div className="compare-modal-backdrop" onClick={onClose}>
      <div className="compare-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-header">
          <div className="compare-modal-title-group">
            <div className="compare-icon-wrap">
              <GitCompare size={20} />
            </div>
            <div>
              <h2 className="compare-modal-title">So Sánh Sự Khác Biệt Giữa 2 Tệp</h2>
              <p className="compare-modal-desc">
                Hệ thống tự động phát hiện các ô/văn bản thay đổi, thêm mới và xóa bỏ.
              </p>
            </div>
          </div>
          <button type="button" className="compare-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="compare-error-alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="compare-dropzone-grid">
          <div
            className={`compare-file-box ${fileA ? 'has-file' : ''}`}
            onClick={() => inputARef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleSelectA(f);
            }}
          >
            <input
              type="file"
              ref={inputARef}
              style={{ display: 'none' }}
              accept=".xlsx,.xls,.csv,.docx,.doc"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) handleSelectA(f);
                e.target.value = '';
              }}
            />
            <span className="file-box-badge badge-a">TỆP GỐC (BẢN CŨ - FILE A)</span>
            <div className="file-box-icon">
              {fileA ? (
                getFileType(fileA) === 'excel' ? (
                  <FileSpreadsheet size={32} className="text-green" />
                ) : (
                  <FileText size={32} className="text-blue" />
                )
              ) : (
                <UploadCloud size={32} className="text-muted" />
              )}
            </div>
            {fileA ? (
              <div className="file-box-info">
                <span className="file-box-name">{fileA.name}</span>
                <span className="file-box-size">{(fileA.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="file-box-prompt">
                <span>Nhấn hoặc kéo thả Tệp A vào đây</span>
              </div>
            )}
          </div>

          <div className="compare-arrow-divider">
            <ArrowRight size={22} className="text-muted" />
          </div>

          <div
            className={`compare-file-box ${fileB ? 'has-file' : ''}`}
            onClick={() => inputBRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleSelectB(f);
            }}
          >
            <input
              type="file"
              ref={inputBRef}
              style={{ display: 'none' }}
              accept=".xlsx,.xls,.csv,.docx,.doc"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) handleSelectB(f);
                e.target.value = '';
              }}
            />
            <span className="file-box-badge badge-b">TỆP MỚI (BẢN CẬP NHẬT - FILE B)</span>
            <div className="file-box-icon">
              {fileB ? (
                getFileType(fileB) === 'excel' ? (
                  <FileSpreadsheet size={32} className="text-green" />
                ) : (
                  <FileText size={32} className="text-blue" />
                )
              ) : (
                <UploadCloud size={32} className="text-muted" />
              )}
            </div>
            {fileB ? (
              <div className="file-box-info">
                <span className="file-box-name">{fileB.name}</span>
                <span className="file-box-size">{(fileB.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="file-box-prompt">
                <span>Nhấn hoặc kéo thả Tệp B vào đây</span>
              </div>
            )}
          </div>
        </div>

        <div className="compare-modal-footer">
          <button type="button" className="compare-cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="compare-submit-btn"
            disabled={!fileA || !fileB}
            onClick={handleStart}
          >
            <GitCompare size={16} />
            <span>Bắt Đầu So Sánh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
