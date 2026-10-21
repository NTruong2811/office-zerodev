import type { DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropOverlayProps {
  isDragging: boolean;
  onDropFile: (file: File) => void;
  onDismiss: () => void;
}

export default function DropOverlay({
  isDragging,
  onDropFile,
  onDismiss
}: DropOverlayProps) {
  if (!isDragging) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      onDismiss();
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDismiss();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onDropFile(files[0]);
    }
  };

  return (
    <div
      className="drop-overlay-root"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onDismiss}
    >
      <div className="drop-overlay-card" onClick={(e) => e.stopPropagation()}>
        <UploadCloud size={56} className="drop-icon" />
        <h2>Thả tệp vào đây để mở tức thì</h2>
        <p>Hỗ trợ đầy đủ: .xlsx, .xls, .csv (Excel) và .docx, .doc (Word)</p>
      </div>
    </div>
  );
}
