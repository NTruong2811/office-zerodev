import type { SheetItem, DiffItem, DiffType } from '../types/office';

export function colToLetter(c: number): string {
  let temp = '';
  let letter = '';
  let col = c;
  while (col >= 0) {
    temp = String.fromCharCode((col % 26) + 65);
    letter = temp + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

export function coordFromRowCol(row: number, col: number): string {
  return `${colToLetter(col)}${row + 1}`;
}

export function compareExcelSheets(
  sheetsA: SheetItem[],
  sheetsB: SheetItem[]
): { diffSheets: SheetItem[]; diffList: DiffItem[] } {
  const diffList: DiffItem[] = [];
  let diffCounter = 0;

  const diffSheets: SheetItem[] = sheetsB.map((sheetB, bIdx) => {
    const sheetA =
      sheetsA.find((s) => s.name === sheetB.name) ||
      sheetsA[bIdx] ||
      null;

    const dataB = sheetB.data || [];
    const dataA = sheetA?.data || [];

    const maxR = Math.max(dataB.length, dataA.length);
    const maxC = Math.max(dataB[0]?.length || 0, dataA[0]?.length || 0);

    const mergedRows = Math.max(maxR, sheetB.row || 84);
    const mergedCols = Math.max(maxC, sheetB.column || 26);

    const newData = Array.from({ length: mergedRows }, () =>
      Array(mergedCols).fill(null)
    );

    for (let r = 0; r < mergedRows; r++) {
      for (let c = 0; c < mergedCols; c++) {
        const cellA = dataA[r]?.[c];
        const cellB = dataB[r]?.[c];

        const rawValA = cellA ? (cellA.v !== undefined ? cellA.v : cellA.m || '') : '';
        const rawValB = cellB ? (cellB.v !== undefined ? cellB.v : cellB.m || '') : '';

        const strA = String(rawValA).trim();
        const strB = String(rawValB).trim();

        if (cellB) {
          newData[r][c] = { ...cellB };
        }

        if (strA !== strB) {
          diffCounter++;
          const coord = coordFromRowCol(r, c);
          let type: DiffType = 'modified';

          if (strA === '' && strB !== '') {
            type = 'added';
            if (!newData[r][c]) {
              newData[r][c] = { v: rawValB, m: strB };
            }
            newData[r][c] = {
              ...newData[r][c],
              bg: '#dcfce7',
              fc: '#15803d',
              bl: 1
            };
          } else if (strA !== '' && strB === '') {
            type = 'deleted';
            newData[r][c] = {
              v: `[Đã xóa: ${strA}]`,
              m: `[Đã xóa: ${strA}]`,
              bg: '#fee2e2',
              fc: '#b91c1c',
              it: 1
            };
          } else {
            type = 'modified';
            if (!newData[r][c]) {
              newData[r][c] = { v: rawValB, m: strB };
            }
            newData[r][c] = {
              ...newData[r][c],
              bg: '#fef08a',
              fc: '#854d0e',
              bl: 1
            };
          }

          diffList.push({
            id: `diff-cell-${sheetB.name}-${r}-${c}-${diffCounter}`,
            type,
            location: `${sheetB.name} • ${coord}`,
            sheetIndex: bIdx,
            sheetName: sheetB.name,
            row: r,
            col: c,
            oldContent: strA || '(trống)',
            newContent: strB || '(trống)'
          });
        }
      }
    }

    const celldata: any[] = [];
    for (let r = 0; r < mergedRows; r++) {
      for (let c = 0; c < mergedCols; c++) {
        const cell = newData[r][c];
        if (cell != null) {
          celldata.push({ r, c, v: cell });
        }
      }
    }

    const cleanedB = { ...sheetB };
    delete (cleanedB as any).luckysheet_select_save;
    delete (cleanedB as any).luckysheet_selection_range;

    return {
      ...cleanedB,
      data: newData,
      celldata,
      row: mergedRows,
      column: mergedCols
    };
  });

  sheetsA.forEach((sheetA, aIdx) => {
    const existsInB = sheetsB.some((s) => s.name === sheetA.name);
    if (!existsInB) {
      diffCounter++;
      diffList.push({
        id: `diff-sheet-deleted-${aIdx}-${diffCounter}`,
        type: 'deleted',
        location: `Trang tính: ${sheetA.name}`,
        sheetIndex: aIdx,
        sheetName: sheetA.name,
        oldContent: `Sheet '${sheetA.name}' có trong File A`,
        newContent: '(Đã bị xóa ở File B)'
      });
    }
  });

  return { diffSheets, diffList };
}
