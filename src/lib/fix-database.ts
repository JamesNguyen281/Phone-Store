import { supabase } from './supabase';

/**
 * Script tự động sửa tên bảng trong database
 * Chạy một lần để khôi phục tên bảng về như cũ
 */
export async function fixDatabaseTableNames() {
  console.log('🔧 Bắt đầu sửa tên bảng...');

  try {
    // Kiểm tra xem bảng hoa_don có tồn tại không
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (checkError) {
      console.error('Lỗi kiểm tra bảng:', checkError);
      return false;
    }

    console.log('Các bảng hiện tại:', tables);

    // Chạy SQL để đổi tên bảng
    const { error: renameError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          -- Đổi hoa_don -> don_hang
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hoa_don') THEN
            ALTER TABLE hoa_don RENAME TO don_hang;
            RAISE NOTICE 'Đã đổi hoa_don -> don_hang';
          END IF;

          -- Đổi chi_tiet_hoa_don -> chi_tiet_don_hang
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chi_tiet_hoa_don') THEN
            ALTER TABLE chi_tiet_hoa_don RENAME TO chi_tiet_don_hang;
            RAISE NOTICE 'Đã đổi chi_tiet_hoa_don -> chi_tiet_don_hang';
          END IF;

          -- Đổi san_pham -> dien_thoai
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'san_pham') THEN
            ALTER TABLE san_pham RENAME TO dien_thoai;
            RAISE NOTICE 'Đã đổi san_pham -> dien_thoai';
          END IF;

          -- Đổi hang -> hang_dien_thoai
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hang') THEN
            ALTER TABLE hang RENAME TO hang_dien_thoai;
            RAISE NOTICE 'Đã đổi hang -> hang_dien_thoai';
          END IF;
        END $$;
      `
    });

    if (renameError) {
      console.error('Lỗi đổi tên bảng:', renameError);
      return false;
    }

    console.log('✅ Đã sửa xong tên bảng!');
    return true;
  } catch (error) {
    console.error('Lỗi:', error);
    return false;
  }
}
