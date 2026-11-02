#!/usr/bin/env python3
"""Sub-modules that are NOT in the audit report (bao-cao-nghiep-vu-tien-do.html) and therefore not in modules_full.json.
They are requested by the product owner and specified here (proposed, to be confirmed). The generator adds them to the board as extra cards;
they are left out of the audit totals (37 sub-modules, 211 requirements)."""

def row(n, title, todo):
    return ['R%02d %s' % (n, title), '✕ Chưa làm: sub-module mới, chưa có trong báo cáo audit', todo]

LOGIN_ROWS = [
  row(1, 'Trang đăng nhập có hai cách vào: tab "Tài khoản" và tab "SSO"', 'Màn hình theo /{schoolCode}/login, hiện tên và logo trường (lấy từ Trường). Portal cũ có tab "Đăng nhập SSO" nhưng chưa ai kiểm tra (00-inventory).'),
  row(2, 'Đăng nhập bằng tài khoản', 'Email hoặc tên tài khoản + mật khẩu (có nút hiện/ẩn). Thành công thì tạo phiên (NextAuth, cookie JWT/JWE; token Sanctum id|token cho API) và chuyển tới trang đầu tiên người đó được phép vào.'),
  row(3, 'Điều kiện được vào portal', 'Tài khoản phải đang hoạt động (Tài khoản BR06) và có vai trò Admin, Quản lý, Giáo viên hoặc Nhân viên. Phụ huynh và Học sinh dùng ứng dụng, không vào portal. [Cần xác nhận]'),
  row(4, 'Thông báo lỗi khi đăng nhập', 'Sai thông tin, tài khoản bị tắt, lời mời chưa kích hoạt, không có quyền: mỗi trường hợp một thông báo rõ ràng nhưng không để lộ tài khoản có tồn tại hay không.'),
  row(5, 'Kích hoạt lần đầu', 'Người dùng nhận email lời mời (Tài khoản "Tạo và gửi lời mời"; Giáo viên BR03), đặt mật khẩu lần đầu rồi vào portal.'),
  row(6, 'Quên mật khẩu / đặt lại mật khẩu', 'Gửi liên kết đặt lại qua email, liên kết hết hạn sau một khoảng thời gian. Không có trong các PRD cũ. [Cần xác nhận] thời hạn liên kết.'),
  row(7, 'Đăng nhập SSO của Sở GD&ĐT', 'Nút "Đăng nhập bằng Sở GD&ĐT": chuyển sang cổng SSO của Sở, người dùng chọn trường, rồi được chuyển tiếp tới cổng đăng nhập của trường đó và nhận phiên (theo mô tả của chủ sản phẩm 23/10/2026). [Cần xác nhận] giao thức (OIDC hay SAML) và nơi người dùng nhập mật khẩu.'),
  row(8, 'Khớp tài khoản SSO với tài khoản CSDL Sở', 'Tài khoản đồng bộ từ CSDL Sở có synced = true và bị khoá sửa họ tên, trạng thái (Tài khoản BR05, BR06). SSO phải khớp được với tài khoản này; không khớp thì báo "chưa được cấp quyền ở trường". [Cần xác nhận] khoá để khớp và có tự tạo tài khoản ở lần đăng nhập đầu hay không.'),
  row(9, 'Một người thuộc nhiều trường', 'Sau khi xác thực, nếu tài khoản thuộc nhiều trường thì hiện màn chọn trường (luồng SSO đã có bước chọn trường). [Cần xác nhận]'),
  row(10, 'Phiên và Đăng xuất', 'Hết hạn và làm mới phiên. Nút Đăng xuất hiện hộp xác nhận: Hủy thì giữ phiên, Xác nhận thì huỷ phiên và về trang đăng nhập (Khác BR12). Phần tối thiểu này phải có trước khi phát hành M4.'),
  row(11, 'Bảo mật đăng nhập', 'Khoá tạm sau nhiều lần sai, HTTPS, cookie HttpOnly và SameSite, chống CSRF, nhật ký đăng nhập (ai, lúc nào, kênh Tài khoản hay SSO). Chính sách mật khẩu. [Cần xác nhận]'),
  row(12, 'Ngôn ngữ trang đăng nhập', 'Tiếng Việt hoặc Tiếng Anh theo trình duyệt hay theo Trường (ngôn ngữ mặc định); sau khi đăng nhập dùng ngôn ngữ đã lưu của tài khoản (Khác BR07).'),
]

NEW = [{
  'code': 'M7/SM2', 'g': 'M7', 'gl': 'Khác', 'name': 'Đăng nhập', 'new': True,
  'quick': 'Màn hình đăng nhập của portal: đăng nhập bằng tài khoản (email hoặc tên tài khoản + mật khẩu) hoặc bằng SSO từ cổng Sở GD&ĐT (chọn trường rồi chuyển sang cổng đăng nhập của trường). Gồm kích hoạt lần đầu, quên mật khẩu, phiên và Đăng xuất.',
  'routes': ['/{schoolCode}/login (đề xuất)'],
  'rows': LOGIN_ROWS,
  'have': ['Tab "Đăng nhập SSO" trên trang đăng nhập của portal cũ, chưa được kiểm tra (00-inventory).', 'Hộp xác nhận Đăng xuất của portal cũ (Khác BR12).'],
  'missing': ['Toàn bộ màn hình đăng nhập mới: tab Tài khoản và tab SSO.', 'Đặt lại mật khẩu và kích hoạt lần đầu qua email.', 'Khớp tài khoản SSO với tài khoản CSDL Sở và chọn trường.', 'Khoá tạm, nhật ký đăng nhập, quản lý phiên.'],
  'verify': ['Tab SSO cũ thực sự hoạt động thế nào: có phải đường vào từ portal quản lý hoặc từ Sở không?', 'Tài khoản CSDL Sở đăng nhập bằng gì, và có thêm được mật khẩu riêng ở trường không?', 'Tài khoản Phụ huynh và Học sinh có được vào portal không?'],
  'need': ['Tài liệu giao thức và môi trường thử của cổng SSO Sở GD&ĐT (địa chỉ, client id, địa chỉ callback).', 'Dịch vụ email gửi lời mời và đặt lại mật khẩu.', 'Tài khoản Admin đầu tiên do Finviet tạo (xem checklist khởi tạo trường).', 'Mã trường (schoolCode) và tên miền cho từng trường.'],
  'steps': ['Đăng nhập bằng tài khoản, phiên, Đăng xuất, kích hoạt lần đầu: đủ để chạy M4.', 'Quên mật khẩu, khoá tạm, nhật ký đăng nhập.', 'SSO Sở GD&ĐT: chọn trường, callback, khớp tài khoản; chạy thử với một trường thật.'],
  'close': ['Admin do Finviet tạo đăng nhập được, tạo được người dùng Kế toán và người đó đăng nhập được.', 'Sai mật khẩu hoặc tài khoản bị tắt bị chặn với đúng thông báo.', 'Đăng xuất huỷ phiên.', 'SSO: người dùng chọn trường, vào đúng trường với đúng vai trò; tài khoản không khớp bị từ chối.'],
  'deps': ['M6/SM2', 'M6/SM1', 'M5/SM2', 'M7/SM1'],
}]
