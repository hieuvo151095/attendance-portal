/* [DS] ECO ME DASHBOARD — namespace window.ECOMD */

/** Tên icon Font Awesome 6 Free (Solid) có trong bộ, ví dụ 'magnifying-glass', 'chalkboard-user' — xem ECOMD.Icon.names(); hoặc alias: search, close, menu, more, add, edit, delete, success, error, info, warning. Tên không có: vẽ ô giữ chỗ nét đứt cùng cỡ. */
export type IconName =
  'angles-left' | 'angles-right' | 'arrow-down-wide-short' | 'arrow-left' | 'arrow-right' | 'arrow-right-from-bracket' | 'arrow-right-to-bracket' | 'arrow-rotate-right' | 'arrow-up-right-from-square' | 'arrow-up-wide-short' | 'arrows-rotate' | 'at' | 'bars' | 'bell' | 'bolt' | 'book' | 'book-bookmark' | 'book-open' | 'bowl-food' | 'box-archive' | 'box-open' | 'building' | 'bullhorn' | 'cake-candles' | 'calendar' | 'calendar-check' | 'calendar-days' | 'calendar-plus' | 'calendar-week' | 'camera' | 'capsules' | 'chalkboard' | 'chalkboard-user' | 'chart-line' | 'chart-pie' | 'chart-simple' | 'check' | 'check-double' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'child' | 'children' | 'circle' | 'circle-check' | 'circle-dot' | 'circle-exclamation' | 'circle-half-stroke' | 'circle-info' | 'circle-minus' | 'circle-plus' | 'circle-question' | 'circle-xmark' | 'clipboard-check' | 'clipboard-list' | 'clock' | 'coins' | 'comment-dots' | 'comments' | 'comments-dollar' | 'copy' | 'credit-card' | 'download' | 'ellipsis' | 'ellipsis-vertical' | 'envelope' | 'eye' | 'eye-slash' | 'face-smile' | 'file' | 'file-excel' | 'file-export' | 'file-import' | 'file-invoice-dollar' | 'file-lines' | 'file-pdf' | 'filter' | 'fingerprint' | 'flag' | 'folder' | 'folder-open' | 'gear' | 'graduation-cap' | 'grip' | 'grip-vertical' | 'hashtag' | 'heart' | 'heart-pulse' | 'hourglass-half' | 'house' | 'id-badge' | 'image' | 'images' | 'inbox' | 'key' | 'layer-group' | 'leaf' | 'link' | 'list' | 'list-check' | 'location-dot' | 'lock' | 'magnifying-glass' | 'mars' | 'message' | 'minus' | 'mobile-screen' | 'moon' | 'newspaper' | 'notes-medical' | 'paper-plane' | 'paperclip' | 'pen' | 'pen-to-square' | 'people-group' | 'percent' | 'person' | 'phone' | 'plus' | 'print' | 'quote-left' | 'receipt' | 'reply' | 'right-from-bracket' | 'rotate-left' | 'rotate-right' | 'scale-balanced' | 'school' | 'shapes' | 'share-from-square' | 'shield-halved' | 'sliders' | 'sort' | 'sort-down' | 'sort-up' | 'square-poll-vertical' | 'star' | 'stethoscope' | 'sun' | 'table-cells' | 'temperature-half' | 'thumbtack' | 'toggle-on' | 'trash' | 'trash-can' | 'triangle-exclamation' | 'upload' | 'user' | 'user-check' | 'user-clock' | 'user-graduate' | 'user-group' | 'user-plus' | 'user-shield' | 'user-tie' | 'user-xmark' | 'users' | 'utensils' | 'venus' | 'xmark' | (string & {});

/* ---------- Nền tảng ---------- */

export interface IconProps {
  name: IconName;
  /** Khung size × size px. Mặc định 16. */
  size?: number;
  /** Mặc định theo màu chữ (currentColor). Ưu tiên token: 'var(--text-subtle)'. */
  color?: string;
  /** Nhãn cho trình đọc màn hình; bỏ trống với icon trang trí. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Icon: ((props: IconProps) => JSX.Element) & {
  has(name: string): boolean;
  names(): string[];
  aliases(): Record<string, string>;
  /** Thêm icon: { 'tên': [width, height, 'path d'] } (lấy từ @fortawesome/free-solid-svg-icons). */
  register(map: Record<string, [number, number, string]>): void;
  source: { set: string; version: string; license: string; url: string };
};

/* ---------- Hành động ---------- */

export interface ButtonProps {
  /** primary = nền eco-blue-strong (CTA chính, 1 nút/màn) · secondary = nền bg-subtle, viền (công cụ phụ) ·
   *  ghost = không nền, chữ text-nav (nút đóng / huỷ trong popup) · text = chữ nhỏ text-subtle (hành động phụ nhẹ: "Đặt lại bộ lọc"). Mặc định primary. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'text';
  /** Chỉ cho secondary: đang bật (bộ lọc đang áp dụng) — nền semantic-info-soft, chữ eco-blue-strong. */
  active?: boolean;
  /** Chấm 8px eco-blue-strong sau nhãn, báo đang có giá trị (đi với active). */
  indicator?: boolean;
  /** Icon 12px trước (left, mặc định) hoặc sau (right) nhãn. */
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  /** Rộng 100% khung chứa. */
  block?: boolean;
  disabled?: boolean;
  /** Chỉ để vẽ trạng thái trong mockup; hover / focus thật đã tự có. */
  state?: 'default' | 'hover' | 'focus';
  /** Có href: render <a> (bỏ qua khi disabled). */
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Button: (props: ButtonProps) => JSX.Element;

export interface IconButtonProps {
  icon: IconName;
  /** Bắt buộc: aria-label và tooltip. */
  label: string;
  /** sm = icon 14px (thao tác hàng, mặc định) · md = icon 16px (AppHeader). Khung luôn 32px. */
  size?: 'sm' | 'md';
  /** Chấm đỏ báo có mục mới. */
  badge?: boolean;
  /** Đang bật: nền bg-muted (nút menu khi sidebar đang thu gọn). Đặt aria-pressed. */
  active?: boolean;
  disabled?: boolean;
  state?: 'default' | 'hover' | 'focus';
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare const IconButton: (props: IconButtonProps) => JSX.Element;

/* ---------- Biểu mẫu ---------- */

export interface SearchFieldProps {
  /** md = trong trang, 14px, tối thiểu 240px (mặc định) · sm = trên AppHeader, 12px, rộng 224px. */
  size?: 'md' | 'sm';
  /** Liệt kê trường tìm được, ví dụ 'Tìm theo tên, mã NV, email, SĐT, CCCD...'. */
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  /** aria-label; mặc định = placeholder. */
  label?: string;
  block?: boolean;
  state?: 'default' | 'focus';
  className?: string;
  style?: React.CSSProperties;
}
export declare const SearchField: (props: SearchFieldProps) => JSX.Element;

export interface SelectFieldProps {
  /** Lựa chọn đầu tiên là mặc định "Tất cả …". */
  options: Array<string | { value: string; label: string }>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** aria-label; mặc định = nhãn lựa chọn đầu. */
  label?: string;
  disabled?: boolean;
  state?: 'default' | 'focus';
  className?: string;
  style?: React.CSSProperties;
}
export declare const SelectField: (props: SelectFieldProps) => JSX.Element;

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Chọn một phần (header bảng khi chỉ vài hàng được chọn). */
  indeterminate?: boolean;
  disabled?: boolean;
  /** Nhãn chữ bên phải; bỏ trống thì bắt buộc aria-label. */
  label?: React.ReactNode;
  /** Dòng mô tả dưới nhãn (nhãn chuyển sang body-sm-medium, checkbox căn đầu dòng). */
  description?: React.ReactNode;
  'aria-label'?: string;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Checkbox: (props: CheckboxProps) => JSX.Element;

/* ---------- Điều hướng ---------- */

export interface AppHeaderProps {
  /** Vị trí trang; mục cuối là trang hiện tại. */
  breadcrumb?: Array<string | { label: string; href?: string }>;
  /** Dùng khi không có breadcrumb. */
  title?: string;
  notification?: boolean;
  /** false = ẩn chuông. */
  onNotification?: ((e: React.MouseEvent) => void) | false;
  user?: { name: string; role?: string; avatar?: string };
  /** Ô tìm chức năng (SearchField cỡ sm). */
  search?: SearchFieldProps;
  actions?: React.ReactNode;
  /** v2.1: có thì hiện nút ☰ "Mở menu" bên trái (AppShell tự truyền ở mobile). */
  onMenu?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare const AppHeader: (props: AppHeaderProps) => JSX.Element;

export interface SidebarNavItem {
  key?: string;
  icon: IconName;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}
export interface SidebarNavProps {
  /** Mặc định PORTAL_NAV: 5 nhóm, 42 mục của ECO School Portal. */
  groups?: Array<{ label?: string; items: SidebarNavItem[] }>;
  /** key (hoặc label) của mục đang chọn. */
  activeKey?: string;
  hoverKey?: string;
  brand?: { name: string; icon?: IconName; logoSrc?: string; href?: string };
  /** Ô chọn lớp đang xem; short hiện khi thu gọn. */
  context?: { label?: string; value: string; short?: string; icon?: IconName; options?: string[]; onChange?: (value: string, e: any) => void };
  /** Niên khóa, học kỳ ở chân. */
  term?: { year: string; term?: string };
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  /** false = ẩn nút thu gọn. */
  onToggleCollapse?: ((collapsed: boolean) => void) | false;
  /** v2.1: 'drawer' = ngăn kéo trên mobile, nút cuối thành "Đóng menu". */
  mode?: 'inline' | 'drawer';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare const SidebarNav: ((props: SidebarNavProps) => JSX.Element) & { PORTAL_NAV: Array<{ label: string; items: SidebarNavItem[] }> };

/* ---------- Nội dung ---------- */

export interface PageHeaderProps {
  /** Hoa Mỗi Chữ: 'Danh Sách Giáo Viên'. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Nút bên phải (ít dùng; CTA chính thường ở FilterBar). */
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const PageHeader: (props: PageHeaderProps) => JSX.Element;

export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: IconName;
  /** neutral (mặc định) · success · info · warning · purple. */
  tone?: 'neutral' | 'success' | 'info' | 'warning' | 'purple';
  className?: string;
  style?: React.CSSProperties;
}
export declare const StatCard: ((props: StatCardProps) => JSX.Element) & {
  /** Lưới StatCard: mặc định 5 cột, 2 cột dưới 640px, gap space-12. */
  Group: (props: { columns?: number; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) => JSX.Element;
};

export interface StatusTagProps {
  /** success (đang hoạt động) · warning (tạm dừng, chờ) · danger (lỗi, huỷ) · info (vai trò chính, đang xử lý) · neutral (mặc định: kết thúc, nháp). */
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label?: React.ReactNode;
  children?: React.ReactNode;
  /** true = icon mặc định theo tone; tên icon = icon riêng; bỏ trống = không icon. */
  icon?: boolean | IconName;
  className?: string;
  style?: React.CSSProperties;
}
export declare const StatusTag: (props: StatusTagProps) => JSX.Element;

export interface TagProps {
  /** default = lớp, nhãn ngắn · code = mã (mono) · success = lớp chủ nhiệm · warning = chip ngữ cảnh. */
  variant?: 'default' | 'code' | 'success' | 'warning';
  /** Bo tròn hoàn toàn (chip ngữ cảnh trên AppHeader). */
  pill?: boolean;
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Tag: (props: TagProps) => JSX.Element;

export interface EmptyValueProps {
  /** Viết 'Chưa …': 'Chưa chủ nhiệm', 'Chưa phân công'. */
  label?: React.ReactNode;
  children?: React.ReactNode;
  /** In nghiêng khi thiếu dữ liệu định danh: 'Chưa có mã nhân viên'. */
  italic?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export declare const EmptyValue: (props: EmptyValueProps) => JSX.Element;

export interface AvatarProps {
  /** Ảnh vuông, ưu tiên khuôn mặt. Không có: hiện chữ cái đầu của tên (chữ đầu của họ tên). */
  src?: string;
  /** Họ tên; dùng làm alt và để lấy chữ cái đầu. */
  name?: string;
  /** Ghi đè chữ cái đầu. */
  initials?: string;
  /** md 40px (bảng, mặc định) · sm 32px (AppHeader). */
  size?: 'md' | 'sm';
  /** Vòng eco-yellow-strong — chỉ cho người đang đăng nhập. */
  ring?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Avatar: (props: AvatarProps) => JSX.Element;

/* ---------- Mẫu ghép ---------- */

export interface FilterBarProps {
  /** Không viền, không nền: khi đặt trong ecomd-table-card. */
  flush?: boolean;
  /** Props cho SearchField; false = không có ô tìm. */
  search?: SearchFieldProps | false;
  /** Mỗi phần tử là props của một SelectField. */
  filters?: SelectFieldProps[];
  /** Nút secondary "Bộ lọc nâng cao"; active = đang có bộ lọc nâng cao (nền xanh nhạt + chấm). */
  advanced?: { label?: string; active?: boolean; onClick?: (e: React.MouseEvent) => void } | false;
  /** CTA primary bên phải; icon mặc định 'plus'. */
  action?: { label: string; icon?: IconName | null; href?: string; onClick?: (e: React.MouseEvent) => void };
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const FilterBar: (props: FilterBarProps) => JSX.Element;

export interface DataTableColumn<R = any> {
  key: string;
  /** Hoa chữ đầu: 'Mã nhân viên'. */
  title: React.ReactNode;
  align?: 'left' | 'right';
  width?: number | string;
  render?: (row: R, index: number) => React.ReactNode;
  /** v2.1: cột thao tác (ghim phải ở tablet, góc phải thẻ ở mobile). Cột không có title cũng được coi là cột thao tác. */
  actions?: boolean;
}
export interface DataTableProps<R = any> {
  columns: DataTableColumn<R>[];
  rows: R[];
  /** Tên trường hoặc hàm lấy khoá hàng; mặc định chỉ số. */
  rowKey?: string | ((row: R) => string | number);
  /** Cột checkbox đầu bảng. */
  selectable?: boolean;
  selected?: Array<string | number>;
  onSelect?: (keys: Array<string | number>) => void;
  /** aria-label checkbox từng hàng, ví dụ r => 'Chọn giáo viên ' + r.name. */
  rowLabel?: (row: R) => string;
  selectAllLabel?: string;
  /** Nội dung footer, ví dụ <>Hiển thị <b>7</b> giáo viên</>. */
  footer?: React.ReactNode;
  /** Chữ của EmptyState khi không có hàng. */
  emptyText?: React.ReactNode;
  /** Icon của EmptyState, ví dụ 'user-tie'. */
  emptyIcon?: IconName;
  /** Thay toàn bộ nội dung khi bảng rỗng. */
  empty?: React.ReactNode;
  /** Chỉ để vẽ hover một hàng trong mockup. */
  hoverIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}
export declare const DataTable: (<R = any>(props: DataTableProps<R>) => JSX.Element) & {
  /** Ô người: Avatar + tên (link khi có href) + dòng phụ. */
  Person: (props: { name: string; meta?: React.ReactNode; avatar?: string; href?: string }) => JSX.Element;
  /** Nhóm Tag xuống dòng, rộng tối đa 200px. */
  Tags: (props: { children?: React.ReactNode }) => JSX.Element;
  /** IconButton ellipsis-vertical cho cột Thao tác; có items thì bấm mở DropdownMenu. */
  RowAction: (props: { icon?: IconName; label?: string; items?: DropdownMenuItem[]; onClick?: (e: React.MouseEvent) => void; defaultOpen?: boolean; hoverIndex?: number }) => JSX.Element;
};

export interface EmptyStateProps {
  /** Icon 30px màu border-strong; mặc định 'magnifying-glass'; false = không icon. */
  icon?: IconName | false;
  /** Một câu nói rõ không có gì: 'Không tìm thấy giáo viên nào phù hợp'. */
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const EmptyState: (props: EmptyStateProps) => JSX.Element;

/* ---------- Lớp phủ ---------- */

export type DropdownMenuItem =
  | { icon?: IconName; label: React.ReactNode; onClick?: (e: React.MouseEvent) => void; href?: string; disabled?: boolean;
      /** danger = hành động phá huỷ (chữ + icon text-danger), đặt cuối menu sau một divider. */
      tone?: 'default' | 'danger' }
  | { divider: true };
export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  /** Phần tử bấm để mở (thường là IconButton). Bỏ trống: chỉ vẽ khung menu (mockup). */
  trigger?: React.ReactElement;
  /** Mép căn của menu so với trigger. Mặc định right. */
  align?: 'right' | 'left';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Chỉ để vẽ hover một mục trong mockup. */
  hoverIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}
export declare const DropdownMenu: (props: DropdownMenuProps) => JSX.Element;

export interface PopupModalAction { label: React.ReactNode; icon?: IconName; onClick?: (e: React.MouseEvent) => void; disabled?: boolean }
export interface PopupModalProps {
  /** Mặc định true. */
  open?: boolean;
  /** Icon trong ô 40px nền semantic-info-soft cạnh tiêu đề. */
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Nút X, phím Esc, bấm lớp phủ. false = ẩn nút X. */
  onClose?: ((e?: any) => void) | false;
  /** Nút primary bên phải chân: 'Áp dụng'. */
  primaryAction?: PopupModalAction;
  /** Nút ghost cạnh primary; mặc định { label: 'Đóng', onClick: onClose }; null = ẩn. */
  secondaryAction?: PopupModalAction | null;
  /** Nút text bên trái chân: 'Đặt lại bộ lọc'. */
  extraAction?: PopupModalAction;
  /** Thay toàn bộ chân hành động. */
  footer?: React.ReactNode;
  /** Rộng tối đa; mặc định 448px. */
  width?: number | string;
  /** Bấm lớp phủ để đóng; mặc định true. */
  closeOnOverlay?: boolean;
  /** Vẽ trong khung cha (position absolute) thay vì phủ cả màn — cho mockup. */
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const PopupModal: ((props: PopupModalProps) => JSX.Element | null) & {
  /** Nhóm tuỳ chọn có nhãn VIẾT HOA trong thân popup. */
  Section: (props: { label?: React.ReactNode; children?: React.ReactNode }) => JSX.Element;
};

export interface AppShellProps {
  activeKey?: string;
  nav?: SidebarNavProps['groups'];
  brand?: SidebarNavProps['brand'];
  context?: SidebarNavProps['context'];
  term?: SidebarNavProps['term'];
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onToggleCollapse?: SidebarNavProps['onToggleCollapse'];
  /** v2.1: ép bố cục; bỏ trống = tự theo bề rộng màn hình (BREAKPOINTS). */
  viewport?: 'desktop' | 'tablet' | 'mobile';
  /** v2.1: menu đang mở đè lên nội dung (tablet) hoặc ngăn kéo (mobile). */
  navOpen?: boolean;
  defaultNavOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
  breadcrumb?: AppHeaderProps['breadcrumb'];
  user?: AppHeaderProps['user'];
  notification?: boolean;
  search?: SearchFieldProps;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
  contentStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
}
export declare const AppShell: ((props: AppShellProps) => JSX.Element) & { BREAKPOINTS: { tablet: 768; desktop: 1280 } };
/** v2.1: breakpoint chuẩn. desktop ≥ 1280 · tablet 768–1279 · mobile < 768. */
export declare const BREAKPOINTS: { tablet: 768; desktop: 1280 };
/** v2.1: hook trả về 'desktop' | 'tablet' | 'mobile' theo bề rộng màn hình. */
export declare function useViewport(): 'desktop' | 'tablet' | 'mobile';

export interface TabItem { key: string; label: React.ReactNode; count?: number; icon?: IconName }
export interface TabsProps {
  items: Array<string | TabItem>;
  value?: string;
  defaultValue?: string;
  onChange?: (key: string) => void;
  /** underline (mặc định): đầu bảng · segmented: chế độ xem, lọc nhỏ. */
  variant?: 'underline' | 'segmented';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Tabs: (props: TabsProps) => JSX.Element;

export interface PaginationProps {
  total?: number;
  page?: number;
  pageSize?: number;
  pageSizes?: number[] | false;
  /** Đơn vị đếm, ví dụ 'giáo viên'. */
  unit?: string;
  onChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Pagination: (props: PaginationProps) => JSX.Element;

export interface CardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  flush?: boolean;
  children?: React.ReactNode;
  bodyStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Card: (props: CardProps) => JSX.Element;

export interface InlineNoticeProps {
  tone?: 'info' | 'warning' | 'success' | 'danger';
  icon?: IconName;
  action?: React.ReactNode;
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const InlineNotice: (props: InlineNoticeProps) => JSX.Element;

export interface MeterProps {
  value: number;
  max?: number;
  text?: string;
  showLabel?: boolean;
  tone?: 'default' | 'success' | 'warning';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Meter: (props: MeterProps) => JSX.Element;

export declare const PORTAL_NAV: SidebarNavProps['groups'];
