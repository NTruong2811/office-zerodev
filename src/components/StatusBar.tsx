import type { FileType, WordMode } from '../types/office';

interface StatusBarProps {
  fileType: FileType;
  wordMode: WordMode;
  sheetCount: number;
  wordCount: number;
  charCount: number;
  zoom: number;
}

export default function StatusBar({
  fileType,
  wordMode,
  sheetCount,
  wordCount,
  charCount,
  zoom
}: StatusBarProps) {
  return (
    <footer className="status-bar-root">
      <div className="status-bar-left">
        <span className="status-indicator-dot" />
        <span className="status-ready-text">Sẵn sàng</span>
        <span className="status-separator">|</span>
        {fileType === 'excel' ? (
          <>
            <span className="status-stat-item">Số trang tính: {sheetCount} sheet</span>
            <span className="status-separator">|</span>
            <span className="status-stat-item">Engine: HTML5 Canvas 60 FPS</span>
          </>
        ) : (
          <>
            <span className="status-stat-item">{wordCount} từ</span>
            <span className="status-separator">|</span>
            <span className="status-stat-item">{charCount} ký tự</span>
            <span className="status-separator">|</span>
            <span className="status-stat-item">
              Chế độ: {wordMode === 'view' ? 'Xem chuẩn bố cục' : 'Soạn thảo trực tiếp'}
            </span>
          </>
        )}
      </div>

      <div className="status-bar-right">
        {fileType === 'word' && (
          <span className="status-zoom-indicator">Thu phóng: {zoom}%</span>
        )}
        <span className="status-brand-pill">office-zerodev Engine</span>
      </div>
    </footer>
  );
}
