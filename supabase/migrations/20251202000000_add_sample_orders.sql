-- Thêm dữ liệu mẫu cho đơn hàng và chi tiết đơn hàng

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM chi_tiet_don_hang;
DELETE FROM don_hang WHERE khach_hang_id IS NOT NULL;

-- Lấy ID của khách hàng đầu tiên
DO $$
DECLARE
  v_khach_hang_id UUID;
  v_don_hang_id UUID;
  v_product1_id UUID;
  v_product2_id UUID;
BEGIN
  -- Lấy khách hàng đầu tiên
  SELECT id INTO v_khach_hang_id FROM khach_hang LIMIT 1;
  
  -- Lấy 2 sản phẩm bất kỳ
  SELECT id INTO v_product1_id FROM dien_thoai WHERE trang_thai = true ORDER BY gia_tien DESC LIMIT 1;
  SELECT id INTO v_product2_id FROM dien_thoai WHERE trang_thai = true AND id != v_product1_id ORDER BY gia_tien LIMIT 1;
  
  -- Nếu có khách hàng và sản phẩm
  IF v_khach_hang_id IS NOT NULL AND v_product1_id IS NOT NULL THEN
    -- Tạo đơn hàng mẫu
    INSERT INTO don_hang (
      khach_hang_id,
      ma_trang_thai,
      tong_tien,
      dia_chi_giao_hang,
      so_dien_thoai_nhan,
      email_nhan,
      ghi_chu,
      ngay_dat,
      ngay_cap_nhat
    ) VALUES (
      v_khach_hang_id,
      'DAGIAO',
      57980000,
      'Nhân tài: 789 Láng Hạ, Phường Láng Hạ, Quận Đống Đa, Hà Nội',
      '0987654321',
      NULL,
      'Giao hàng giờ hành chính',
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '3 days'
    ) RETURNING id INTO v_don_hang_id;
    
    -- Thêm chi tiết đơn hàng - Sản phẩm 1
    INSERT INTO chi_tiet_don_hang (
      don_hang_id,
      dien_thoai_id,
      so_luong,
      gia_tien,
      thanh_tien,
      bao_hanh,
      giam_gia
    )
    SELECT 
      v_don_hang_id,
      v_product1_id,
      1,
      gia_tien,
      gia_tien,
      12,
      0
    FROM dien_thoai WHERE id = v_product1_id;
    
    -- Thêm chi tiết đơn hàng - Sản phẩm 2 (nếu có)
    IF v_product2_id IS NOT NULL THEN
      INSERT INTO chi_tiet_don_hang (
        don_hang_id,
        dien_thoai_id,
        so_luong,
        gia_tien,
        thanh_tien,
        bao_hanh,
        giam_gia
      )
      SELECT 
        v_don_hang_id,
        v_product2_id,
        2,
        gia_tien,
        gia_tien * 2,
        12,
        0
      FROM dien_thoai WHERE id = v_product2_id;
      
      -- Cập nhật lại tổng tiền đơn hàng
      UPDATE don_hang 
      SET tong_tien = (
        SELECT SUM(thanh_tien) 
        FROM chi_tiet_don_hang 
        WHERE don_hang_id = v_don_hang_id
      )
      WHERE id = v_don_hang_id;
    END IF;
    
    RAISE NOTICE 'Đã tạo đơn hàng mẫu với ID: %', v_don_hang_id;
  ELSE
    RAISE NOTICE 'Không tìm thấy khách hàng hoặc sản phẩm để tạo đơn hàng mẫu';
  END IF;
END $$;
