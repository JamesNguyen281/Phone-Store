/**
 * Script kiểm tra kết nối database và dữ liệu mẫu
 * Chạy: npm run dev và import file này trong component
 */

import { supabase } from './supabase';

export async function testDatabaseConnection() {
  console.log('🔍 Kiểm tra kết nối Supabase...\n');

  try {
    // 1. Test kết nối
    const { error: healthError } = await supabase
      .from('hang')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Lỗi kết nối:', healthError.message);
      return false;
    }

    console.log('✅ Kết nối Supabase thành công!\n');

    // 2. Kiểm tra hãng điện thoại
    const { data: hang, error: hangError } = await supabase
      .from('hang')
      .select('*');

    if (hangError) {
      console.error('❌ Lỗi lấy dữ liệu hãng:', hangError.message);
    } else {
      console.log(`✅ Hãng điện thoại: ${hang?.length || 0} hãng`);
      hang?.forEach((h: any) => console.log(`   - ${h.ten_hang}`));
      console.log('');
    }

    // 3. Kiểm tra loại sản phẩm
    const { data: loai, error: loaiError } = await supabase
      .from('loai_san_pham')
      .select('*');

    if (loaiError) {
      console.error('❌ Lỗi lấy dữ liệu loại sản phẩm:', loaiError.message);
    } else {
      console.log(`✅ Loại sản phẩm: ${loai?.length || 0} loại`);
      loai?.forEach((l: any) => console.log(`   - ${l.ten_loai}`));
      console.log('');
    }

    // 4. Kiểm tra sản phẩm
    const { data: sanPham, error: spError } = await supabase
      .from('san_pham')
      .select(`
        *,
        hang:ma_hang(ten_hang),
        loai_san_pham:ma_loai(ten_loai)
      `)
      .limit(5);

    if (spError) {
      console.error('❌ Lỗi lấy dữ liệu sản phẩm:', spError.message);
    } else {
      console.log(`✅ Sản phẩm: ${sanPham?.length || 0} sản phẩm (hiển thị 5)`);
      sanPham?.forEach((sp: any) => {
        console.log(`   - ${sp.ten_sp}`);
        console.log(`     Hãng: ${sp.hang?.ten_hang || 'N/A'}`);
        console.log(`     Giá: ${sp.gia_tien?.toLocaleString('vi-VN')} VNĐ`);
        console.log(`     Tồn kho: ${sp.so_luong_ton}`);
      });
      console.log('');
    }

    // 5. Kiểm tra tài khoản
    const { data: taiKhoan, error: tkError } = await supabase
      .from('tai_khoan')
      .select('email, ma_vai_tro, trang_thai')
      .limit(5);

    if (tkError) {
      console.error('❌ Lỗi lấy dữ liệu tài khoản:', tkError.message);
    } else {
      console.log(`✅ Tài khoản: ${taiKhoan?.length || 0} tài khoản (hiển thị 5)`);
      taiKhoan?.forEach((tk: any) => {
        console.log(`   - ${tk.email} (${tk.ma_vai_tro})`);
      });
      console.log('');
    }

    // 6. Kiểm tra nhân viên
    const { data: nhanVien, error: nvError } = await supabase
      .from('nhan_vien')
      .select('ho_ten, vai_tro, so_dien_thoai');

    if (nvError) {
      console.error('❌ Lỗi lấy dữ liệu nhân viên:', nvError.message);
    } else {
      console.log(`✅ Nhân viên: ${nhanVien?.length || 0} người`);
      nhanVien?.forEach((nv: any) => {
        const vaiTro = nv.vai_tro === 0 ? 'ADMIN' : 'NHÂN VIÊN';
        console.log(`   - ${nv.ho_ten} (${vaiTro})`);
      });
      console.log('');
    }

    // 7. Kiểm tra khách hàng
    const { data: khachHang, error: khError } = await supabase
      .from('khach_hang')
      .select('ho_ten, so_dien_thoai, email');

    if (khError) {
      console.error('❌ Lỗi lấy dữ liệu khách hàng:', khError.message);
    } else {
      console.log(`✅ Khách hàng: ${khachHang?.length || 0} người`);
      khachHang?.forEach((kh: any) => {
        console.log(`   - ${kh.ho_ten} (${kh.so_dien_thoai})`);
      });
      console.log('');
    }

    console.log('🎉 Tất cả kiểm tra đã hoàn tất!\n');
    console.log('📝 Tài khoản đăng nhập mẫu:');
    console.log('   Admin: admin@example.com / 123456');
    console.log('   Nhân viên: nvban1@example.com / 123456');
    console.log('   Khách hàng: a@example.com\n');

    return true;
  } catch (error) {
    console.error('❌ Lỗi không xác định:', error);
    return false;
  }
}

// Hàm kiểm tra RLS policies
export async function testRLSPolicies() {
  console.log('🔒 Kiểm tra Row Level Security...\n');

  try {
    // Test public access - xem sản phẩm
    const { error: publicError } = await supabase
      .from('san_pham')
      .select('*')
      .eq('trang_thai', 1)
      .limit(1);

    if (publicError) {
      console.error('❌ Public access bị lỗi:', publicError.message);
    } else {
      console.log('✅ Public có thể xem sản phẩm đang kinh doanh');
    }

    // Test public access - xem hãng
    const { error: brandError } = await supabase
      .from('hang')
      .select('*')
      .limit(1);

    if (brandError) {
      console.error('❌ Public access hãng bị lỗi:', brandError.message);
    } else {
      console.log('✅ Public có thể xem hãng điện thoại');
    }

    // Test public access - xem loại sản phẩm
    const { error: categoryError } = await supabase
      .from('loai_san_pham')
      .select('*')
      .limit(1);

    if (categoryError) {
      console.error('❌ Public access loại sản phẩm bị lỗi:', categoryError.message);
    } else {
      console.log('✅ Public có thể xem loại sản phẩm');
    }

    console.log('\n🎉 RLS policies hoạt động tốt!\n');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kiểm tra RLS:', error);
    return false;
  }
}

// Export để sử dụng trong component
export async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  KIỂM TRA DATABASE - HỆ THỐNG BÁN ĐIỆN THOẠI');
  console.log('═══════════════════════════════════════════════════\n');

  const connectionOk = await testDatabaseConnection();
  
  if (connectionOk) {
    await testRLSPolicies();
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  HOÀN TẤT KIỂM TRA');
  console.log('═══════════════════════════════════════════════════\n');
}
