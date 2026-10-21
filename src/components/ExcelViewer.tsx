import { useEffect, useRef } from 'react';
import { Workbook } from '@fortune-sheet/react';
import type { WorkbookInstance } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import type { SheetItem } from '../types/office';

interface ExcelViewerProps {
  sheets: SheetItem[];
  onChange: (sheets: SheetItem[]) => void;
  fileName: string;
  fileVersion?: number;
}

export default function ExcelViewer({ sheets, onChange, fileName, fileVersion }: ExcelViewerProps) {
  const workbookRef = useRef<WorkbookInstance>(null);

  useEffect(() => {
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="excel-viewer-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
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
