import * as XLSX from 'xlsx';
import LuckyExcel from 'luckyexcel';
import type { SheetItem, LuckyCellData } from '../types/office';

export function normalizeSheetForFortune(sheet: any, idx = 0): SheetItem {
  const id = String(sheet.id || sheet.index || idx + 1);
  const merges = sheet.config?.merge || {};
  const rowlen = sheet.config?.rowlen || {};
  const columnlen = sheet.config?.columnlen || {};

  let maxR = 0;
  let maxC = 0;

  if (sheet.celldata && Array.isArray(sheet.celldata)) {
    sheet.celldata.forEach((c: any) => {
      if (c && typeof c.r === 'number' && c.r > maxR) maxR = c.r;
      if (c && typeof c.c === 'number' && c.c > maxC) maxC = c.c;
    });
  }

  if (sheet.data && Array.isArray(sheet.data)) {
    if (sheet.data.length - 1 > maxR) maxR = sheet.data.length - 1;
    sheet.data.forEach((row: any[]) => {
      if (Array.isArray(row) && row.length - 1 > maxC) {
        maxC = row.length - 1;
      }
    });
  }

  Object.values(merges).forEach((m: any) => {
    if (m && typeof m.r === 'number' && typeof m.rs === 'number') {
      const bottom = m.r + m.rs - 1;
      if (bottom > maxR) maxR = bottom;
    }
    if (m && typeof m.c === 'number' && typeof m.cs === 'number') {
      const right = m.c + m.cs - 1;
      if (right > maxC) maxC = right;
    }
  });

  const totalRows = Math.max(maxR + 20, sheet.row || 84);
  const totalCols = Math.max(maxC + 10, sheet.column || 26);

  const data: (any | null)[][] = Array.from({ length: totalRows }, () =>
    Array(totalCols).fill(null)
  );

  if (sheet.data && Array.isArray(sheet.data)) {
    for (let r = 0; r < sheet.data.length && r < totalRows; r++) {
      const row = sheet.data[r];
      if (Array.isArray(row)) {
        for (let c = 0; c < row.length && c < totalCols; c++) {
          if (row[c]) {
            data[r][c] = { ...row[c] };
          }
        }
      }
    }
  } else if (sheet.celldata && Array.isArray(sheet.celldata)) {
    sheet.celldata.forEach(({ r, c, v }: any) => {
      if (r < totalRows && c < totalCols) {
        data[r][c] = v ? { ...v } : null;
      }
    });
  }

  Object.entries(merges).forEach(([_, m]: [string, any]) => {
    const { r, c, rs, cs } = m;
    if (typeof r === 'number' && typeof c === 'number' && r < totalRows && c < totalCols) {
      if (!data[r][c]) {
        data[r][c] = { m: '', v: '' };
      }
      data[r][c].mc = { r, c, rs, cs };

      for (let dr = 0; dr < rs; dr++) {
        for (let dc = 0; dc < cs; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < totalRows && nc < totalCols) {
            if (!data[nr][nc]) {
              data[nr][nc] = {};
            }
            data[nr][nc].mc = { r, c };
          }
        }
      }
    }
  });

  const celldata: LuckyCellData[] = [];
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const cell = data[r][c];
      if (cell != null) {
        if (cell.v !== undefined && (cell.m === undefined || cell.m === '')) {
          cell.m = String(cell.v);
        }
        celldata.push({ r, c, v: cell });
      }
    }
  }

  const customHeight: Record<string, number> = { ...(sheet.config?.customHeight || {}) };
  Object.keys(rowlen).forEach((r) => {
    customHeight[r] = 1;
  });

  const customWidth: Record<string, number> = { ...(sheet.config?.customWidth || {}) };
  Object.keys(columnlen).forEach((c) => {
    customWidth[c] = 1;
  });

  const config = {
    ...sheet.config,
    merge: merges,
    rowlen,
    columnlen,
    customHeight,
    customWidth
  };

  const cleanedSheet = { ...sheet };
  delete cleanedSheet.luckysheet_select_save;
  delete cleanedSheet.luckysheet_selection_range;
  delete cleanedSheet.image;

  let images: any[] = [];
  const rawImages = sheet.images || sheet.image;
  if (Array.isArray(rawImages)) {
    images = rawImages;
  } else if (rawImages && typeof rawImages === 'object') {
    images = Object.entries(rawImages)
      .map(([key, val]: [string, any]) => {
        if (!val) return null;
        return {
          id: val.id || key,
          src: val.src || '',
          left: val.default?.left ?? val.fixedLeft ?? val.left ?? 0,
          top: val.default?.top ?? val.fixedTop ?? val.top ?? 0,
          width: val.default?.width ?? val.originWidth ?? val.width ?? 100,
          height: val.default?.height ?? val.originHeight ?? val.height ?? 100
        };
      })
      .filter(Boolean);
  }

  return {
    ...cleanedSheet,
    images,
    id,
    order: idx,
    status: idx === 0 ? 1 : 0,
    data,
    celldata,
    config,
    row: totalRows,
    column: totalCols
  };
}

export function parseExcelFile(file: File): Promise<SheetItem[]> {
  return new Promise((resolve, reject) => {
    const isCsv = file.name.endsWith('.csv');
    const isXls = file.name.endsWith('.xls');

    if (!isCsv && !isXls && LuckyExcel) {
      LuckyExcel.transformExcelToLucky(
        file,
        (exportJson) => {
          if (exportJson && exportJson.sheets && exportJson.sheets.length > 0) {
            try {
              const normalizedSheets = exportJson.sheets.map((s: any, idx: number) =>
                normalizeSheetForFortune(s, idx)
              );
              resolve(normalizedSheets);
            } catch (err) {
              fallbackParseWithSheetJS(file).then(resolve).catch(reject);
            }
          } else {
            fallbackParseWithSheetJS(file).then(resolve).catch(reject);
          }
        },
        () => {
          fallbackParseWithSheetJS(file).then(resolve).catch(reject);
        }
      );
    } else {
      fallbackParseWithSheetJS(file).then(resolve).catch(reject);
    }
  });
}

function fallbackParseWithSheetJS(file: File): Promise<SheetItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, {
          type: 'binary',
          cellDates: true,
          cellStyles: true,
          cellNF: true
        });

        const sheets: SheetItem[] = workbook.SheetNames.map((sheetName, index) => {
          const ws = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
          const celldata: LuckyCellData[] = [];
          const merges: Record<string, any> = {};
          const columnlen: Record<string, number> = {};
          const rowlen: Record<string, number> = {};

          if (ws['!merges'] && Array.isArray(ws['!merges'])) {
            ws['!merges'].forEach((m) => {
              const r = m.s.r;
              const c = m.s.c;
              const rs = m.e.r - m.s.r + 1;
              const cs = m.e.c - m.s.c + 1;
              merges[`${r}_${c}`] = { r, c, rs, cs };
            });
          }

          if (ws['!cols'] && Array.isArray(ws['!cols'])) {
            ws['!cols'].forEach((col, c) => {
              if (col) {
                if (col.wpx) columnlen[c] = col.wpx;
                else if (col.wch) columnlen[c] = Math.round(col.wch * 8 + 5);
                else if (col.width) columnlen[c] = Math.round(col.width * 8);
              }
            });
          }

          if (ws['!rows'] && Array.isArray(ws['!rows'])) {
            ws['!rows'].forEach((row, r) => {
              if (row) {
                if (row.hpx) rowlen[r] = row.hpx;
                else if (row.hpt) rowlen[r] = Math.round(row.hpt * 1.33);
              }
            });
          }

          rawData.forEach((row, r) => {
            row.forEach((cellVal, c) => {
              if (cellVal !== undefined && cellVal !== null && cellVal !== '') {
                celldata.push({
                  r,
                  c,
                  v: {
                    v: cellVal,
                    m: String(cellVal),
                    tb: 2
                  }
                });
              }
            });
          });

          const rawSheet = {
            id: String(index + 1),
            name: sheetName,
            order: index,
            status: index === 0 ? 1 : 0,
            celldata,
            config: {
              merge: merges,
              columnlen,
              rowlen
            },
            row: Math.max(rawData.length + 15, 84),
            column: Math.max((rawData[0]?.length || 0) + 8, 26)
          };

          return normalizeSheetForFortune(rawSheet, index);
        });

        resolve(sheets.length > 0 ? sheets : []);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

export function exportToXlsx(sheets: any[], filename: string) {
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet, idx) => {
    const aoa: any[][] = [];

    if (sheet.data && Array.isArray(sheet.data) && sheet.data.length > 0) {
      for (let r = 0; r < sheet.data.length; r++) {
        const row = sheet.data[r] || [];
        const rowArr: any[] = [];
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (cell) {
            rowArr.push(cell.v !== undefined ? cell.v : cell.m || '');
          } else {
            rowArr.push('');
          }
        }
        aoa.push(rowArr);
      }
    } else if (sheet.celldata && Array.isArray(sheet.celldata)) {
      sheet.celldata.forEach((item: any) => {
        const r = item.r;
        const c = item.c;
        const cell = item.v;
        while (aoa.length <= r) {
          aoa.push([]);
        }
        while (aoa[r].length <= c) {
          aoa[r].push('');
        }
        aoa[r][c] = cell ? (cell.v !== undefined ? cell.v : cell.m || '') : '';
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa.length > 0 ? aoa : [['']]);

    if (sheet.config?.merge) {
      const sheetMerges: XLSX.Range[] = [];
      Object.values(sheet.config.merge).forEach((m: any) => {
        if (m && typeof m.r === 'number' && typeof m.c === 'number') {
          sheetMerges.push({
            s: { r: m.r, c: m.c },
            e: { r: m.r + (m.rs || 1) - 1, c: m.c + (m.cs || 1) - 1 }
          });
        }
      });
      if (sheetMerges.length > 0) {
        ws['!merges'] = sheetMerges;
      }
    }

    const sheetName = (sheet.name || `Sheet${idx + 1}`).substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const validName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, validName);
}

export function exportToCsv(sheets: any[], filename: string) {
  if (!sheets || sheets.length === 0) return;
  const firstSheet = sheets[0];
  const aoa: any[][] = [];

  if (firstSheet.data && Array.isArray(firstSheet.data)) {
    for (let r = 0; r < firstSheet.data.length; r++) {
      const row = firstSheet.data[r] || [];
      const rowArr: any[] = [];
      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        rowArr.push(cell ? (cell.v !== undefined ? cell.v : cell.m || '') : '');
      }
      aoa.push(rowArr);
    }
  } else if (firstSheet.celldata) {
    firstSheet.celldata.forEach((item: any) => {
      const r = item.r;
      const c = item.c;
      const cell = item.v;
      while (aoa.length <= r) aoa.push([]);
      while (aoa[r].length <= c) aoa[r].push('');
      aoa[r][c] = cell ? (cell.v !== undefined ? cell.v : cell.m || '') : '';
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa.length > 0 ? aoa : [['']]);
  const csvContent = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
