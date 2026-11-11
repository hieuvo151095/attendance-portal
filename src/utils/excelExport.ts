/**
 * Finviet Attendance Portal - Excel (.xlsx) OpenXML Export Engine
 * Thuần TypeScript, không phụ thuộc thư viện ngoài (zero external dependencies).
 * Tạo file bảng tính chuẩn OpenXML (.xlsx) với đầy đủ định dạng:
 * - Màu sắc nhận diện Finviet Design System (Primary Blue #0070CE, Slate #1E293B)
 * - Khối Quốc hiệu, Đơn vị, Tiêu đề biên bản / Báo cáo
 * - Bảng số liệu chi tiết đúng 1:1 theo giao diện hiển thị
 * - Nhãn trạng thái (Đúng giờ, Đi muộn, Vắng mặt, Nghỉ phép) có màu nền chuyên nghiệp
 * - Border viền ô, căn lề (trái/giữa/phải), độ rộng cột và ô gộp (merge cells)
 */

export type ExcelStyleId =
  | 'default'
  | 'textCenter'
  | 'textRight'
  | 'header'
  | 'headerDark'
  | 'subHeader'
  | 'title'
  | 'subtitle'
  | 'section'
  | 'borderLeft'
  | 'borderCenter'
  | 'borderRight'
  | 'boldBorderLeft'
  | 'boldBorderCenter'
  | 'boldBorderRight'
  | 'badgeSuccess'
  | 'badgeWarning'
  | 'badgeDanger'
  | 'badgeInfo'
  | 'metaLabel'
  | 'metaValue';

export interface ExcelCell {
  value: string | number | null | undefined;
  style?: ExcelStyleId;
  colSpan?: number;
  rowSpan?: number;
}

export interface ExcelRow {
  cells: ExcelCell[];
  height?: number;
}

export interface ExcelColumn {
  width?: number; // Độ rộng ký tự, ví dụ: 8, 20, 30
}

export interface ExcelSheetDefinition {
  name: string;
  columns?: ExcelColumn[];
  rows: ExcelRow[];
}

// Bảng tra cứu CRC32 chuẩn
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function computeCrc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Đóng gói các tệp thành file ZIP chuẩn (Store / Uncompressed method 0)
 * Hoạt động trơn tru cả trên trình duyệt và Node.js/Vitest
 */
function buildZipArchive(
  files: Array<{ name: string; data: Uint8Array | string }>
): Uint8Array {
  const encoder = new TextEncoder();
  interface FileRecord {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    localHeader: Uint8Array;
    offset: number;
    crc: number;
    size: number;
  }

  const records: FileRecord[] = [];
  let currentOffset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes =
      typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
    const crc = computeCrc32(dataBytes);
    const size = dataBytes.length;

    // Header tệp cục bộ (30 bytes + name length)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(
      localHeader.buffer,
      localHeader.byteOffset,
      localHeader.byteLength
    );
    lv.setUint32(0, 0x04034b50, true); // Signature
    lv.setUint16(4, 20, true); // Version 2.0
    lv.setUint16(6, 0, true); // General purpose flags
    lv.setUint16(8, 0, true); // Compression method = 0 (Store)
    lv.setUint16(10, 0, true); // Time
    lv.setUint16(12, 0, true); // Date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // Compressed size
    lv.setUint32(22, size, true); // Uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // Extra field length
    localHeader.set(nameBytes, 30);

    records.push({
      nameBytes,
      dataBytes,
      localHeader,
      offset: currentOffset,
      crc,
      size
    });

    currentOffset += localHeader.length + dataBytes.length;
  }

  const centralDirStart = currentOffset;
  const centralDirHeaders: Uint8Array[] = [];

  for (const rec of records) {
    // Header thư mục trung tâm (46 bytes + name length)
    const cdHeader = new Uint8Array(46 + rec.nameBytes.length);
    const cv = new DataView(
      cdHeader.buffer,
      cdHeader.byteOffset,
      cdHeader.byteLength
    );
    cv.setUint32(0, 0x02014b50, true); // Central header signature
    cv.setUint16(4, 20, true); // Version made by
    cv.setUint16(6, 20, true); // Version needed
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, rec.crc, true);
    cv.setUint32(20, rec.size, true);
    cv.setUint32(24, rec.size, true);
    cv.setUint16(28, rec.nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, rec.offset, true); // Offset of local header
    cdHeader.set(rec.nameBytes, 46);

    centralDirHeaders.push(cdHeader);
    currentOffset += cdHeader.length;
  }

  const centralDirSize = currentOffset - centralDirStart;

  // End of Central Directory (EOCD - 22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer, eocd.byteOffset, eocd.byteLength);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, records.length, true);
  ev.setUint16(10, records.length, true);
  ev.setUint32(12, centralDirSize, true);
  ev.setUint32(16, centralDirStart, true);
  ev.setUint16(20, 0, true);

  // Tổng hợp toàn bộ buffer
  let totalLength = 0;
  for (const rec of records) {
    totalLength += rec.localHeader.length + rec.dataBytes.length;
  }
  for (const cdh of centralDirHeaders) {
    totalLength += cdh.length;
  }
  totalLength += eocd.length;

  const result = new Uint8Array(totalLength);
  let writePos = 0;

  for (const rec of records) {
    result.set(rec.localHeader, writePos);
    writePos += rec.localHeader.length;
    result.set(rec.dataBytes, writePos);
    writePos += rec.dataBytes.length;
  }

  for (const cdh of centralDirHeaders) {
    result.set(cdh, writePos);
    writePos += cdh.length;
  }

  result.set(eocd, writePos);
  return result;
}

/**
 * Chuyển số cột (0-indexed) thành chữ cái Excel: 0 -> A, 1 -> B, ..., 26 -> AA
 */
function colIndexToLetter(colIndex: number): string {
  let letter = '';
  let c = colIndex + 1;
  while (c > 0) {
    const mod = (c - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    c = Math.floor((c - mod) / 26);
  }
  return letter;
}

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Bảng ánh xạ Style ID sang index trong CellXfs của OpenXML styles.xml
 */
const STYLE_MAP: Record<ExcelStyleId, number> = {
  default: 0,
  textCenter: 1,
  textRight: 2,
  header: 3,
  headerDark: 4,
  subHeader: 5,
  title: 6,
  subtitle: 7,
  section: 8,
  borderLeft: 9,
  borderCenter: 10,
  borderRight: 11,
  boldBorderLeft: 12,
  boldBorderCenter: 13,
  boldBorderRight: 14,
  badgeSuccess: 15,
  badgeWarning: 16,
  badgeDanger: 17,
  badgeInfo: 18,
  metaLabel: 19,
  metaValue: 20
};

function generateStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="11">
    <!-- 0: Calibri 10pt normal -->
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Calibri"/></font>
    <!-- 1: Calibri 10pt bold -->
    <font><b/><sz val="10"/><color rgb="FF1E293B"/><name val="Calibri"/></font>
    <!-- 2: Calibri 11pt bold white -->
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <!-- 3: Calibri 14pt bold primary blue -->
    <font><b/><sz val="14"/><color rgb="FF004C8C"/><name val="Calibri"/></font>
    <!-- 4: Calibri 11pt bold primary blue -->
    <font><b/><sz val="11"/><color rgb="FF004C8C"/><name val="Calibri"/></font>
    <!-- 5: Calibri 9.5pt italic subtle slate -->
    <font><i/><sz val="9.5"/><color rgb="FF64748B"/><name val="Calibri"/></font>
    <!-- 6: Calibri 10pt bold success green -->
    <font><b/><sz val="10"/><color rgb="FF15803D"/><name val="Calibri"/></font>
    <!-- 7: Calibri 10pt bold warning yellow/orange -->
    <font><b/><sz val="10"/><color rgb="FFA16207"/><name val="Calibri"/></font>
    <!-- 8: Calibri 10pt bold danger red -->
    <font><b/><sz val="10"/><color rgb="FFB91C1C"/><name val="Calibri"/></font>
    <!-- 9: Calibri 10pt bold info blue -->
    <font><b/><sz val="10"/><color rgb="FF1D4ED8"/><name val="Calibri"/></font>
    <!-- 10: Calibri 10pt bold slate 700 -->
    <font><b/><sz val="10"/><color rgb="FF334155"/><name val="Calibri"/></font>
  </fonts>
  <fills count="9">
    <!-- 0: None -->
    <fill><patternFill patternType="none"/></fill>
    <!-- 1: Gray125 (yêu cầu chuẩn OpenXML) -->
    <fill><patternFill patternType="gray125"/></fill>
    <!-- 2: Primary Blue #0070CE -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF0070CE"/></patternFill></fill>
    <!-- 3: Dark Slate #1E293B -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E293B"/></patternFill></fill>
    <!-- 4: Subheader Gray #F1F5F9 -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
    <!-- 5: Success Soft Green #DCFCE7 -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></patternFill></fill>
    <!-- 6: Warning Soft Yellow #FEF9C3 -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF9C3"/></patternFill></fill>
    <!-- 7: Danger Soft Red #FEE2E2 -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/></patternFill></fill>
    <!-- 8: Info Soft Blue #EFF6FF -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/></patternFill></fill>
  </fills>
  <borders count="2">
    <!-- 0: No border -->
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <!-- 1: Thin border #CBD5E1 -->
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="21">
    <!-- 0: default -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="center"/></xf>
    <!-- 1: textCenter -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 2: textRight -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 3: header (#0070CE, white bold, center) -->
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 4: headerDark (#1E293B, white bold, center) -->
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 5: subHeader (#F1F5F9, dark bold, center) -->
    <xf numFmtId="0" fontId="1" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 6: title (14pt #004C8C bold, center) -->
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 7: subtitle (9.5pt italic subtle, center) -->
    <xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 8: section (11pt bold primary, left) -->
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <!-- 9: borderLeft -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <!-- 10: borderCenter -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 11: borderRight -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 12: boldBorderLeft -->
    <xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <!-- 13: boldBorderCenter -->
    <xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 14: boldBorderRight -->
    <xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 15: badgeSuccess (#DCFCE7, text #15803D bold, center) -->
    <xf numFmtId="0" fontId="6" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 16: badgeWarning (#FEF9C3, text #A16207 bold, center) -->
    <xf numFmtId="0" fontId="7" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 17: badgeDanger (#FEE2E2, text #B91C1C bold, center) -->
    <xf numFmtId="0" fontId="8" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 18: badgeInfo (#EFF6FF, text #1D4ED8 bold, center) -->
    <xf numFmtId="0" fontId="9" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 19: metaLabel (bold slate, right) -->
    <xf numFmtId="0" fontId="10" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 20: metaValue (normal, left) -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
  </cellXfs>
</styleSheet>`;
}

function generateWorksheetXml(sheet: ExcelSheetDefinition): string {
  const merges: string[] = [];
  const rowsXml: string[] = [];

  // Khai báo độ rộng cột
  let colsXml = '';
  if (sheet.columns && sheet.columns.length > 0) {
    colsXml = '<cols>';
    sheet.columns.forEach((col, idx) => {
      const colNum = idx + 1;
      const width = col.width || 15;
      colsXml += `<col min="${colNum}" max="${colNum}" width="${width}" customWidth="1"/>`;
    });
    colsXml += '</cols>';
  }

  sheet.rows.forEach((row, rowIdx) => {
    const rowNum = rowIdx + 1;
    const htAttr = row.height ? ` ht="${row.height}" customHeight="1"` : '';
    let cellsXml = '';
    let colIdx = 0;

    row.cells.forEach((cell) => {
      const colSpan = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;
      const cellRef = `${colIndexToLetter(colIdx)}${rowNum}`;
      const styleId = cell.style ? STYLE_MAP[cell.style] ?? 0 : 0;

      // Xử lý Merge cell
      if (colSpan > 1 || rowSpan > 1) {
        const endCol = colIdx + colSpan - 1;
        const endRow = rowNum + rowSpan - 1;
        merges.push(`${cellRef}:${colIndexToLetter(endCol)}${endRow}`);
      }

      // Xử lý giá trị
      if (cell.value === null || cell.value === undefined || cell.value === '') {
        cellsXml += `<c r="${cellRef}" s="${styleId}"/>`;
      } else if (typeof cell.value === 'number') {
        cellsXml += `<c r="${cellRef}" s="${styleId}"><v>${cell.value}</v></c>`;
      } else {
        const escaped = escapeXml(cell.value);
        cellsXml += `<c r="${cellRef}" s="${styleId}" t="inlineStr"><is><t xml:space="preserve">${escaped}</t></is></c>`;
      }

      colIdx += colSpan;
    });

    rowsXml.push(`<row r="${rowNum}"${htAttr}>${cellsXml}</row>`);
  });

  let mergeCellsXml = '';
  if (merges.length > 0) {
    mergeCellsXml = `<mergeCells count="${merges.length}">` +
      merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('') +
      '</mergeCells>';
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${colsXml}
  <sheetData>
    ${rowsXml.join('\n')}
  </sheetData>
  ${mergeCellsXml}
</worksheet>`;
}

/**
 * Tạo binary buffer Uint8Array của file .xlsx
 */
export function generateExcelBuffer(sheet: ExcelSheetDefinition): Uint8Array {
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const safeSheetName = escapeXml(sheet.name.slice(0, 31) || 'Báo cáo');
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const stylesXml = generateStylesXml();
  const sheet1Xml = generateWorksheetXml(sheet);

  return buildZipArchive([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: rootRelsXml },
    { name: 'xl/_rels/workbook.xml.rels', data: wbRelsXml },
    { name: 'xl/workbook.xml', data: workbookXml },
    { name: 'xl/styles.xml', data: stylesXml },
    { name: 'xl/worksheets/sheet1.xml', data: sheet1Xml }
  ]);
}

/**
 * Tải file Excel (.xlsx) trực tiếp trên trình duyệt
 */
export function downloadExcelFile(sheet: ExcelSheetDefinition, fileName: string): void {
  const buffer = generateExcelBuffer(sheet);
  const blob = new Blob([buffer as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const cleanName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Trì hoãn việc thu hồi URL để trình duyệt kịp hoàn tất tiến trình tải file ngầm
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 1000);
  }
}
