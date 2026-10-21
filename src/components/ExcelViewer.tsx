import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Workbook } from '@fortune-sheet/react';
import type { WorkbookInstance } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import type { SheetItem } from '../types/office';

export interface ExcelViewerRef {
  jumpToCell: (row: number, col: number, sheetIndex?: number, sheetName?: string) => void;
}

interface ExcelViewerProps {
  sheets: SheetItem[];
  onChange: (sheets: SheetItem[]) => void;
  fileName: string;
  fileVersion?: number;
}

const ExcelViewer = forwardRef<ExcelViewerRef, ExcelViewerProps>(
  ({ sheets, onChange, fileName, fileVersion }, ref) => {
    const workbookRef = useRef<WorkbookInstance>(null);

    useEffect(() => {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 60);
      return () => clearTimeout(timer);
    }, [fileName, fileVersion]);

    useImperativeHandle(ref, () => ({
      jumpToCell: (row: number, col: number, sheetIndex?: number, sheetName?: string) => {
        let targetIndex = sheetIndex;
        if (targetIndex === undefined && sheetName) {
          targetIndex = sheets.findIndex((s) => s.name === sheetName);
        }

        if (targetIndex !== undefined && targetIndex >= 0) {
          const tabs = document.querySelectorAll(
            '.luckysheet-sheets-item, .fortune-sheets-item'
          );
          if (tabs[targetIndex]) {
            (tabs[targetIndex] as HTMLElement).click();
          }
        }

        setTimeout(() => {
          try {
            const currentSheet = sheets[targetIndex || 0] || sheets[0];
            const rowlen = currentSheet?.config?.rowlen || {};
            const columnlen = currentSheet?.config?.columnlen || {};

            let top = 0;
            for (let r = 0; r < row; r++) {
              top += rowlen[r] || 20;
            }
            let left = 0;
            for (let c = 0; c < col; c++) {
              left += columnlen[c] || 73;
            }

            const scrollY = document.querySelector(
              '.luckysheet-scrollbar-y'
            ) as HTMLElement;
            if (scrollY) {
              scrollY.scrollTop = Math.max(0, top - 120);
              scrollY.dispatchEvent(new Event('scroll'));
            }

            const scrollX = document.querySelector(
              '.luckysheet-scrollbar-x'
            ) as HTMLElement;
            if (scrollX) {
              scrollX.scrollLeft = Math.max(0, left - 120);
              scrollX.dispatchEvent(new Event('scroll'));
            }
          } catch {}

          try {
            workbookRef.current?.scroll({
              targetRow: row,
              targetColumn: col
            });
          } catch {}
        }, 120);
      }
    }));

    return (
      <div
        className="excel-viewer-container"
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <Workbook
          key={fileName + '-' + (fileVersion || 0)}
          ref={workbookRef}
          data={sheets as any}
          onChange={(data) => onChange(data as any)}
          showToolbar={true}
          showFormulaBar={true}
          showSheetTabs={true}
          allowEdit={true}
        />
      </div>
    );
  }
);

export default ExcelViewer;
