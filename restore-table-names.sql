-- KHÔI PHỤC TÊN BẢNG VỀ NHƯ CŨ
-- Chạy script này trên Supabase SQL Editor

-- Bước 1: Kiểm tra tên bảng hiện tại
SELECT 'Các bảng hiện tại:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Bước 2: Đổi tên bảng về như cũ
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

  -- Đổi cột ma_hang -> id trong hang_dien_thoai
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hang_dien_thoai' AND column_name = 'ma_hang'
  ) THEN
    ALTER TABLE hang_dien_thoai RENAME COLUMN ma_hang TO id;
    RAISE NOTICE 'Đã đổi cột ma_hang -> id';
  END IF;
END $$;

-- Bước 3: Kiểm tra lại
SELECT 'Các bảng sau khi đổi:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT 'Hoàn thành! Tên bảng đã được khôi phục.' as result;
