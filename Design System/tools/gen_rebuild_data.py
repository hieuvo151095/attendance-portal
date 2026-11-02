#!/usr/bin/env python3
"""Generates the data of the "Rebuild School Portal Roadmap" board (const ROADMAP2).
Input : modules_full.json (extracted from the audit report bao-cao-nghiep-vu-tien-do.html, audit 22/10/2026).
Output: JavaScript on stdout.   Usage: python3 gen_rebuild_data.py > ../src/rebuild_data.js

Rules baked in (from the product owner):
 - What the report calls "đã làm" is only the portal UI. Nothing is integrated with the core yet, so no module counts as done.
 - Focus order of the module groups: M5 Nhà trường, M6 Cấu hình, M4 Tài chính, M2 Vận hành, M3 Học tập, M1 Tổng quan, M7 Khác.
 - The core that M4 and M2 run on: student, teacher, class, subject, menu (+ school year, grade level, school profile, accounts).
 - Sub-modules of M5/M6 that are not needed at the beginning are deferred until just before the module that uses them.
The schedule is a proposal (the report has no dates): work streams per phase, length from the number of requirements.
  - Goal: all 7 modules released by the end of April 2027 (END). Lunar New Year 4-10/2/2027: the first two weeks of February (BREAK) carry no work.
  - One colour per module; cards show only the sub-module name (no kind, no UI badge).
  - Extra sub-modules outside the audit come from new_modules.py (NEW).
  - The schedule is the owner layout (LAYOUT) checked against the PRD dependencies (NEEDS / SOFT); see the self-checks below."""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
mods = json.load(open(os.path.join(HERE, 'modules_full.json'), encoding='utf-8'))
by = {m['code']: m for m in mods}
from new_modules import NEW   # sub-modules requested after the audit (not in modules_full.json)
allmods = mods + NEW
by.update({m['code']: m for m in NEW})

TITLE = {'M1/SM1':'Tổng quan','M2/SM1':'Điểm danh','M2/SM2':'Hoạt động','M2/SM3':'Thư viện','M2/SM4':'Trao đổi','M2/SM5':'Báo cáo (Điểm danh)','M2/SM6':'Báo cáo (Mở rộng)',
 'M3/SM1':'Thời khoá biểu','M3/SM2':'Bài tập','M3/SM3':'Điểm & Đánh giá',
 'M4/SM1':'Học phí','M4/SM2':'Đối soát','M4/SM3':'Khoản phí','M4/SM4':'Quản lý học phí','M4/SM5':'Khoản chi','M4/SM6':'Báo cáo (Học phí)',
 'M5/SM1':'Học sinh','M5/SM2':'Giáo viên','M5/SM3':'Lớp học','M5/SM4':'Môn học','M5/SM5':'Khối lớp','M5/SM6':'Bảng thông tin','M5/SM7':'Bình chọn','M5/SM8':'Thực đơn','M5/SM9':'Điểm danh NV','M5/SM10':'Sổ tay PH','M5/SM11':'Góp ý','M5/SM12':'Lịch sự kiện','M5/SM13':'Năm học','M5/SM14':'Lưu trữ',
 'M6/SM1':'Trường','M6/SM2':'Tài khoản','M6/SM3':'Học phí','M6/SM4':'Nhận diện','M6/SM5':'Tính năng','M6/SM6':'Thông báo','M7/SM1':'Khác','M7/SM2':'Đăng nhập'}
# focus order of the lanes: (lane id, label, group, tone, priority label)
LANES = [('m5','Nhà trường','M5','teal','1 · M5'),('m6','Cấu hình','M6','purple','2 · M6'),('m4','Tài chính','M4','blue','3 · M4'),('m2','Vận hành','M2','orange','4 · M2'),('m3','Học tập','M3','green','5 · M3'),('m1','Tổng quan','M1','amber','6 · M1'),('m7','Khác','M7','gray','7 · M7')]
GLYPH = {'C':'✓','P':'◐','N':'✕','U':'?','A':'◇'}
STATE = {'C':'đã làm (giao diện)','P':'làm một phần','N':'chưa làm','U':'chưa đủ bằng chứng','A':'đạt mô phỏng'}
KIND = {'verify':'Giao diện: có phần chính, cần kiểm chứng','missing':'Giao diện: còn thiếu chức năng','source':'Giao diện: mới có xử lý nền, chưa có màn hình','integration':'Giao diện: đạt mô phỏng, chờ tích hợp thật'}
BOILER = 'Dữ liệu kiểm thử, quyền phù hợp và môi trường chạy local.'

# ---- phases: (id, name, items in the order they are worked on) ----
PHASES = [
  ('1','Milestone 1 (Giai đoạn 1A): dữ liệu lõi bắt buộc cho M4 (M5 + M6 + đăng nhập)',['M7/SM2','M6/SM1','M6/SM2','M5/SM13','M5/SM5','M5/SM1','M5/SM3','M5/SM2','M5/SM12','M6/SM3']),
  ('2','Milestone 1 (Giai đoạn 1B): Tài chính (M4) hoàn thiện trước Tết (31/1/2027)',['M4/SM3','M4/SM4','M4/SM1','M4/SM5','M4/SM2','M4/SM6']),
  ('3','Milestone 2 (Giai đoạn 2): Vận hành (M2) + các phụ thuộc M5/M6 của M2',['M5/SM9','M6/SM4','M6/SM5','M2/SM1','M2/SM2','M2/SM4','M6/SM6','M2/SM5','M2/SM3','M2/SM6']),
  ('4','Milestone 3 (Giai đoạn 3A): phần còn lại của Nhà trường (M5) mở khoá M3 & M1',['M5/SM4','M5/SM6','M5/SM11','M5/SM10','M5/SM8','M5/SM14','M5/SM7']),
  ('5','Milestone 3 (Giai đoạn 3B): Học tập (M3), Tổng quan (M1) và Khác (M7)',['M3/SM1','M3/SM2','M3/SM3','M1/SM1','M7/SM1'])]
BREAK = (5.0, 5.5)   # 1-14/2/2027 (Tết Nguyên đán 4-10/2): nothing is scheduled here
MS2_END = 6.75       # 22/3/2027: Milestone 2 (all M2 sub-modules + M2 dependencies) completes
END = 8.0            # end of April 2027: Milestone 3 (all remaining modules) completes
# ---- schedule: (start, length) in months on the axis Oct 2026 = 1.0 ... Apr 2027 = 7.0 (end of April = 8.0), quarter-month steps ----
# Milestone 1 (< 5.0 = 31/1/2027): UNCHANGED — ONLY the 6 M4 sub-modules and their 10 prerequisites (including Trường M6/SM1 for onboarding).
# Milestone 2 (5.5 .. 6.75 = 15/2 .. 22/3/2027): All 6 M2 (Vận hành) sub-modules + the 4 M5/M6 sub-modules that M2 depends on (M5/SM9, M6/SM4, M6/SM5, M6/SM6).
# Milestone 3 (6.75 .. 8.0 = 22/3 .. 30/4/2027): All the rest (7 remaining M5 sub-modules starting with Môn học M5/SM4 & Bảng thông tin M5/SM6 at 6.75..7.25, then M3 Học tập, M5 Thực đơn/Lưu trữ/Bình chọn, M1 Tổng quan, M7 Khác at 7.25..8.0).
LAYOUT = {
  # ---- Milestone 1 (1.75 .. 5.0) — DO NOT CHANGE ----
  'M5/SM13':(1.75,.5),'M5/SM5':(1.75,.5),'M5/SM1':(2.0,.75),'M6/SM2':(1.75,.5),
  'M5/SM3':(2.25,.5),'M5/SM2':(2.25,.75),'M5/SM12':(2.5,.5),
  'M6/SM3':(2.25,.75),'M6/SM1':(2.75,.5),
  'M7/SM2':(1.75,1.0),
  'M4/SM3':(3.0,.75),'M4/SM4':(3.0,.75),'M4/SM1':(3.75,.75),'M4/SM5':(3.75,.5),'M4/SM2':(3.75,.75),'M4/SM6':(4.25,.5),
  # ---- Milestone 2 (5.5 .. 6.75): M2 Vận hành + M2 dependencies in M5/M6 ----
  'M5/SM9':(5.5,.5),'M6/SM4':(5.5,.75),'M6/SM5':(5.5,.5),'M6/SM6':(6.0,.75),
  'M2/SM1':(5.5,.75),'M2/SM2':(5.5,.75),'M2/SM4':(5.5,.75),
  'M2/SM5':(6.25,.5),'M2/SM3':(6.25,.5),'M2/SM6':(6.25,.5),
  # ---- Milestone 3 (6.75 .. 8.0): All the rest (remaining M5, M3 Học tập, M1 Tổng quan, M7 Khác) ----
  'M5/SM4':(6.75,.5),'M5/SM6':(6.75,.5),'M5/SM11':(6.75,.5),'M5/SM10':(6.75,.5),
  'M5/SM8':(7.25,.5),'M5/SM14':(7.25,.5),'M5/SM7':(7.25,.5),
  'M3/SM1':(7.25,.5),'M3/SM2':(7.25,.5),'M3/SM3':(7.5,.5),
  'M1/SM1':(7.25,.75),'M7/SM1':(7.25,.75)}
# what each sub-module has to wait for = HARD dependencies found in the PRDs (a card may start once the dependency has started
# and its data contract exists; the board warns when it starts before the dependency starts)
NEEDS = {
  'M6/SM2':[],'M6/SM1':[],'M5/SM13':[],'M5/SM12':[],'M6/SM3':[],'M4/SM3':[],
  'M5/SM5':['M5/SM13'],'M5/SM3':['M5/SM5','M5/SM13'],'M5/SM1':['M5/SM13'],'M5/SM2':['M6/SM2'],
  'M5/SM4':['M5/SM13','M5/SM5','M5/SM2'],'M5/SM8':['M5/SM3'],'M5/SM9':['M5/SM2','M6/SM2'],'M5/SM14':['M5/SM1'],
  'M5/SM6':['M5/SM3','M5/SM2','M5/SM1','M6/SM2'],'M5/SM7':['M5/SM3','M5/SM1'],'M5/SM10':['M6/SM2'],'M5/SM11':['M5/SM1','M5/SM3','M5/SM13','M5/SM2','M6/SM2'],
  'M6/SM4':['M5/SM1','M5/SM3'],'M6/SM5':['M5/SM13'],'M6/SM6':['M6/SM2','M5/SM3'],
  'M4/SM4':['M4/SM3','M5/SM3','M5/SM1','M5/SM5'],
  'M4/SM1':['M4/SM3','M4/SM4','M5/SM1','M5/SM3','M5/SM5','M6/SM2','M6/SM3','M5/SM12'],
  'M4/SM5':['M5/SM1','M5/SM2','M6/SM2'],'M4/SM2':['M4/SM1','M5/SM1','M5/SM3'],'M4/SM6':['M4/SM1','M5/SM3','M5/SM1'],
  'M2/SM1':['M6/SM1','M5/SM3','M5/SM1','M6/SM2'],'M2/SM2':['M5/SM3','M6/SM2'],'M2/SM3':['M2/SM2','M2/SM1','M5/SM3','M5/SM1'],
  'M2/SM4':['M6/SM2','M5/SM1','M5/SM3'],'M2/SM5':['M2/SM1','M5/SM9'],'M2/SM6':['M5/SM1','M5/SM3'],
  'M3/SM1':['M5/SM3','M5/SM13','M5/SM4'],'M3/SM2':['M5/SM3','M5/SM4','M5/SM1'],'M3/SM3':['M5/SM3','M5/SM4','M5/SM1','M5/SM13','M5/SM5','M5/SM2'],
  'M1/SM1':['M5/SM1','M5/SM3','M5/SM2','M4/SM1','M4/SM5'],'M7/SM1':['M6/SM2','M7/SM2'],'M7/SM2':['M6/SM2']}
# soft / optional links (free text, shown in the panel)
SOFT = {
  'M5/SM5':['Trường (cấp học; có thể nạp sẵn)'],'M5/SM1':['Lớp học (gán lớp)','Tài khoản (liên kết phụ huynh)'],'M5/SM3':['Giáo viên (GVCN, không bắt buộc)'],
  'M5/SM4':['Trường (cấp học)'],'M5/SM8':['Bảng thông tin (gửi thông báo thực đơn)'],
  'M6/SM3':['Trường (bảng giờ hoạt động chỉ để xem)','Thông báo'],
  'M4/SM3':['Lớp học (chỉ cửa sổ xem lớp)','Cấu hình học phí (cờ xuất HĐĐT)'],'M4/SM4':['Cấu hình học phí (HĐĐT chỉ xem)'],
  'M4/SM1':['Thông báo (gửi, nhắc quá hạn)','Điểm danh (số ngày ăn thực tế, hoàn tiền; chưa có thì nhập tay)','Cổng thanh toán (Sepay hoặc Ví FinViet / QR Ecopay)','Ứng dụng phụ huynh'],
  'M4/SM5':['Thông báo','Ứng dụng phụ huynh (thông báo hoàn tiền)'],'M4/SM2':['Cấu hình học phí (email đối soát)','Giao dịch thật từ cổng thanh toán'],
  'M4/SM6':['Lưu trữ (trạng thái lưu trữ của học sinh)','Tài khoản (Tạo bởi)'],
  'M6/SM6':['Học phí','Điểm danh'],'M6/SM4':['Điểm danh','Thư viện'],'M6/SM5':['Hoạt động (bật/tắt bình luận)'],
  'M2/SM1':['Nhận diện','Học phí (cờ hoàn tiền)'],'M2/SM2':['Tính năng','Học sinh và Giáo viên (gắn thẻ @)'],'M2/SM3':['Nhận diện'],
  'M2/SM4':['Giáo viên','Điểm danh (dữ liệu báo vắng)','Thông báo'],'M2/SM5':['Trường','Khoản phí (phí trả học sinh trễ)'],
  'M3/SM1':['Bảng thông tin'],'M1/SM1':['Điểm danh','Hoạt động','Thư viện','Trao đổi','Bảng thông tin','Góp ý (mỗi thẻ nạp dần khi module nguồn xong)'],
  'M7/SM1':['Học phí (tab thông báo Học phí)'],
  'M7/SM2':['Trường (tên, logo trên trang đăng nhập)','Giáo viên (tạo tài khoản giáo viên)','Cổng SSO của Sở GD&ĐT (bên ngoài)','Dịch vụ email (lời mời, đặt lại mật khẩu)']}
DEFERRED = {'M5/SM4','M5/SM6','M5/SM7','M5/SM8','M5/SM9','M5/SM10','M5/SM11','M5/SM14','M6/SM4','M6/SM5','M6/SM6'}
# notes for the release of M4 that the generic rule cannot say
M4NOTE = {
  'M5/SM12':'Suy luận: nguồn "Ngày nghỉ" cho số ngày ăn trên hóa đơn (chưa có tài liệu nêu rõ), cần chủ sản phẩm xác nhận',
  'M2/SM1':'Không bắt buộc: bản M4 đầu nhập tay số ngày ăn và hoàn tiền; nối Điểm danh khi M2 xong',
  'M6/SM6':'Không bắt buộc: chỉ cấu hình nhắc phí tự động (đã chuyển về sau tháng 2/2027)',
  'M5/SM8':'Không cần: tiền ăn là đơn giá × số ngày, không đọc thực đơn (đã chuyển về sau tháng 2/2027)',
  'M5/SM4':'Không cần: chỉ dùng cho Học tập M3 (đã chuyển về sau tháng 2/2027)',
  'M6/SM1':'Cấu hình hồ sơ trường và giờ hoạt động khi onboard trường mới trước khi chạy M4; làm ngay sau Đăng nhập',
  'M7/SM1':'Không cần: Đăng xuất nằm trong Đăng nhập (M7/SM2)',
  'M7/SM2':'Sub-module build ĐẦU TIÊN của toàn lộ trình (theo yêu cầu 30/10/2026): hai cách đăng nhập là SSO (chọn Sở GD&ĐT, rồi chọn trường trong danh sách, chuyển sang cổng đăng nhập SSO của Sở) và Đăng nhập bằng tài khoản (mã trường, email, mật khẩu do Finviet cấp)'}
WHY = {
  'M6/SM2':'Gốc: đăng nhập, vai trò (có chức năng Kế toán) và tài khoản phụ huynh nhận hóa đơn. Giáo viên tạo đăng nhập qua đây nên Tài khoản phải bắt đầu trước Giáo viên. Cần cả khung ứng dụng tối thiểu (menu avatar, Đăng xuất) trước khi phát hành M4.',
  'M5/SM13':'Gốc dữ liệu: Khối lớp, Lớp học, Học sinh (bộ lọc, chuyển năm), Góp ý và Học kỳ đều chọn theo năm học. Không logic hóa đơn nào dùng năm học, nhưng module rất nhỏ nên làm trước.',
  'M5/SM5':'Danh mục khối lớp (nạp sẵn, chỉ đọc). Cần cho Lớp học và cho phạm vi Khối lớp khi tạo hóa đơn.',
  'M5/SM3':'Cần Khối lớp và Năm học. Khoản phí, Quản lý học phí, Học phí và Báo cáo đều chia theo lớp (chỉ lớp chính khóa có học phí).',
  'M5/SM1':'Cần Năm học; gán lớp và liên kết phụ huynh làm sau khi có Lớp học và Tài khoản. Là gốc của hóa đơn (mỗi hóa đơn một học sinh), Quản lý học phí, Khoản chi và Đối soát; cần trạng thái lưu trữ để Báo cáo học phí đếm học sinh đã lưu trữ. Cần chốt: số tiền học phí/tiền ăn theo học sinh do Học sinh (BR14) hay Quản lý học phí nắm.',
  'M5/SM2':'Cần Tài khoản (tạo đăng nhập giáo viên). M4 dùng làm danh sách người nhận ở Khoản chi (đối tượng Nhân viên).',
  'M5/SM12':'Nguồn "Ngày nghỉ" cho số ngày ăn trên hóa đơn (suy luận từ Học phí BR06, tài liệu chưa nêu rõ) nên phải xong trước Học phí. Không cần module nào trước.',
  'M5/SM4':'Không cần cho M4 hay M2 nên xếp ở đầu Milestone 3 (22/3–8/4/2027), chạy xong trước khi bắt đầu Học tập (M3). Cần Năm học, Khối lớp và Giáo viên (gán giáo viên cho môn); cấp dữ liệu môn học bắt buộc cho Thời khoá biểu, Bài tập, Điểm & Đánh giá.',
  'M5/SM8':'Không cần cho M4 (tiền ăn là đơn giá × số ngày, không đọc thực đơn) hay M2 nên xếp ở Milestone 3 (8/4–22/4/2027), ngay sau khi Bảng thông tin (M5/SM6) hoàn thành để có thể gửi thông báo thực đơn.',
  'M4/SM3':'Danh mục gốc của mọi khoản thu, không cần module nào trước (Lớp học chỉ cần cho cửa sổ xem lớp). Cần nạp sẵn 3 khoản phí hệ thống. Không có phụ thuộc cứng nên có thể làm sớm hơn để có thêm thời gian đệm trước Tết.',
  'M6/SM3':'Cấu hình mà Học phí đọc: ghi chú hóa đơn, Sepay/QR, HĐĐT, phí trả muộn, báo vắng/hoàn tiền ăn, email đối soát. Không cần module nào trước (bảng giờ hoạt động từ Trường chỉ để xem).',
  'M4/SM4':'Cần Khoản phí (danh sách thêm khoản), Lớp học, Học sinh (hàng ma trận) và Khối lớp (bộ lọc).',
  'M4/SM1':'Cần Khoản phí, Quản lý học phí, Cấu hình học phí, Học sinh, Lớp học, Khối lớp, Tài khoản (quyền gửi) và Lịch sự kiện (ngày nghỉ). Điểm danh (tiền ăn theo ngày thực học, hoàn tiền) và Thông báo là liên kết mềm: bản đầu nhập tay.',
  'M4/SM5':'Độc lập với hóa đơn: cần Học sinh, Giáo viên (người nhận) và quyền Kế toán. Không cần Học phí hay Thông báo.',
  'M4/SM2':'Cần Học phí (hóa đơn) và giao dịch thật từ cổng thanh toán; hiển thị tên trẻ + lớp nên cần Học sinh và Lớp học. Chỉ xem, không ghi.',
  'M4/SM6':'Chỉ đọc hóa đơn: cần Học phí, Lớp học, Học sinh (và trạng thái lưu trữ). Không cần Khoản chi hay Đối soát.',
  'M6/SM6':'Không chặn M4 nhưng cấu hình thông báo cho Điểm danh (M2/SM1), Trao đổi (M2/SM4) và nhắc phí tự động ở Học phí, nên xếp ở Milestone 2 (1/3–22/3/2027) để hoàn thiện trọn vẹn M2 Vận hành và khép kín M6 Cấu hình. Cần Tài khoản và Lớp học.',
  'M6/SM1':'Build thứ hai, ngay sau Đăng nhập (M7/SM2). Xếp ở Giai đoạn 1 (T11/2026) để hoàn tất hồ sơ trường và bảng giờ hoạt động khi onboard trường mới trước khi chạy M4; đồng thời cung cấp quy tắc giờ hoạt động, đến/về muộn cho Điểm danh (M2/SM1).',
  'M5/SM10':'Chỉ cần Tài khoản (không cần Học sinh); không liên quan M4 hay M2 nên xếp ở Milestone 3 (22/3–8/4/2027).',
  'M5/SM9':'Phụ thuộc cứng của Báo cáo (Điểm danh) (M2/SM5 — tab Nhân viên), nên xếp ngay đầu Milestone 2 (15/2–1/3/2027) để xong trước khi làm Báo cáo (Điểm danh). Cần Giáo viên và Tài khoản.',
  'M5/SM6':'Cần Lớp học, Giáo viên, Học sinh (người nhận) và Tài khoản. Không cần cho M2 nên xếp ở đầu Milestone 3 (22/3–8/4/2027) để xong trước khi làm Thời khoá biểu (M3/SM1), Thực đơn (M5/SM8) và Tổng quan (M1/SM1).',
  'M2/SM2':'Thuộc Milestone 2 (M2 Vận hành). Mọi phụ thuộc cứng (Lớp học, Tài khoản) đã xong ở Milestone 1 nên bắt đầu ngay sau Tết (15/2–8/3/2027), chạy song song với Tính năng (M6/SM5) và xong trước Thư viện (M2/SM3).',
  'M6/SM4':'Cần Học sinh và Lớp học (đã xong ở Milestone 1). Tạo dữ liệu nhận diện khuôn mặt AI cho Điểm danh (M2/SM1) và Thư viện (M2/SM3), nên xếp ngay đầu Milestone 2 (15/2–8/3/2027) để xong trước khi làm Thư viện.',
  'M6/SM5':'Cần Năm học (đã xong ở Milestone 1). Gồm bật/tắt bình luận cho Hoạt động (M2/SM2) và cấu hình Học kỳ theo năm học cho Học tập (M3), nên xếp ngay đầu Milestone 2 (15/2–1/3/2027).',
  'M2/SM4':'Thuộc Milestone 2 (M2 Vận hành). Mọi phụ thuộc cứng (Tài khoản, Học sinh, Lớp học) đã xong ở Milestone 1 nên bắt đầu ngay sau Tết (15/2–8/3/2027); báo vắng kết nối với Điểm danh.',
  'M5/SM11':'Cần Học sinh, Lớp học, Năm học, Giáo viên và Tài khoản; không cần cho M2 nên xếp ở đầu Milestone 3 (22/3–8/4/2027) để xong trước khi làm Tổng quan (M1/SM1).',
  'M2/SM1':'Thuộc Milestone 2 (M2 Vận hành). Mọi phụ thuộc cứng (Trường, Lớp học, Học sinh, Tài khoản) đã xong ở Milestone 1 nên bắt đầu ngay sau Tết (15/2–8/3/2027), để kịp mở khoá cho Thư viện (M2/SM3) và Báo cáo (Điểm danh) (M2/SM5), đồng thời nối dữ liệu ngày ăn/hoàn tiền vào Học phí (M4/SM1).',
  'M5/SM14':'Cần Học sinh. M4 chỉ cần trạng thái lưu trữ trong Học sinh, không cần màn hình Lưu trữ nên xếp ở Milestone 3 (8/4–22/4/2027).',
  'M5/SM7':'Cần Lớp học và Học sinh; không liên quan M4 hay M2 nên xếp ở Milestone 3 (8/4–22/4/2027).',
  'M2/SM3':'Thuộc Milestone 2 (M2 Vận hành). Cần Hoạt động (M2/SM2) và Điểm danh (M2/SM1) làm hai album hệ thống, cùng dữ liệu Nhận diện (M6/SM4), nên bắt đầu ngay khi bộ 3 này hoàn thành (8/3–22/3/2027).',
  'M2/SM6':'Thuộc Milestone 2 (M2 Vận hành). Chỉ cần Học sinh và Lớp học (không cần Điểm & Đánh giá); xếp ở nửa sau Milestone 2 (8/3–22/3/2027) để hoàn tất trọn bộ báo cáo vận hành M2.',
  'M2/SM5':'Thuộc Milestone 2 (M2 Vận hành). Cần Điểm danh (M2/SM1) và Điểm danh NV (M5/SM9) cho tab nhân viên, nên bắt đầu ngay sau khi cả hai hoàn thành (8/3–22/3/2027).',
  'M3/SM1':'Thuộc Milestone 3 (M3 Học tập). Cần Lớp học, Năm học (học kỳ) và Môn học (M5/SM4), kèm liên kết mềm Bảng thông tin (M5/SM6), nên bắt đầu ngay khi Môn học và Bảng thông tin hoàn thành (8/4–22/4/2027).',
  'M3/SM2':'Thuộc Milestone 3 (M3 Học tập). Cần Lớp học, Học sinh và Môn học (M5/SM4), nên bắt đầu ngay khi Môn học hoàn thành (8/4–22/4/2027).',
  'M3/SM3':'Thuộc Milestone 3 (M3 Học tập). Cần Lớp học, Môn học (M5/SM4), Học sinh, Năm học, Khối lớp và Giáo viên; xếp ở chặng cuối Milestone 3 (15/4–30/4/2027) sau khi Môn học đã hoàn tất.',
  'M1/SM1':'Thuộc Milestone 3 (M1 Tổng quan). Chỉ đọc và tổng hợp thẻ từ M4 (Học phí, Khoản chi), M2 (Điểm danh, Hoạt động, Thư viện, Trao đổi) và M5 (Học sinh, Lớp học, Giáo viên, Bảng thông tin, Góp ý), nên làm ở chặng cuối (8/4–30/4/2027) khi toàn bộ module nguồn đã hoàn thành.',
  'M7/SM1':'Thuộc Milestone 3 (M7 Khác). Cần Tài khoản (M6/SM2) và Đăng nhập (M7/SM2), kèm tab thông báo Học phí từ M4; xếp ở chặng cuối (8/4–30/4/2027) để hoàn thiện toàn bộ hệ thống.',
  'M7/SM2':'Build ĐẦU TIÊN, bắt đầu cùng lúc với Tài khoản (tuần 22/11). Hai cách đăng nhập: (1) SSO dữ liệu Sở GD&ĐT: chọn Sở, hiện danh sách trường của Sở đó, chọn trường để chuyển tới cổng đăng nhập SSO; (2) Đăng nhập bằng tài khoản: mã trường + email + mật khẩu do Finviet cấp. Mới theo yêu cầu: mọi PRD đều giả định người dùng đã đăng nhập (Admin trường), nên phải có trước khi phát hành M4. Cần Tài khoản (tài khoản, trạng thái, vai trò, lời mời). SSO cần tài liệu giao thức của Sở GD&ĐT (ví dụ HCMEDU SSO).'}
PHASE_OF = {c: p for p in PHASES for c in p[2]}
# everything that has to be finished (started, at least) before M4 can be released = transitive closure of the hard dependencies of the M4 sub-modules
M4_SET = {c for c in NEEDS if c.startswith('M4/')}
M4_NEED = set()
_stack = list(M4_SET)
while _stack:
    for d in NEEDS[_stack.pop()]:
        if d not in M4_NEED and d not in M4_SET: M4_NEED.add(d); _stack.append(d)
M4_NEED.add('M7/SM2')   # release prerequisite (every PRD assumes a logged-in user), not a build dependency of an M4 card
M4_NEED.add('M6/SM1')   # school profile setup during school onboarding before running M4
M2_SET = {c for c in NEEDS if c.startswith('M2/')}
M2_DEP = {'M5/SM9', 'M6/SM4', 'M6/SM5', 'M6/SM6'}   # M5/M6 sub-modules built in Milestone 2 to support M2 Vận hành
MS2_ALL = M2_SET | M2_DEP
MS3_ALL = set(NEEDS) - (M4_SET | M4_NEED | MS2_ALL)
def m4_role(code):
    if code in M4_SET: r = 'Thuộc M4 (Milestone 1 trước Tết)'
    elif code in M4_NEED: r = 'Bắt buộc trước M4 (Milestone 1 trước Tết)'
    elif code in ('M2/SM1', 'M6/SM6'): r = 'Liên kết mềm, không bắt buộc (xếp ở Milestone 2)'
    elif code in MS2_ALL: r = 'Không cần cho M4 (xếp ở Milestone 2: Vận hành M2)'
    else: r = 'Không cần cho M4 (xếp ở Milestone 3: Hoàn thiện các module còn lại)'
    return r + ((': ' + M4NOTE[code]) if code in M4NOTE else '')

def cnt(m):
    s = {}
    for r in m['reqs']: s[r['s']] = s.get(r['s'], 0) + 1
    return s
sched = dict(LAYOUT)
MONTHS = 7
MNAME = ['T10/2026','T11/2026','T12/2026','T1/2027','T2/2027','T3/2027','T4/2027']
# ---- self-checks of the schedule ----
assert set(sched) == {m['code'] for m in allmods} == set(NEEDS) == set(WHY), 'layout / needs / why must cover all 38 sub-modules'
assert sched['M7/SM2'][0] + sched['M7/SM2'][1] <= sched['M4/SM1'][0] + 1e-9, 'login must be finished before Học phí starts'
assert {c for c, (s, p) in sched.items() if s < BREAK[0] - 1e-9} == (M4_SET | M4_NEED), 'only M4 and its mandatory prerequisites may sit before Milestone 1 (5.0)'
assert {c for c, (s, p) in sched.items() if BREAK[1] - 1e-9 <= s < MS2_END - 1e-9} == MS2_ALL, 'Milestone 2 (5.5..6.75) must contain exactly M2 and its 4 M5/M6 dependencies'
assert all(sched[c][0] + sched[c][1] <= MS2_END + 1e-9 for c in MS2_ALL), 'all Milestone 2 modules must finish by MS2_END (6.75)'
assert {c for c, (s, p) in sched.items() if s >= MS2_END - 1e-9} == MS3_ALL, 'Milestone 3 (>= 6.75) must contain all remaining modules'
assert sched['M5/SM4'][0] + sched['M5/SM4'][1] <= min(sched[c][0] for c in ('M3/SM1', 'M3/SM2', 'M3/SM3')) + 1e-9, 'Môn học (M5/SM4) must finish before M3 Học tập starts'
for _c in ('M5/SM4', 'M5/SM8', 'M6/SM6'):
    assert sched[_c][0] >= 6.0 - 1e-9, _c + ' must be scheduled after February 2027 (>= 6.0)'
for _c, (_s, _p) in sched.items():
    assert _s >= 1.75 - 1e-9 and _s + _p <= END + 1e-9, _c + ' is outside Nov 2026 - April 2027'
    assert not (_s < BREAK[1] - 1e-9 and _s + _p > BREAK[0] + 1e-9), _c + ' overlaps the Tết break'
    assert abs(_s * 4 - round(_s * 4)) < 1e-9 and abs(_p * 4 - round(_p * 4)) < 1e-9, _c + ' is not on quarter-month steps'
    for _d in NEEDS[_c]: assert _s >= sched[_d][0] - 1e-9, '%s starts before its hard dependency %s' % (_c, _d)
if os.environ.get('DEBUG_SCHED'):
    for c, (a, b) in sorted(sched.items(), key=lambda x: x[1]): sys.stderr.write('%-8s %5.2f -> %5.2f  %s\n' % (c, a, a+b, TITLE[c]))

def js(x): return json.dumps(x, ensure_ascii=False)
def counts_text(s): return ' · '.join('%d %s' % (s[k], STATE[k]) for k in ['C','P','N','U','A'] if s.get(k))
SRC = 'Nguồn: báo cáo nghiệp vụ và tiến độ (bao-cao-nghiep-vu-tien-do.html), audit 22/10/2026. Đây là Roadmap Rebuild lại Core EDU, kết nối dữ liệu và xây dựng một Portal mới chạy thực tế tương tự như Portal QLTH của SOHA hiện tại (phần "đã làm" trong báo cáo chỉ là giao diện portal; chưa tích hợp core nên chưa có module nào hoàn thành). Lộ trình gồm 3 Milestone: Milestone 1 hoàn thiện Module Tài chính (M4) trước Tết Nguyên Đán (31/1/2027); Milestone 2 hoàn thiện Module Vận hành (M2) vào 22/3/2027; Milestone 3 hoàn thiện toàn bộ các module còn lại (M3 Học tập, phần còn lại của M5, M1 Tổng quan, M7 Khác) vào 30/4/2027. Lịch trên roadmap đã đối chiếu kỹ các phụ thuộc cứng/mềm trong PRD docs_legacy; báo cáo không có ngày.'
cards, rank = [], {}
for pid, pname, items in PHASES:
    for c in items: rank[c] = len(rank)
UNLOCKS = {c: sorted([k for k, v in NEEDS.items() if c in v], key=lambda x: (sched[x][0], rank[x])) for c in sched}
def make_dep(code):
    title = TITLE[code]
    if code in M4_SET:
        mb = {'cls': 'm4-own', 'text': '★ Thuộc Milestone 1 (31/1/2027): Hoàn thiện Module Tài chính (M4) trước Tết Nguyên Đán'}
    elif code in M4_NEED:
        mb = {'cls': 'm4-req', 'text': '★ Dependency bắt buộc cho Milestone 1 (Module Tài chính M4 trước Tết)'}
    elif code in M2_SET:
        mb = {'cls': 'm4-own', 'text': '★ Thuộc Milestone 2 (22/3/2027): Hoàn thiện Module Vận hành (M2)'}
    elif code in M2_DEP:
        mb = {'cls': 'm4-req', 'text': '★ Dependency cho Milestone 2 (Module Vận hành M2 — hoàn thành trước 22/3/2027)'}
    else:
        mb = {'cls': 'm4-later', 'text': '★ Thuộc Milestone 3 (30/4/2027): Hoàn thiện Học tập (M3), Tổng quan (M1) & các module còn lại'}
    hard = [{'id': 'R-' + d.replace('/', ''), 'code': d, 'short': '%s (%s)' % (TITLE[d], d), 'label': '%s › %s (%s)' % (by[d]['gl'], TITLE[d], d)} for d in NEEDS[code]]
    unlocks = [{'id': 'R-' + u.replace('/', ''), 'code': u, 'label': '%s › %s (%s)' % (by[u]['gl'], TITLE[u], u), 'm4': (u in M4_SET or u in M4_NEED)} for u in UNLOCKS[code]]
    if hard:
        lead = 'Trước khi build module “%s (%s)”, BẮT BUỘC phải build module sau trước (%d):' % (title, code, len(hard))
    else:
        lead = 'Module “%s (%s)” là module gốc (KHÔNG phụ thuộc cứng vào module nào trước đó — có thể bắt đầu build ngay):' % (title, code)
    return {'id': 'R-' + code.replace('/', ''), 'code': code, 'm4Badge': mb, 'lead': lead, 'hard': hard, 'why': WHY[code], 'unlocks': unlocks, 'soft': SOFT.get(code, [])}
for m in allmods:
    if m.get('new'):
        code = m['code']; title = TITLE[code]; ph = PHASE_OF[code]
        meta = {'Mã module': code, 'Nhóm': '%s · %s' % (m['g'], m['gl']),
                'Nguồn': 'Yêu cầu của chủ sản phẩm 23/10/2026; không có trong báo cáo audit',
                'Tích hợp core': 'Chưa làm (sub-module mới)',
                'Màn hình (route)': ', '.join(m['routes']),
                'Xếp lịch': ph[1],
                'Cần xong trước (cứng, theo PRD)': ', '.join('%s (%s)' % (TITLE[d], d) for d in NEEDS[code]) or 'Không có',
                'Liên kết mềm / tuỳ chọn': '; '.join(SOFT.get(code, [])) or 'Không có',
                'Với bản phát hành M4': m4_role(code)}
        blocks = [{'h': 'Vì sao xếp ở đây?', 'items': [WHY[code]]},
                  {'h': 'Đã có gì từ portal cũ?', 'items': m['have']}, {'h': 'Chưa có / cần bổ sung gì?', 'items': m['missing']}, {'h': 'Cần làm rõ / kiểm chứng gì?', 'items': m['verify']}, {'h': 'Cần chuẩn bị gì?', 'items': m['need']},
                  {'h': 'Làm lần lượt 3 bước này', 'items': m['steps'], 'ol': True}, {'h': 'Khi nào có thể chốt module?', 'items': m['close']},
                  {'h': 'Liên quan module nào? (phối hợp, không bắt buộc chờ xong mới bắt đầu)', 'items': ['%s (%s)' % (TITLE[d], d) for d in m['deps']]}]
        node = {'type': 'mod', 'tag': 'prop', 'vi': True, 'label': title, 'sub': '%s · %s' % (code, m['gl']), 'meta': meta, 'dep': make_dep(code),
                'insight': 'Chưa tích hợp core: sub-module mới theo yêu cầu của chủ sản phẩm (23/10/2026) để phục vụ lộ trình Rebuild lại Core EDU và xây dựng Portal mới chạy thực tế tương tự Portal QLTH của SOHA. Phần dưới là bản đặc tả đề xuất; chỗ nào chưa rõ ghi [Cần xác nhận].',
                'what': m['quick'],
                'tableTitle': 'Yêu cầu đề xuất (%d yêu cầu, chưa xác nhận)' % len(m['rows']),
                'table': {'head': ['Yêu cầu', 'Hiện trạng', 'Cần làm / cần chốt gì?'], 'rows': m['rows']},
                'tableNote': 'Đặc tả đề xuất do tôi soạn từ yêu cầu của chủ sản phẩm và các PRD cũ; không phải yêu cầu BA đã xác nhận. [Cần xác nhận] đánh dấu chỗ chưa rõ.',
                'blocks': blocks, 'basis': 'Nguồn: yêu cầu của chủ sản phẩm 23/10/2026 (đăng nhập bằng Tài khoản hoặc SSO của Sở GD&ĐT: chọn trường rồi chuyển sang cổng đăng nhập của trường), đối chiếu với docs_legacy (Tài khoản, Giáo viên, Khác, 00-inventory).'}
        cards.append({'id': 'R-' + code.replace('/', ''), 'lane': 'm' + code[1], 'title': title, 'col': sched[code][0], 'span': sched[code][1], 'plan': 'prop', 'after': ['R-' + d.replace('/', '') for d in NEEDS[code]], 'new': True, 'node': node, '_r': rank[code]})
        continue
    code = m['code']; s = cnt(m); total = len(m['reqs']); done = s.get('C', 0); title = TITLE[code]
    st, sp = sched[code]
    ph = PHASE_OF[code]
    meta = {'Mã module': code, 'Nhóm': '%s · %s' % (m['g'], m['gl']),
            'Tích hợp core': 'Chưa làm (chưa module nào tích hợp core)',
            'Giao diện portal (theo báo cáo)': KIND[m['kind']][len('Giao diện: '):],
            'Yêu cầu BA (giao diện)': '%d yêu cầu: %s' % (total, counts_text(s)),
            'Trạng thái nghiệm thu (tracker)': m['tracker'] or 'không có',
            'Xếp lịch': ph[1] + (' · làm sau, chưa cần ở giai đoạn đầu' if code in DEFERRED else ''),
            'Cần xong trước (cứng, theo PRD)': ', '.join('%s (%s)' % (TITLE[d], d) for d in NEEDS[code]) or 'Không có',
            'Liên kết mềm / tuỳ chọn': '; '.join(SOFT.get(code, [])) or 'Không có',
            'Với bản phát hành M4': m4_role(code)}
    if m['name'] != title: meta['Tên trong báo cáo'] = m['name']
    if m['routes']: meta['Màn hình (route)'] = ', '.join(m['routes'][:3])
    rows = []
    for r in m['reqs']:
        need = r['need'] if r['need'] and r['need'] != BOILER else ''
        rows.append(['%s %s (%s)' % (r['n'], r['t'], r['code']), '%s %s: %s' % (GLYPH[r['s']], STATE[r['s']].capitalize(), r['done']), r['todo'] + ((' Cần có: ' + need) if need else '')])
    B = m['blocks']
    def blk(h, key):
        o = {'h': h, 'items': B[key]['items']}
        if B[key].get('muted') and not B[key]['items']: o['muted'] = B[key]['muted']
        return o
    blocks = [{'h': 'Vì sao xếp ở đây?', 'items': [WHY[code], 'Chạy từ %s đến %s theo lịch đề xuất (kéo thẻ để đổi).' % ('', '')] if False else [WHY[code]]},
              blk('Giao diện đã có gì?', 'have'), blk('Chưa có / cần bổ sung gì?', 'missing'), blk('Đã làm nhưng cần kiểm lại gì?', 'verify'), blk('Cần chuẩn bị gì?', 'need'),
              {'h': 'Làm lần lượt 3 bước này', 'items': m['steps'], 'ol': True}, {'h': 'Khi nào có thể chốt module?', 'items': m['close']},
              {'h': 'Liên quan module nào? (phối hợp, không bắt buộc chờ xong mới bắt đầu)', 'items': ['%s (%s)' % (TITLE[d], d) for d in m['deps']] or [], 'muted': '' if m['deps'] else 'Không có module liên quan được nêu trong báo cáo.'}]
    node = {'type': 'mod', 'tag': 'audit', 'vi': True, 'label': title, 'sub': '%s · %s' % (code, m['gl']), 'meta': meta, 'dep': make_dep(code),
            'insight': 'Chưa tích hợp core: phần "đã làm" trong báo cáo chỉ là giao diện portal, nên xem module này là chưa hoàn thành. Trong lộ trình Rebuild lại Core EDU và xây dựng Portal mới chạy thực tế tương tự Portal QLTH của SOHA hiện tại, việc chính là xây dựng Core EDU và nối dữ liệu thật (học sinh, giáo viên, lớp học, môn học, thực đơn, tài chính...).',
            'what': m['quick'],
            'tableTitle': 'Đối chiếu từng yêu cầu BA phía giao diện (%d yêu cầu)' % total,
            'table': {'head': ['Yêu cầu', 'Giao diện đã làm đến đâu?', 'Cần làm / cần kiểm gì để chốt?'], 'rows': rows},
            'tableNote': 'Ký hiệu: ✓ đã làm (chỉ là giao diện) · ◐ làm một phần · ✕ chưa làm · ? chưa đủ bằng chứng · ◇ đạt mô phỏng (chưa phải tích hợp thật). Chưa yêu cầu nào đã tích hợp core.',
            'blocks': blocks, 'basis': SRC}
    cards.append({'id': 'R-' + code.replace('/', ''), 'lane': 'm' + code[1], 'title': title, 'col': sched[code][0], 'span': sched[code][1], 'plan': 'prop', 'after': ['R-' + d.replace('/', '') for d in NEEDS[code]], 'node': node, '_r': rank[code]})
lanes = []
for lid, label, g, tone, prio in LANES:
    ms = [m for m in allmods if m['g'] == g]
    tot = {}
    for m in ms:
        for r in m.get('reqs', []): tot[r['s']] = tot.get(r['s'], 0) + 1
    early = [m for m in ms if m['code'] not in DEFERRED]; late = [m for m in ms if m['code'] in DEFERRED]
    items = ['%s: %s%s' % (TITLE[m['code']], (KIND[m['kind']][len('Giao diện: '):] if not m.get('new') else 'sub-module mới, ngoài audit'), ' · làm sau' if m['code'] in DEFERRED else '') for m in sorted(ms, key=lambda x: rank[x['code']])]
    sub = '%d sub-module' % len(ms) + (' · ★ Milestone 1 (trước Tết)' if g == 'M4' else (' · ★ Milestone 2 (22/3)' if g == 'M2' else ('; %d làm sau' % len(late) if late else ' · ★ Milestone 3 (30/4)')))
    lnode = {'type': 'line', 'tag': 'audit', 'vi': True, 'label': label, 'sub': '%s · %d sub-module' % (g, len(ms)),
             'meta': {'Thứ tự ưu tiên': prio.split(' · ')[0], 'Nhóm': '%s · %s' % (g, label), 'Số sub-module': str(len(ms)), 'Tích hợp core': 'Chưa làm', 'Yêu cầu BA (giao diện)': '%d yêu cầu: %s' % (sum(tot.values()), counts_text(tot))},
             'insight': 'Chưa tích hợp core: phần "đã làm" chỉ là giao diện portal. Đây là lộ trình Rebuild lại Core EDU, kết nối dữ liệu và xây dựng Portal mới chạy thực tế tương tự Portal QLTH của SOHA hiện tại.' + (' ★ Đây là nhóm module trọng tâm của Milestone 1: hoàn thiện toàn bộ Module Tài chính (M4) trước Tết Nguyên Đán (31/1/2027).' if g == 'M4' else (' ★ Đây là nhóm module trọng tâm của Milestone 2: hoàn thiện toàn bộ Module Vận hành (M2) vào 22/3/2027.' if g == 'M2' else '')) + ((' Ở nhóm này %d sub-module chưa cần ở giai đoạn đầu và được xếp làm sau: %s.' % (len(late), ', '.join(TITLE[m['code']] for m in late))) if late else ''),
             'what': 'Nhóm module "%s" (%s) của School Portal đang được dựng lại, gồm %d sub-module; mỗi sub-module là một thẻ trên roadmap, cùng màu với module.' % (label, g, len(ms)),
             'blocks': [{'h': 'Các sub-module theo thứ tự làm', 'items': items}] + ([{'h': 'Phải xong (ít nhất đã bắt đầu và có hợp đồng dữ liệu) trước khi phát hành M4', 'items': ['%s › %s (%s)' % (by[c]['gl'], TITLE[c], c) for c in sorted(M4_NEED, key=lambda x: (sched[x][0], x))]}] if g == 'M4' else ([{'h': 'Các sub-module M5/M6 được xếp trong Milestone 2 để phục vụ Vận hành (M2)', 'items': ['%s › %s (%s)' % (by[c]['gl'], TITLE[c], c) for c in sorted(M2_DEP, key=lambda x: (sched[x][0], x))]}] if g == 'M2' else [])), 'basis': SRC}
    lanes.append({'id': lid, 'short': label, 'prio': prio, 'label': label, 'sub': sub, 'tone': tone, 'node': lnode, 'note': ''})
allreq = {}
for m in mods:
    for r in m['reqs']: allreq[r['s']] = allreq.get(r['s'], 0) + 1
legend = ('<span class="rmmods">Màu thẻ theo module: ' + ' '.join('<span class="rmmod"><i class="mdot t-%s"></i>%s %s</span>' % (tone, g, label) for lid, label, g, tone, prio in LANES) + '</span>' +
          '<span><i class="msdot"></i><b>Milestone 1 (31/1/2027):</b> Hoàn thiện Tài chính (M4) trước Tết</span>' +
          '<span><i class="msdot"></i><b>Milestone 2 (22/3/2027):</b> Hoàn thiện Vận hành (M2)</span>' +
          '<span><i class="msdot"></i><b>Milestone 3 (30/4/2027):</b> Hoàn thiện các module còn lại (M3, M5, M1, M7)</span>' +
          '<span><i class="brkdot"></i>Nghỉ Tết 1–14/2/2027 (Tết Nguyên đán 4–10/2): không xếp việc</span>' +
          '<span class="rmsum"><b>Đây là Roadmap Rebuild lại Core EDU, kết nối dữ liệu và xây dựng một Portal mới chạy thực tế tương tự như Portal QLTH của SOHA hiện tại</b> (Chưa module nào tích hợp core: phần "đã làm" trong báo cáo chỉ là giao diện portal). <b class="mshl">★ Milestone đầu tiên: hoàn thiện Module Tài chính (M4) trước Tết Nguyên Đán (hết 31/1/2027)</b> · <b class="mshl">★ Milestone 2 (22/3/2027): hoàn thiện toàn bộ Module Vận hành (M2)</b> · <b class="mshl">★ Milestone 3 (30/4/2027): hoàn thiện toàn bộ các module còn lại (M3 Học tập, phần còn lại của M5, M1 Tổng quan, M7 Khác)</b>. Mục tiêu tổng thể: phát hành cả 7 module trước hết tháng 4/2027. Lịch đề xuất theo thứ tự ưu tiên M5, M6, M4, M2, M3, M1, M7. %d sub-module · %d yêu cầu BA: %d đã có giao diện · %d làm một phần · %d chưa làm · %d chưa đủ bằng chứng · %d đạt mô phỏng. Ngoài audit, thêm sub-module mới: %s. Làm sau (chưa cần ở giai đoạn đầu): %s.</span>' % (
              len(mods), sum(allreq.values()), allreq['C'], allreq['P'], allreq['N'], allreq['U'], allreq['A'], ', '.join('%s › %s' % (n['gl'], n['name']) for n in NEW), ', '.join('%s › %s' % (by[c]['gl'], TITLE[c]) for c in sorted(DEFERRED, key=lambda x: rank[x]))))
buckets = [{'label': 'Trước 10/2026', 'sub': 'đã xong'}] + [{'label': n} for n in MNAME] + [{'label': 'Sau 4/2027'}, {'label': 'Chưa lên lịch', 'sub': 'kéo vào lịch'}]
road = {'depMode': 'start', 'months': MONTHS, 'minMonthW': 240, 'weekLabels': True, 'buckets': buckets,
 'milestones': [
  {'at': 1.68, 'label': '22/10 · audit', 'title': 'Mốc audit 22/10/2026', 'what': 'Dữ liệu audit lấy ngày 22/10/2026 lúc 13:45 (GMT+7). Mốc kỹ thuật dùng làm tham chiếu: FE 740/740 test đạt; FE/BE build đạt; BE 3.928/3.930 test đạt (2 test MP4 lỗi do thiếu ffprobe tại thời điểm audit); lint toàn FE có 5 lỗi trong artifact QA, lint mã ứng dụng riêng 0 lỗi và 1 cảnh báo ảnh. Các bộ test này chưa được chạy lại sau lần sửa báo cáo. Đây là kiểm tra phần giao diện portal; chưa có tích hợp core.'},
  {'at': 5.0, 'hl': True, 'label': '★ Milestone 1: Hoàn thiện Tài chính (M4)', 'title': 'Milestone 1 (31/1/2027): Hoàn thiện Module Tài chính (M4) trước Tết Nguyên Đán',
   'what': 'Milestone đầu tiên của lộ trình Rebuild lại Core EDU, kết nối dữ liệu và xây dựng Portal mới chạy thực tế tương tự như Portal QLTH của SOHA hiện tại: hoàn thiện trọn vẹn Module Tài chính (M4) trước Tết Nguyên Đán (hết 31/1/2027). Tại mốc này, toàn bộ 6 sub-module của M4 (Khoản phí, Quản lý học phí, Học phí, Khoản chi, Đối soát, Báo cáo học phí) cùng 10 sub-module nền tảng (Dependencies) ở M5, M6, M7 đều hoàn tất để nhà trường vận hành thu – chi học phí thực tế.',
   'blocks': [
     {'h': '1. Các sub-module thuộc Module Tài chính (M4) hoàn thành trước Tết (6/6)',
      'items': [
        'Tài chính › Khoản phí (M4/SM3): Danh mục khoản thu gốc và 3 khoản phí hệ thống',
        'Tài chính › Quản lý học phí (M4/SM4): Biểu phí áp dụng theo khối/lớp/học sinh',
        'Tài chính › Học phí (M4/SM1): Phát hành hoá đơn, gạch nợ, phiếu thu, QR thanh toán',
        'Tài chính › Khoản chi (M4/SM5): Phiếu chi, hoàn tiền học sinh/nhân viên, duyệt chi',
        'Tài chính › Đối soát (M4/SM2): Đối soát giao dịch cổng thanh toán và sao kê',
        'Tài chính › Báo cáo (Học phí) (M4/SM6): Báo cáo tỷ lệ thu và công nợ toàn trường/lớp'
      ]},
     {'h': '2. Các sub-module nền tảng (Dependencies) bắt buộc phải build xong trước để M4 chạy thực tế (10 sub-module)',
      'items': ['%s › %s (%s)' % (by[c]['gl'], TITLE[c], c) for c in sorted(M4_NEED, key=lambda x: (sched[x][0], x))]}
   ]},
  {'at': MS2_END, 'hl': True, 'label': '★ Milestone 2: Hoàn thiện Vận hành (M2)', 'title': 'Milestone 2 (22/3/2027): Hoàn thiện toàn bộ Module Vận hành (M2) + các phụ thuộc M5/M6',
   'what': 'Milestone thứ hai của lộ trình Rebuild Core EDU (từ 15/2 đến 22/3/2027): hoàn thiện trọn vẹn 6/6 sub-module thuộc Module Vận hành (M2) cùng 4 sub-module phụ thuộc ở M5 và M6 (Điểm danh NV, Nhận diện, Tính năng, Thông báo). Đợt 1 (15/2–8/3) triển khai Điểm danh, Hoạt động, Trao đổi song song với Điểm danh NV, Nhận diện và Tính năng; Đợt 2 (8/3–22/3) triển khai Thư viện, Báo cáo (Điểm danh), Báo cáo (Mở rộng) ngay khi các module tiền đề hoàn tất.',
   'blocks': [
     {'h': '1. Toàn bộ 6 sub-module thuộc Module Vận hành (M2) hoàn thành trong Milestone 2 (6/6)',
      'items': [
        'Vận hành › Điểm danh (M2/SM1): Điểm danh đón/trả trẻ, nhiệt độ, người đón (15/2–8/3/2027)',
        'Vận hành › Hoạt động (M2/SM2): Nhật ký hoạt động lớp học, duyệt bài đăng (15/2–8/3/2027)',
        'Vận hành › Trao đổi (M2/SM4): Hội thoại 1-1 & nhóm lớp, duyệt đơn xin nghỉ (15/2–8/3/2027)',
        'Vận hành › Báo cáo (Điểm danh) (M2/SM5): Bảng công tháng của học sinh & nhân viên, phí đón trễ (8/3–22/3/2027 — sau khi Điểm danh & Điểm danh NV xong)',
        'Vận hành › Thư viện (M2/SM3): Album ảnh lớp, tự động đồng bộ từ Hoạt động/Điểm danh & gắn thẻ AI (8/3–22/3/2027 — sau khi Điểm danh, Hoạt động & Nhận diện xong)',
        'Vận hành › Báo cáo (Mở rộng) (M2/SM6): Báo cáo đánh giá định kỳ theo mẫu (8/3–22/3/2027)'
      ]},
     {'h': '2. Các sub-module phụ thuộc ở M5 & M6 cần hoàn thành trong Milestone 2 để M2 chạy trọn vẹn (4 sub-module)',
      'items': [
        'Nhà trường › Điểm danh NV (M5/SM9): Phụ thuộc cứng của Báo cáo (Điểm danh) tab Nhân viên (15/2–1/3/2027)',
        'Cấu hình › Nhận diện (M6/SM4): Cấp dữ liệu nhận diện khuôn mặt AI cho Điểm danh và Thư viện (15/2–8/3/2027)',
        'Cấu hình › Tính năng (M6/SM5): Cấu hình bật/tắt bình luận cho Hoạt động và học kỳ theo năm học (15/2–1/3/2027)',
        'Cấu hình › Thông báo (M6/SM6): Cấu hình thông báo Điểm danh, Trao đổi và nhắc phí tự động — khép kín 100% nhóm Cấu hình M6 (1/3–22/3/2027)'
      ]}
   ]},
  {'at': END, 'hl': True, 'label': '★ Milestone 3: Hoàn thiện toàn bộ', 'title': 'Milestone 3 (30/4/2027): Hoàn thiện Học tập (M3), Tổng quan (M1) và toàn bộ sub-module còn lại',
   'what': 'Milestone thứ ba (từ 22/3 đến 30/4/2027): hoàn thiện toàn bộ 12 sub-module còn lại của hệ thống. Đợt 3A (22/3–8/4) hoàn tất Môn học (M5/SM4), Bảng thông tin (M5/SM6), Góp ý (M5/SM11) và Sổ tay PH (M5/SM10) để mở khoá dữ liệu môn học và thông báo; Đợt 3B (8/4–30/4) triển khai trọn bộ Học tập (M3: Thời khoá biểu, Bài tập, Điểm & Đánh giá), Thực đơn (M5/SM8), Lưu trữ (M5/SM14), Bình chọn (M5/SM7), Tổng quan (M1/SM1) và Khác (M7/SM1).',
   'blocks': [
     {'h': '1. Đợt 3A (22/3–8/4/2027): Các sub-module Nhà trường (M5) mở khoá cho M3 & M1 (4 sub-module)',
      'items': [
        'Nhà trường › Môn học (M5/SM4): Phụ thuộc cứng bắt buộc của cả 3 sub-module Học tập M3 (22/3–8/4/2027)',
        'Nhà trường › Bảng thông tin (M5/SM6): Mở khoá đăng thông báo cho Thời khoá biểu, Thực đơn và thẻ Tổng quan (22/3–8/4/2027)',
        'Nhà trường › Góp ý (M5/SM11): Mở khoá thẻ góp ý trên Tổng quan M1 (22/3–8/4/2027)',
        'Nhà trường › Sổ tay PH (M5/SM10): Cẩm nang phụ huynh theo trường/khối (22/3–8/4/2027)'
      ]},
     {'h': '2. Đợt 3B (8/4–30/4/2027): Học tập (M3), phần còn lại của M5, Tổng quan (M1) và Khác (M7) (8 sub-module)',
      'items': [
        'Học tập › Thời khoá biểu (M3/SM1): Xếp và phát hành TKB theo lớp/học kỳ (8/4–22/4/2027 — ngay sau khi Môn học & Bảng thông tin xong)',
        'Học tập › Bài tập (M3/SM2): Giao bài tập theo lớp và môn học (8/4–22/4/2027 — ngay sau khi Môn học xong)',
        'Học tập › Điểm & Đánh giá (M3/SM3): Sổ điểm và đánh giá định kỳ theo môn/lớp (15/4–30/4/2027)',
        'Nhà trường › Thực đơn (M5/SM8): Thực đơn tuần/tháng, gửi thông báo qua Bảng thông tin (8/4–22/4/2027)',
        'Nhà trường › Lưu trữ (M5/SM14): Màn hình quản lý hồ sơ học sinh lưu trữ (8/4–22/4/2027)',
        'Nhà trường › Bình chọn (M5/SM7): Khảo sát lấy ý kiến phụ huynh theo lớp/trường (8/4–22/4/2027)',
        'Tổng quan › Tổng quan (M1/SM1): Dashboard tổng hợp toàn trường sau khi M4, M2, M5 đã có đủ dữ liệu (8/4–30/4/2027)',
        'Khác › Khác (M7/SM1): Hồ sơ cá nhân, ngôn ngữ, hộp thông báo hệ thống & học phí (8/4–30/4/2027)'
      ]}
   ]}
 ],
  'breaks': [{'from': BREAK[0], 'to': BREAK[1], 'label': 'Nghỉ Tết 1–14/2', 'title': 'Tết Nguyên đán 2027: nghỉ 4–10/2, không xếp việc 1–14/2/2027',
              'what': 'Tết Nguyên đán 2027 nghỉ từ 4/2 đến 10/2/2027, nên nhóm mất ít nhất hai tuần đầu của tháng 2 (1–14/2/2027). Trong khoảng này lịch đề xuất không xếp sub-module nào: thẻ nào sẽ rơi vào đây được dời sang ngay sau kỳ nghỉ (từ 15/2). Nếu bạn kéo một thẻ vào vùng này, thẻ sẽ có viền đỏ và dấu "!" để nhắc.'}],
 'lanes': lanes, 'cards': [], 'legend': legend}
cards.sort(key=lambda c: c['_r'])
for c in cards: del c['_r']
road['cards'] = cards
sys.stdout.write('const ROADMAP2=' + js(road) + ';\n')
