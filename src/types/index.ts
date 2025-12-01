export type VaiTro = 'ADMIN' | 'NHANVIEN' | 'KHACHHANG';
export type TrangThaiDon = 'DANGXULY' | 'DANGGIAO' | 'DAGIAO' | 'DAHUY';
export type TinhTrangSanPham = 'MOI' | 'CU' | 'TRUNG_BAY';
export type PhanLoaiHoaDon = 'NHAP' | 'BAN' | 'XUAT';

export interface TaiKhoan {
  id: string;
  email: string;
  ma_vai_tro: VaiTro;
  trang_thai: boolean;
  ngay_tao: string;
  ngay_cap_nhat: string;
}

export interface KhachHang {
  id: string;
  tai_khoan_id: string;
  ho_ten: string;
  email: string | null;
  so_dien_thoai: string | null;
  dia_chi: string | null;
}

export interface NhanVien {
  id: string;
  tai_khoan_id: string;
  ho_ten: string;
  so_dien_thoai: string | null;
  dia_chi: string | null;
  chuc_vu: string | null;
  nam_sinh: number | null;
  hinh_anh: string | null;
  ngay_vao_lam: string | null;
}

export interface HangDienThoai {
  id: string;
  ten_hang: string;
  hinh_anh: string | null;
}

export interface DienThoai {
  id: string;
  hang_id: string;
  loai_san_pham_id: string | null;
  ten_sp: string;
  mo_ta: string | null;
  gia_tien: number;
  so_luong_ton: number;
  hinh_anh: string | null;
  trang_thai: boolean;
  tinh_trang: TinhTrangSanPham;
  hang_dien_thoai?: HangDienThoai;
  thuoc_tinh?: ThuocTinhSanPham;
}

export interface ThuocTinhSanPham {
  id: string;
  dien_thoai_id: string;
  bo_nho: string | null;
  ram: string | null;
  chip_set: string | null;
  he_dieu_hanh: string | null;
  man_hinh: string | null;
  dung_luong_pin: string | null;
  cong_sac: string | null;
  loai_phu_kien: string | null;
}

export interface DonHang {
  id: string;
  khach_hang_id: string;
  ma_trang_thai: TrangThaiDon;
  tong_tien: number;
  dia_chi_giao_hang: string;
  so_dien_thoai_nhan: string;
  email_nhan: string | null;
  ghi_chu: string | null;
  ngay_dat: string;
  ngay_cap_nhat: string;
  khach_hang?: KhachHang;
}

export interface ChiTietDonHang {
  id: string;
  don_hang_id: string;
  dien_thoai_id: string;
  so_luong: number;
  gia_tien: number;
  thanh_tien: number;
  bao_hanh: number;
  giam_gia: number;
  dien_thoai?: DienThoai;
}

export interface HoaDon {
  id: string;
  don_hang_id: string;
  phuong_thuc_thanh_toan: string;
  trang_thai_thanh_toan: boolean;
  tong_tien: number;
  phan_loai: PhanLoaiHoaDon;
  ngay_thanh_toan: string | null;
  ngay_tao: string;
  don_hang?: DonHang;
}

export interface PhanHoi {
  id: string;
  khach_hang_id: string;
  nhan_vien_id: string | null;
  tieu_de: string;
  noi_dung: string;
  tra_loi: string | null;
  trang_thai: string;
  ngay_tao: string;
  ngay_tra_loi: string | null;
  khach_hang?: KhachHang;
  nhan_vien?: NhanVien;
}

export interface CartItem {
  dien_thoai: DienThoai;
  so_luong: number;
}
