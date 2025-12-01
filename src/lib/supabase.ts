import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      tai_khoan: {
        Row: {
          id: string;
          email: string;
          ma_vai_tro: 'ADMIN' | 'NHANVIEN' | 'KHACHHANG';
          trang_thai: boolean;
          ngay_tao: string;
          ngay_cap_nhat: string;
        };
      };
      khach_hang: {
        Row: {
          id: string;
          tai_khoan_id: string;
          ho_ten: string;
          so_dien_thoai: string | null;
          dia_chi: string | null;
          ngay_sinh: string | null;
          ngay_tao: string;
        };
      };
      nhan_vien: {
        Row: {
          id: string;
          tai_khoan_id: string;
          ho_ten: string;
          so_dien_thoai: string | null;
          chuc_vu: string | null;
          ngay_vao_lam: string | null;
          ngay_tao: string;
        };
      };
      hang_dien_thoai: {
        Row: {
          id: string;
          ten_hang: string;
          quoc_gia: string | null;
          mo_ta: string | null;
          logo_url: string | null;
          trang_thai: boolean;
          ngay_tao: string;
        };
      };
      dien_thoai: {
        Row: {
          id: string;
          hang_id: string;
          ten_san_pham: string;
          mo_ta: string | null;
          gia_ban: number;
          so_luong_ton: number;
          chip: string | null;
          ram: string | null;
          bo_nho: string | null;
          man_hinh: string | null;
          camera: string | null;
          pin: string | null;
          mau_sac: string | null;
          hinh_anh_url: string | null;
          trang_thai: boolean;
          ngay_tao: string;
          ngay_cap_nhat: string;
        };
      };
      don_hang: {
        Row: {
          id: string;
          khach_hang_id: string;
          ma_trang_thai: 'DANGXULY' | 'DAGIAO' | 'DAHUY';
          tong_tien: number;
          dia_chi_giao_hang: string;
          so_dien_thoai_nhan: string;
          ghi_chu: string | null;
          ngay_dat: string;
          ngay_cap_nhat: string;
        };
      };
      chi_tiet_don_hang: {
        Row: {
          id: string;
          don_hang_id: string;
          dien_thoai_id: string;
          so_luong: number;
          gia_ban: number;
          thanh_tien: number;
        };
      };
      hoa_don: {
        Row: {
          id: string;
          don_hang_id: string;
          phuong_thuc_thanh_toan: string;
          trang_thai_thanh_toan: boolean;
          tong_tien: number;
          ngay_thanh_toan: string | null;
          ngay_tao: string;
        };
      };
      phan_hoi: {
        Row: {
          id: string;
          khach_hang_id: string;
          nhan_vien_id: string | null;
          tieu_de: string;
          noi_dung: string;
          tra_loi: string | null;
          trang_thai: string;
          ngay_tao: string;
          ngay_tra_loi: string | null;
        };
      };
    };
  };
};
