import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { TaiKhoan, KhachHang, NhanVien } from '../types';

interface AuthContextType {
  user: User | null;
  taiKhoan: TaiKhoan | null;
  khachHang: KhachHang | null;
  nhanVien: NhanVien | null;
  loading: boolean;
  signUp: (email: string, password: string, hoTen: string, vaiTro: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [taiKhoan, setTaiKhoan] = useState<TaiKhoan | null>(null);
  const [khachHang, setKhachHang] = useState<KhachHang | null>(null);
  const [nhanVien, setNhanVien] = useState<NhanVien | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: taiKhoanData } = await supabase
        .from('tai_khoan')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (taiKhoanData) {
        setTaiKhoan(taiKhoanData);

        if (taiKhoanData.ma_vai_tro === 'KHACHHANG') {
          const { data: khData } = await supabase
            .from('khach_hang')
            .select('*')
            .eq('tai_khoan_id', userId)
            .maybeSingle();
          setKhachHang(khData);
        } else if (taiKhoanData.ma_vai_tro === 'NHANVIEN' || taiKhoanData.ma_vai_tro === 'ADMIN') {
          const { data: nvData } = await supabase
            .from('nhan_vien')
            .select('*')
            .eq('tai_khoan_id', userId)
            .maybeSingle();
          setNhanVien(nvData);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setTaiKhoan(null);
          setKhachHang(null);
          setNhanVien(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, hoTen: string, vaiTro: string = 'KHACHHANG') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('tai_khoan').insert({
        id: data.user.id,
        email: email,
        ma_vai_tro: vaiTro,
      });

      if (vaiTro === 'KHACHHANG') {
        await supabase.from('khach_hang').insert({
          tai_khoan_id: data.user.id,
          ho_ten: hoTen,
          email: email,
        });
      } else if (vaiTro === 'NHANVIEN' || vaiTro === 'ADMIN') {
        await supabase.from('nhan_vien').insert({
          tai_khoan_id: data.user.id,
          ho_ten: hoTen,
        });
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setTaiKhoan(null);
    setKhachHang(null);
    setNhanVien(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        taiKhoan,
        khachHang,
        nhanVien,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
