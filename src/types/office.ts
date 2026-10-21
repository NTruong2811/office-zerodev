export type FileType = 'excel' | 'word';
export type WordMode = 'view' | 'edit';

export interface DocumentMeta {
  name: string;
  type: FileType;
  size?: number;
  lastModified?: number;
  wordMode?: WordMode;
}

export interface SheetCell {
  v?: string | number | boolean;
  m?: string;
  f?: string;
  bg?: string;
  fc?: string;
  bl?: number;
  it?: number;
  fs?: number;
  ff?: number | string;
  vt?: number;
  ht?: number;
  tb?: number;
  mc?: {
    r: number;
    c: number;
    rs?: number;
    cs?: number;
  };
  [key: string]: any;
}

export interface LuckyCellData {
  r: number;
  c: number;
  v: SheetCell | null;
}

export interface SheetItem {
  id?: string;
  name: string;
  order?: number;
  status?: number;
  color?: string;
  celldata?: LuckyCellData[];
  data?: (SheetCell | null)[][];
  config?: Record<string, any>;
  row?: number;
  column?: number;
}
