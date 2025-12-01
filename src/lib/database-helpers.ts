import { supabase } from './supabase';
import type { SanPham, HoaDon, ChiTietHoaDon, Hang, LoaiSanPham } from '../types';

/**
 * Helper functions cho database operations
 */

// ============================================
// SẢN PHẨM
// ============================================

/**
 * Lấy danh sách sản phẩm đang kinh doanh
 */
export async function getSanPhamDangKinhDoanh() {
  const { data, error } = await supabase
    .from('san_pham')
    .select(`
      *,
      hang:ma_hang(*),
      loai_san_pham:ma_loai(*),
      thuoc_tinh:thuoc_tinh_san_pham(*)
    `)
    .eq('trang_thai', 1)
    .order('ten_sp');

  if (error) throw error;
  return data as SanPham[];
}

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export async function getSanPhamById(maSp: string) {
  const { data, error } = await supabase
    .from('san_pham')
    .select(`
      *,
      hang:ma_hang(*),
      loai_san_pham:ma_loai(*),
      thuoc_tinh:thuoc_tinh_san_pham(*)
    `)
    .eq('ma_sp', maSp)
    .single();

  if (error) throw error;
  return data as SanPham;
}

/**
 * Tìm kiếm sản phẩm theo tên
 */
export async function timKiemSanPham(keyword: string) {
  const { data, error } = await supabase
    .from('san_pham')
    .select(`
      *,
      hang:ma_hang(*),
      loai_san_pham:ma_loai(*),
      thuoc_tinh:thuoc_tinh_san_pham(*)
    `)
    .eq('trang_thai', 1)
    .ilike('ten_sp', `%${keyword}%`)
    .order('ten_sp');

  if (error) throw error;
  return data as SanPham[];
}

/**
 * Lọc sản phẩm theo hãng
 */
export async function getSanPhamTheoHang(maHang: string) {
  const { data, error } = await supabase
    .from('san_pham')
    .select(`
      *,
      hang:ma_hang(*),
      loai_san_pham:ma_loai(*),
      thuoc_tinh:thuoc_tinh_san_pham(*)
    `)
    .eq('trang_thai', 1)
    .eq('ma_hang', maHang)
    .order('ten_sp');

  if (error) throw error;
  return data as SanPham[];
}

/**
 * Cập nhật số lượng tồn kho
 */
export async function capNhatTonKho(maSp: string, soLuong: number) {
  const { error } = await supabase
    .from('san_pham')
    .update({ so_luong_ton: soLuong })
    .eq('ma_sp', maSp);

  if (error) throw error;
}

// ============================================
// HÃNG & LOẠI SẢN PHẨM
// ============================================

/**
 * Lấy danh sách tất cả hãng
 */
export async function getAllHang() {
  const { data, error } = await supabase
    .from('hang')
    .select('*')
    .order('ten_hang');

  if (error) throw error;
  return data as Hang[];
}

/**
 * Lấy danh sách tất cả loại sản phẩm
 */
export async function getAllLoaiSanPham() {
  const { data, error } = await supabase
    .from('loai_san_pham')
    .select('*')
    .order('ten_loai');

  if (error) throw error;
  return data as LoaiSanPham[];
}

// ============================================
// HÓA ĐƠN
// ============================================

/**
 * Tạo hóa đơn mới
 */
export async function taoHoaDon(params: {
  maNv: string;
  maKh?: string;
  phanLoai: 0 | 1; // 0: Nhập, 1: Bán
  trangThai?: 0 | 1 | 2; // 0: Nháp, 1: Đã thanh toán, 2: Hủy
  ghiChu?: string;
}) {
  const { data, error } = await supabase
    .from('hoa_don')
    .insert({
      ma_nv: params.maNv,
      ma_kh: params.maKh || null,
      phan_loai: params.phanLoai,
      trang_thai: params.trangThai ?? 1,
      ngay_lap: new Date().toISOString(),
      ghi_chu: params.ghiChu || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as HoaDon;
}

/**
 * Thêm chi tiết hóa đơn
 */
export async function themChiTietHoaDon(params: {
  maHd: string;
  maSp: string;
  soLuong: number;
  donGia: number;
  giamGia?: number;
  baoHanh?: number;
}) {
  const { data, error } = await supabase
    .from('chi_tiet_hoa_don')
    .insert({
      ma_hd: params.maHd,
      ma_sp: params.maSp,
      so_luong: params.soLuong,
      don_gia: params.donGia,
      giam_gia: params.giamGia ?? 0,
      bao_hanh: params.baoHanh ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChiTietHoaDon;
}

/**
 * Lấy hóa đơn theo khách hàng
 */
export async function getHoaDonTheoKhachHang(maKh: string) {
  const { data, error } = await supabase
    .from('hoa_don')
    .select(`
      *,
      nhan_vien:ma_nv(*),
      khach_hang:ma_kh(*),
      chi_tiet:chi_tiet_hoa_don(
        *,
        san_pham:ma_sp(*)
      )
    `)
    .eq('ma_kh', maKh)
    .order('ngay_lap', { ascending: false });

  if (error) throw error;
  return data as HoaDon[];
}

/**
 * Lấy chi tiết hóa đơn
 */
export async function getChiTietHoaDon(maHd: string) {
  const { data, error } = await supabase
    .from('hoa_don')
    .select(`
      *,
      nhan_vien:ma_nv(*),
      khach_hang:ma_kh(*),
      chi_tiet:chi_tiet_hoa_don(
        *,
        san_pham:ma_sp(
          *,
          hang:ma_hang(*),
          thuoc_tinh:thuoc_tinh_san_pham(*)
        )
      )
    `)
    .eq('ma_hd', maHd)
    .single();

  if (error) throw error;
  return data as HoaDon;
}

/**
 * Tính tổng tiền hóa đơn
 */
export function tinhTongTienHoaDon(chiTiet: ChiTietHoaDon[]): number {
  return chiTiet.reduce((total, item) => {
    const thanhTien = item.so_luong * item.don_gia - item.giam_gia;
    return total + thanhTien;
  }, 0);
}

/**
 * Tạo hóa đơn bán hàng hoàn chỉnh
 */
export async function taoHoaDonBanHang(params: {
  maNv: string;
  maKh: string;
  ghiChu?: string;
  sanPham: Array<{
    maSp: string;
    soLuong: number;
    donGia: number;
    giamGia?: number;
    baoHanh?: number;
  }>;
}) {
  // 1. Tạo hóa đơn
  const hoaDon = await taoHoaDon({
    maNv: params.maNv,
    maKh: params.maKh,
    phanLoai: 1, // Bán hàng
    trangThai: 1, // Đã thanh toán
    ghiChu: params.ghiChu,
  });

  // 2. Thêm chi tiết
  const chiTietPromises = params.sanPham.map((sp) =>
    themChiTietHoaDon({
      maHd: hoaDon.ma_hd,
      maSp: sp.maSp,
      soLuong: sp.soLuong,
      donGia: sp.donGia,
      giamGia: sp.giamGia,
      baoHanh: sp.baoHanh,
    })
  );

  await Promise.all(chiTietPromises);

  // 3. Cập nhật tồn kho
  const tonKhoPromises = params.sanPham.map(async (sp) => {
    const sanPham = await getSanPhamById(sp.maSp);
    const soLuongMoi = sanPham.so_luong_ton - sp.soLuong;
    return capNhatTonKho(sp.maSp, soLuongMoi);
  });

  await Promise.all(tonKhoPromises);

  return hoaDon;
}

// ============================================
// THỐNG KÊ
// ============================================

/**
 * Thống kê doanh thu theo khoảng thời gian
 */
export async function thongKeDoanhThu(tuNgay: string, denNgay: string) {
  const { data, error } = await supabase
    .from('hoa_don')
    .select(`
      *,
      chi_tiet:chi_tiet_hoa_don(*)
    `)
    .eq('phan_loai', 1) // Chỉ lấy hóa đơn bán
    .eq('trang_thai', 1) // Đã thanh toán
    .gte('ngay_lap', tuNgay)
    .lte('ngay_lap', denNgay);

  if (error) throw error;

  const tongDoanhThu = data.reduce((total: number, hd: any) => {
    const tienHoaDon = tinhTongTienHoaDon(hd.chi_tiet || []);
    return total + tienHoaDon;
  }, 0);

  return {
    soHoaDon: data.length,
    tongDoanhThu,
    hoaDon: data,
  };
}

/**
 * Sản phẩm bán chạy
 */
export async function sanPhamBanChay(limit: number = 10) {
  const { data, error } = await supabase
    .from('chi_tiet_hoa_don')
    .select(`
      ma_sp,
      so_luong,
      san_pham:ma_sp(*)
    `);

  if (error) throw error;

  // Tổng hợp số lượng bán theo sản phẩm
  const sanPhamMap = new Map<string, { sanPham: SanPham; tongSoLuong: number }>();

  data.forEach((item: any) => {
    const maSp = item.ma_sp;
    if (sanPhamMap.has(maSp)) {
      const current = sanPhamMap.get(maSp)!;
      current.tongSoLuong += item.so_luong;
    } else {
      sanPhamMap.set(maSp, {
        sanPham: item.san_pham,
        tongSoLuong: item.so_luong,
      });
    }
  });

  // Sắp xếp và lấy top
  return Array.from(sanPhamMap.values())
    .sort((a, b) => b.tongSoLuong - a.tongSoLuong)
    .slice(0, limit);
}
