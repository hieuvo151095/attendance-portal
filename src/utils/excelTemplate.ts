import { ImportEmployeeRow } from '../types/employee';

/**
 * File mẫu chuẩn Excel (.xlsx) danh sách nhân sự Finviet
 * Chuẩn OpenXML ZIP chứa [Content_Types].xml, workbook.xml, styles.xml, sharedStrings.xml, sheet1.xml
 */
export const SAMPLE_EMPLOYEE_XLSX_BASE64 =
  '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';

/**
 * Tải file mẫu danh sách nhân sự định dạng .xlsx
 */
export function downloadEmployeeExcelTemplate(fileName = 'Mau_nhap_lieu_nhan_su_Finviet.xlsx') {
  try {
    const binaryString = atob(SAMPLE_EMPLOYEE_XLSX_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Lỗi khi tải file mẫu Excel (.xlsx):', err);
    // Fallback: nếu môi trường bị chặn blob, điều hướng sang file public
    const link = document.createElement('a');
    link.href = '/Mau_nhap_lieu_nhan_su_Finviet.xlsx';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Giải nén và trích xuất dữ liệu từ file Excel .xlsx
 */
export async function parseXlsxFile(file: File): Promise<ImportEmployeeRow[]> {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    if (typeof file.arrayBuffer === 'function') {
      file.arrayBuffer().then(resolve, reject);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    }
  });
  const buffer = new Uint8Array(arrayBuffer);

  const entries: Record<string, string> = {};
  let offset = 0;

  while (offset < buffer.length - 4) {
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4b &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      const view = new DataView(buffer.buffer, buffer.byteOffset + offset);
      const compMethod = view.getUint16(8, true);
      const compSize = view.getUint32(18, true);
      const nameLen = view.getUint16(26, true);
      const extraLen = view.getUint16(28, true);

      const nameBytes = buffer.slice(offset + 30, offset + 30 + nameLen);
      const fileName = new TextDecoder('utf-8').decode(nameBytes);
      const dataStart = offset + 30 + nameLen + extraLen;
      const compData = buffer.slice(dataStart, dataStart + compSize);

      if (compMethod === 0) {
        entries[fileName] = new TextDecoder('utf-8').decode(compData);
      } else if (compMethod === 8) {
        if (typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(compData);
          writer.close();
          const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
          entries[fileName] = new TextDecoder('utf-8').decode(decompressedBuffer);
        }
      }
      offset = dataStart + compSize;
    } else {
      offset++;
    }
  }

  // Trích xuất shared strings
  const sstXml = entries['xl/sharedStrings.xml'] || '';
  const sharedStrings: string[] = [];
  const siRegex = /<si>(.*?)<\/si>/gs;
  let m: RegExpExecArray | null;
  while ((m = siRegex.exec(sstXml)) !== null) {
    const tMatch = /<t[^>]*>(.*?)<\/t>/s.exec(m[1]);
    sharedStrings.push(tMatch ? tMatch[1] : '');
  }

  // Trích xuất sheet1.xml
  const sheetXml = entries['xl/worksheets/sheet1.xml'] || '';
  const parsedRows: ImportEmployeeRow[] = [];
  const rowRegex = /<row[^>]*>(.*?)<\/row>/gs;

  let isHeader = true;
  while ((m = rowRegex.exec(sheetXml)) !== null) {
    if (isHeader) {
      isHeader = false;
      continue; // Bỏ qua dòng tiêu đề
    }
    const rowContent = m[1];
    const cellRegex = /<c\s+r="([A-Z]+)(\d+)"(?:\s+s="[^"]*")?(?:\s+t="([^"]*)")?[^>]*>(?:<v>(.*?)<\/v>)?<\/c>/g;
    const rowData: Record<string, string> = {};
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const col = cellMatch[1];
      const type = cellMatch[3];
      const val = cellMatch[4] ?? '';
      let cellVal = val;
      if (type === 's') {
        const idx = parseInt(val, 10);
        cellVal = sharedStrings[idx] ?? '';
      }
      rowData[col] = cellVal;
    }

    if (rowData['A'] || rowData['B']) {
      parsedRows.push({
        employeeCode: rowData['A'] || '',
        fullName: rowData['B'] || '',
        identityNumber: rowData['C'] || '',
        position: rowData['D'] || '',
        departmentCodeOrName: rowData['E'] || '',
        email: rowData['F'] || '',
        phoneNumber: rowData['G'] || ''
      });
    }
  }

  return parsedRows;
}
