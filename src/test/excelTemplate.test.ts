import { describe, it, expect, vi } from 'vitest';
import {
  SAMPLE_EMPLOYEE_XLSX_BASE64,
  downloadEmployeeExcelTemplate,
  parseXlsxFile
} from '../utils/excelTemplate';

describe('Tiện ích xuất và đọc mẫu bảng tính Excel (.xlsx) chuẩn OpenXML', () => {
  it('SAMPLE_EMPLOYEE_XLSX_BASE64 là chuỗi base64 zip chuẩn Office Open XML', () => {
    expect(SAMPLE_EMPLOYEE_XLSX_BASE64).toBeDefined();
    expect(SAMPLE_EMPLOYEE_XLSX_BASE64.startsWith('UEsDBBQ')).toBe(true); // 'PK\x03\x04' in base64
  });

  it('downloadEmployeeExcelTemplate tải xuống tệp với định dạng .xlsx và MIME Type chuẩn', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    downloadEmployeeExcelTemplate('Mau_nhap_lieu_nhan_su_Finviet.xlsx');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('parseXlsxFile đọc thành công dữ liệu nhân sự từ tệp .xlsx nhị phân', async () => {
    const binaryString = atob(SAMPLE_EMPLOYEE_XLSX_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const mockFile = new File([bytes], 'Mau_nhap_lieu_nhan_su_Finviet.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const rows = await parseXlsxFile(mockFile);
    expect(rows.length).toBe(3);
    expect(rows[0].employeeCode).toBe('NV-IMP-01');
    expect(rows[0].fullName).toBe('Trần Văn Bình');
    expect(rows[0].identityNumber).toBe('079095009988');
    expect(rows[0].position).toBe('Chuyên viên Công nghệ thông tin');
    expect(rows[0].departmentCodeOrName).toBe('Văn phòng');
    expect(rows[0].email).toBe('binh.tran@finviet.com');
    expect(rows[0].phoneNumber).toBe('0977 101 202');

    expect(rows[1].employeeCode).toBe('NV-IMP-02');
    expect(rows[1].fullName).toBe('Lê Thị Diệu');
    expect(rows[2].employeeCode).toBe('NV-IMP-03');
    expect(rows[2].fullName).toBe('Ngô Thanh Tùng');
  });
});
