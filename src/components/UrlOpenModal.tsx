import { useState } from 'react';
import {
  X,
  Globe,
  Code2,
  Copy,
  Check,
  ArrowRight,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface UrlOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitUrl: (url: string) => void;
}

export default function UrlOpenModal({
  isOpen,
  onClose,
  onSubmitUrl
}: UrlOpenModalProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const currentUrl = inputUrl.trim();
  const iframeEmbedCode = currentUrl
    ? `<iframe src="${origin}/iframe-view=${encodeURIComponent(currentUrl)}" width="100%" height="700" frameborder="0" allowfullscreen></iframe>`
    : `<iframe src="${origin}/iframe-view=https://example.com/file.xlsx" width="100%" height="700" frameborder="0" allowfullscreen></iframe>`;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUrl) {
      setError('Vui lòng nhập đường dẫn URL của file Excel hoặc Word');
      return;
    }

    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      setError('Đường dẫn phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    setError(null);
    onSubmitUrl(currentUrl);
    onClose();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(iframeEmbedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="compare-modal-backdrop" onClick={onClose}>
      <div
        className="url-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="compare-modal-header">
          <div className="compare-modal-title-wrap">
            <div className="modal-title-icon-wrap" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <Globe size={22} />
            </div>
            <div>
              <h2 className="compare-modal-title">Xem Tệp Từ URL & Nhúng Iframe</h2>
              <p className="compare-modal-subtitle">
                Xem trực tiếp tệp Excel/Word online hoặc nhúng vào website của bạn qua Iframe
              </p>
            </div>
          </div>
          <button
            type="button"
            className="compare-modal-close"
            onClick={onClose}
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="url-modal-body">
          <div className="url-input-group">
            <label className="url-input-label">
              <span>Đường dẫn tệp tin (.xlsx, .xls, .csv, .docx, .doc):</span>
            </label>
            <div className="url-input-wrapper">
              <Globe size={18} className="url-field-icon" />
              <input
                type="text"
                className="url-text-input"
                placeholder="https://example.com/tailieu/bao_cao.xlsx"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
              />
              {inputUrl && (
                <button
                  type="button"
                  className="url-clear-btn"
                  onClick={() => setInputUrl('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {error && <span className="url-error-msg">{error}</span>}
          </div>

          <div className="url-iframe-preview-card">
            <div className="iframe-card-header">
              <div className="iframe-card-title">
                <Code2 size={16} className="text-indigo" />
                <span>Mã nhúng Iframe cho website của bạn</span>
              </div>
              <button
                type="button"
                className={`copy-code-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyCode}
                title="Sao chép mã iframe"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>
            </div>
            <pre className="iframe-code-block">
              <code>{iframeEmbedCode}</code>
            </pre>
            <span className="iframe-hint">
              Hỗ trợ định dạng URL: <code>{origin}/iframe-view=URL_CỦA_FILE</code>
            </span>
          </div>

          <div className="url-sample-chips">
            <span className="sample-label">Định dạng hỗ trợ:</span>
            <span className="sample-chip excel">
              <FileSpreadsheet size={13} />
              Excel (.xlsx, .xls, .csv)
            </span>
            <span className="sample-chip word">
              <FileText size={13} />
              Word (.docx, .doc)
            </span>
          </div>

          <div className="url-modal-actions">
            <button
              type="button"
              className="url-cancel-btn"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="url-submit-btn"
            >
              <span>Xem Trực Tuyến</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
