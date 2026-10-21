declare module 'luckyexcel' {
  interface LuckyExcelOptions {
    [key: string]: any;
  }
  const LuckyExcel: {
    transformExcelToLucky: (
      file: File | Blob,
      callBack: (exportJson: any, luckysheetfile: any) => void,
      errorHandler?: (err: any) => void
    ) => void;
    transformExcelToLuckyByUrl: (
      url: string,
      name: string,
      callBack: (exportJson: any, luckysheetfile: any) => void,
      errorHandler?: (err: any) => void
    ) => void;
  };
  export default LuckyExcel;
}

declare module 'docx-preview' {
  export interface RenderOptions {
    className?: string;
    inWrapper?: boolean;
    ignoreWidth?: boolean;
    ignoreHeight?: boolean;
    ignoreFonts?: boolean;
    breakPages?: boolean;
    debug?: boolean;
    experimental?: boolean;
    trimXmlDeclaration?: boolean;
    renderHeaders?: boolean;
    renderFooters?: boolean;
    renderFootnotes?: boolean;
    renderEndnotes?: boolean;
  }
  export function renderAsync(
    data: Blob | ArrayBuffer | Uint8Array,
    bodyContainer: HTMLElement,
    styleContainer?: HTMLElement,
    options?: RenderOptions
  ): Promise<any>;
}
