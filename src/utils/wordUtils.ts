import mammoth from 'mammoth';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';

export function getSampleWordHtml(): string {
  return `
    <h1 style="text-align: center; color: #1e3a8a; margin-bottom: 8px;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
    <h3 style="text-align: center; color: #475569; margin-top: 0; font-weight: normal; margin-bottom: 24px;">Độc lập - Tự do - Hạnh phúc</h3>
    <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px auto; width: 60%;" />

    <h2 style="text-align: center; color: #0f172a; margin-top: 24px; margin-bottom: 16px;">HỢP ĐỒNG CUNG CẤP DỊCH VỤ CÔNG NGHỆ</h2>
    <p style="text-align: center; font-style: italic; color: #64748b; margin-bottom: 28px;">Số: 108/2026/HĐDV-TECH</p>

    <p>Hôm nay, ngày 21 tháng 10 năm 2026, tại trụ sở văn phòng, hai bên gồm có:</p>

    <h3 style="color: #1e40af; margin-top: 20px;">BÊN A (BÊN SỬ DỤNG DỊCH VỤ):</h3>
    <ul>
      <li><strong>Tên đơn vị:</strong> TẬP ĐOÀN CÔNG NGHỆ & ĐỔI MỚI SÁNG TẠO GLOBAL</li>
      <li><strong>Đại diện:</strong> Ông Nguyễn Văn A - Chức vụ: Tổng Giám Đốc</li>
      <li><strong>Địa chỉ:</strong> Tầng 18, Tòa nhà Landmark, Hà Nội</li>
      <li><strong>Điện thoại:</strong> (024) 3999 8888</li>
    </ul>

    <h3 style="color: #1e40af; margin-top: 20px;">BÊN B (BÊN CUNG CẤP DỊCH VỤ):</h3>
    <ul>
      <li><strong>Tên đơn vị:</strong> CÔNG TY TNHH PHẦN MỀM TỐC ĐỘ CAO ZERODEV</li>
      <li><strong>Đại diện:</strong> Bà Trần Thị B - Chức vụ: Giám Đốc Kỹ Thuật</li>
      <li><strong>Mã số thuế:</strong> 0109988776</li>
      <li><strong>Địa chỉ:</strong> Tòa nhà Innovation Center, TP. Hồ Chí Minh</li>
    </ul>

    <h3 style="color: #1e40af; margin-top: 24px;">ĐIỀU 1: PHẠM VI DỊCH VỤ & TIẾN ĐỘ THỰC HIỆN</h3>
    <p>Bên B cam kết cung cấp giải pháp nền tảng phần mềm xử lý dữ liệu và văn bản trực tuyến theo tiêu chuẩn hiệu năng cao, phản hồi tức thì với các hạng mục sau:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: left;">
          <th style="border: 1px solid #cbd5e1; padding: 10px;">Giai Đoạn</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px;">Nội Dung Công Việc</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; width: 120px;">Thời Gian</th>
          <th style="border: 1px solid #cbd5e1; padding: 10px; width: 110px;">Trạng Thái</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Phase 1</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Thiết kế kiến trúc hệ thống và giao diện người dùng tối ưu tốc độ</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Tuần 1 - 2</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px; color: #16a34a; font-weight: bold;">Hoàn thành</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Phase 2</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Tích hợp công cụ xem & chỉnh sửa bảng tính Excel bằng Canvas Engine</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Tuần 3 - 4</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px; color: #16a34a; font-weight: bold;">Hoàn thành</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Phase 3</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Tích hợp công cụ xem và soạn thảo tài liệu Word DOCX đa chế độ</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Tuần 5 - 6</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px; color: #2563eb; font-weight: bold;">Đang thực hiện</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Phase 4</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Kiểm thử hiệu năng tải trang, kiểm tra tương thích và bàn giao nghiệm thu</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px;">Tuần 7</td>
          <td style="border: 1px solid #cbd5e1; padding: 10px; color: #64748b;">Kế hoạch</td>
        </tr>
      </tbody>
    </table>

    <h3 style="color: #1e40af; margin-top: 24px;">ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN</h3>
    <p>Tổng giá trị hợp đồng trọn gói là: <strong>350.000.000 VNĐ</strong> <em>(Ba trăm năm mươi triệu đồng chẵn)</em>, đã bao gồm các loại thuế phí theo quy định pháp luật hiện hành.</p>

    <div style="margin-top: 48px; display: flex; justify-content: space-between; text-align: center;">
      <div style="display: inline-block; width: 45%; text-align: center; vertical-align: top;">
        <p><strong>ĐẠI DIỆN BÊN A</strong></p>
        <p style="font-style: italic; color: #64748b; margin-top: 4px;">(Ký, ghi rõ họ tên & đóng dấu)</p>
        <div style="height: 70px;"></div>
        <p><strong>Nguyễn Văn A</strong></p>
      </div>
      <div style="display: inline-block; width: 45%; text-align: center; vertical-align: top; float: right;">
        <p><strong>ĐẠI DIỆN BÊN B</strong></p>
        <p style="font-style: italic; color: #64748b; margin-top: 4px;">(Ký, ghi rõ họ tên & đóng dấu)</p>
        <div style="height: 70px;"></div>
        <p><strong>Trần Thị B</strong></p>
      </div>
    </div>
  `;
}

export async function parseDocxToHtml(fileOrBuffer: File | ArrayBuffer): Promise<string> {
  const arrayBuffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value || '<p></p>';
}

export async function exportHtmlToDocx(htmlContent: string, filename: string): Promise<void> {
  const parser = new DOMParser();
  const docParsed = parser.parseFromString(htmlContent, 'text/html');
  const bodyNodes = Array.from(docParsed.body.childNodes);

  const docChildren: (Paragraph | Table)[] = [];

  for (const node of bodyNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        docChildren.push(new Paragraph({ children: [new TextRun(text)] }));
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'h1') {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: extractRuns(el)
        })
      );
    } else if (tag === 'h2') {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: extractRuns(el)
        })
      );
    } else if (tag === 'h3') {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: extractRuns(el)
        })
      );
    } else if (tag === 'p' || tag === 'div') {
      const align = getDocxAlignment(el);
      docChildren.push(
        new Paragraph({
          alignment: align,
          children: extractRuns(el)
        })
      );
    } else if (tag === 'ul' || tag === 'ol') {
      const lis = Array.from(el.querySelectorAll('li'));
      lis.forEach((li) => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            children: extractRuns(li)
          })
        );
      });
    } else if (tag === 'table') {
      const rows = Array.from(el.querySelectorAll('tr'));
      const tableRows: TableRow[] = [];

      rows.forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll('th, td'));
        const tableCells: TableCell[] = [];

        cells.forEach((td) => {
          tableCells.push(
            new TableCell({
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
              },
              children: [
                new Paragraph({
                  children: extractRuns(td as HTMLElement)
                })
              ]
            })
          );
        });

        if (tableCells.length > 0) {
          tableRows.push(new TableRow({ children: tableCells }));
        }
      });

      if (tableRows.length > 0) {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
          })
        );
      }
    } else if (tag === 'hr') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun('________________________________________________________')]
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: docChildren.length > 0 ? docChildren : [new Paragraph({ children: [new TextRun(' ')] })]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const validName = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  saveAs(blob, validName);
}

function extractRuns(element: HTMLElement): TextRun[] {
  const runs: TextRun[] = [];

  function walk(node: Node, bold = false, italics = false, underline = false, strike = false) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        runs.push(
          new TextRun({
            text,
            bold,
            italics,
            underline: underline ? {} : undefined,
            strike
          })
        );
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const isB = bold || tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold';
      const isI = italics || tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
      const isU = underline || tag === 'u' || el.style.textDecoration.includes('underline');
      const isS = strike || tag === 's' || tag === 'strike' || el.style.textDecoration.includes('line-through');

      node.childNodes.forEach((child) => walk(child, isB, isI, isU, isS));
    }
  }

  walk(element);
  return runs.length > 0 ? runs : [new TextRun('')];
}

function getDocxAlignment(el: HTMLElement) {
  const align = el.style.textAlign;
  if (align === 'center') return AlignmentType.CENTER;
  if (align === 'right') return AlignmentType.RIGHT;
  if (align === 'justify') return AlignmentType.JUSTIFIED;
  return AlignmentType.LEFT;
}

export function exportHtmlToWordHtml(htmlContent: string, filename: string): void {
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${filename}</title>
<style>
body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 40px; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
th { background-color: #f1f5f9; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword;charset=utf-8' });
  const validName = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  saveAs(blob, validName);
}
