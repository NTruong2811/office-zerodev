import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import * as docxPreview from 'docx-preview';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minus
} from 'lucide-react';
import type { WordMode } from '../types/office';

interface WordViewerProps {
  htmlContent: string;
  docxBuffer: ArrayBuffer | null;
  mode: WordMode;
  onContentChange: (html: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isIframe?: boolean;
}

export default function WordViewer({
  htmlContent,
  docxBuffer,
  mode,
  onContentChange,
  zoom,
  onZoomChange,
  isIframe = false
}: WordViewerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [textColor, setTextColor] = useState('#0f172a');
  const [highlightColor, setHighlightColor] = useState('#fef08a');
  const [fontFamily, setFontFamily] = useState('Segoe UI');
  const [fontSize, setFontSize] = useState('3');

  useEffect(() => {
    if (mode === 'edit' && editorRef.current) {
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
  }, [mode]);

  useEffect(() => {
    if ((mode === 'view' || isIframe) && previewRef.current) {
      previewRef.current.innerHTML = '';
      if (docxBuffer) {
        docxPreview
          .renderAsync(docxBuffer, previewRef.current, undefined, {
            inWrapper: true,
            breakPages: true,
            experimental: true
          })
          .catch(() => {
            if (previewRef.current) {
              previewRef.current.innerHTML = `<div class="a4-page">${htmlContent}</div>`;
            }
          });
      } else {
        previewRef.current.innerHTML = `<div class="a4-page">${htmlContent}</div>`;
      }
    }
  }, [mode, docxBuffer, htmlContent, isIframe]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertTable = () => {
    const rowsStr = window.prompt('Nhập số hàng của bảng (ví dụ: 3):', '3');
    if (!rowsStr) return;
    const colsStr = window.prompt('Nhập số cột của bảng (ví dụ: 3):', '3');
    if (!colsStr) return;

    const rows = parseInt(rowsStr, 10) || 3;
    const cols = parseInt(colsStr, 10) || 3;

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><thead><tr>`;
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; background-color: #f1f5f9;">Tiêu đề ${c + 1}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 0; r < rows - 1; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Ô [${r + 1}, ${c + 1}]</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    exec('insertHTML', tableHtml);
  };

  const handleInsertImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const src = loadEvent.target?.result as string;
      if (src) {
        const imgHtml = `<p style="text-align: center;"><img src="${src}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 12px 0;" /></p><p><br></p>`;
        exec('insertHTML', imgHtml);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="word-viewer-layout">
      {!isIframe && mode === 'edit' && (
        <div className="word-ribbon">
          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn"
              title="Hoàn tác (Ctrl+Z)"
              onClick={() => exec('undo')}
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Làm lại (Ctrl+Y)"
              onClick={() => exec('redo')}
            >
              <RotateCw size={16} />
            </button>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group">
            <select
              className="ribbon-select"
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                exec('fontName', e.target.value);
              }}
            >
              <option value="Segoe UI">Segoe UI</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
              <option value="Roboto">Roboto</option>
              <option value="Courier New">Courier New</option>
            </select>

            <select
              className="ribbon-select font-size-select"
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                exec('fontSize', e.target.value);
              }}
            >
              <option value="1">10 pt</option>
              <option value="2">12 pt</option>
              <option value="3">14 pt</option>
              <option value="4">16 pt</option>
              <option value="5">18 pt</option>
              <option value="6">24 pt</option>
              <option value="7">32 pt</option>
            </select>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn"
              title="Tiêu đề 1"
              onClick={() => exec('formatBlock', '<h1>')}
            >
              <Heading1 size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Tiêu đề 2"
              onClick={() => exec('formatBlock', '<h2>')}
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Tiêu đề 3"
              onClick={() => exec('formatBlock', '<h3>')}
            >
              <Heading3 size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Đoạn văn thường"
              onClick={() => exec('formatBlock', '<p>')}
            >
              P
            </button>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn"
              title="In đậm (Ctrl+B)"
              onClick={() => exec('bold')}
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="In nghiêng (Ctrl+I)"
              onClick={() => exec('italic')}
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Gạch chân (Ctrl+U)"
              onClick={() => exec('underline')}
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Gạch ngang"
              onClick={() => exec('strikeThrough')}
            >
              <Strikethrough size={16} />
            </button>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group">
            <label className="ribbon-color-label" title="Màu chữ">
              <span className="color-icon" style={{ borderBottomColor: textColor }}>A</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  exec('foreColor', e.target.value);
                }}
              />
            </label>
            <label className="ribbon-color-label" title="Màu nền highlight">
              <span className="highlight-icon" style={{ backgroundColor: highlightColor }}>T</span>
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => {
                  setHighlightColor(e.target.value);
                  exec('hiliteColor', e.target.value);
                }}
              />
            </label>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn"
              title="Căn trái"
              onClick={() => exec('justifyLeft')}
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Căn giữa"
              onClick={() => exec('justifyCenter')}
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Căn phải"
              onClick={() => exec('justifyRight')}
            >
              <AlignRight size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Căn đều 2 bên"
              onClick={() => exec('justifyFull')}
            >
              <AlignJustify size={16} />
            </button>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn"
              title="Danh sách dấu đầu dòng"
              onClick={() => exec('insertUnorderedList')}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Danh sách số"
              onClick={() => exec('insertOrderedList')}
            >
              <ListOrdered size={16} />
            </button>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn"
              title="Chèn bảng tính"
              onClick={handleInsertTable}
            >
              <TableIcon size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Chèn ảnh"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon size={16} />
            </button>
            <input
              type="file"
              ref={imageInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleInsertImage}
            />
            <button
              type="button"
              className="ribbon-btn"
              title="Chèn đường kẻ ngang"
              onClick={() => exec('insertHorizontalRule')}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Xóa định dạng"
              onClick={() => exec('removeFormat')}
            >
              <RemoveFormatting size={16} />
            </button>
          </div>

          <div className="ribbon-divider" />

          <div className="ribbon-group zoom-group">
            <button
              type="button"
              className="ribbon-btn"
              title="Thu nhỏ"
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            >
              <ZoomOut size={16} />
            </button>
            <span className="zoom-text">{zoom}%</span>
            <button
              type="button"
              className="ribbon-btn"
              title="Phóng to"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Chuẩn 100%"
              onClick={() => onZoomChange(100)}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {!isIframe && mode === 'view' && (
        <div className="word-view-toolbar">
          <div className="view-mode-badge">
            Chế độ Xem chuẩn bố cục (DOCX High Fidelity)
          </div>
          <div className="ribbon-group zoom-group">
            <button
              type="button"
              className="ribbon-btn"
              title="Thu nhỏ"
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            >
              <ZoomOut size={16} />
            </button>
            <span className="zoom-text">{zoom}%</span>
            <button
              type="button"
              className="ribbon-btn"
              title="Phóng to"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              title="Chuẩn 100%"
              onClick={() => onZoomChange(100)}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {isIframe && (
        <div className="word-floating-zoom-bar">
          <button
            type="button"
            className="floating-zoom-btn"
            title="Thu nhỏ"
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
          >
            <ZoomOut size={15} />
          </button>
          <span className="floating-zoom-text">{zoom}%</span>
          <button
            type="button"
            className="floating-zoom-btn"
            title="Phóng to"
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="floating-zoom-btn"
            title="Chuẩn 100%"
            onClick={() => onZoomChange(100)}
          >
            <Maximize2 size={15} />
          </button>
        </div>
      )}

      <div className="word-paper-viewport">
        <div
          className="word-zoom-container"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease'
          }}
        >
          {!isIframe && mode === 'edit' ? (
            <div
              ref={editorRef}
              className="a4-page-editable"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              spellCheck={false}
            />
          ) : (
            <div ref={previewRef} className="docx-preview-wrapper" />
          )}
        </div>
      </div>
    </div>
  );
}
