/*
  # Hệ thống quản lý bán điện thoại

  ## Tổng quan
  Migration này tạo cấu trúc cơ sở dữ liệu đầy đủ cho hệ thống quản lý bán điện thoại
  với phân quyền, quản lý sản phẩm, đơn hàng, hóa đơn và phản hồi khách hàng.

  ## 1. Bảng tra cứu (LOV - List of Values)
    
  ### lov_vai_tro
    - `ma_vai_tro` (text, primary key): Mã vai trò (ADMIN, NHANVIEN, KHACHHANG)
    - `ten_vai_tro` (text): Tên vai trò hiển thị
    - `mo_ta` (text): Mô tả vai trò
    
  ### lov_trang_thai_don
    - `ma_trang_thai` (text, primary key): Mã trạng thái (DANGXULY, DAGIAO, DAHUY)
    - `ten_trang_thai` (text): Tên trạng thái hiển thị
    - `mo_ta` (text): Mô tả trạng thái

  ## 2. Bảng người dùng và xác thực

  ### tai_khoan
    - `id` (uuid, primary key): ID tài khoản (liên kết với auth.users)
    - `email` (text, unique): Email đăng nhập
    - `ma_vai_tro` (text): Vai trò của người dùng
    - `trang_thai` (boolean): Trạng thái active/inactive
    - `ngay_tao` (timestamptz): Ngày tạo tài khoản
    - `ngay_cap_nhat` (timestamptz): Ngày cập nhật

  ### khach_hang
    - `id` (uuid, primary key): ID khách hàng
    - `tai_khoan_id` (uuid): Liên kết tới tai_khoan
    - `ho_ten` (text): Họ tên khách hàng
    - `so_dien_thoai` (text): Số điện thoại
    - `dia_chi` (text): Địa chỉ giao hàng
    - `ngay_sinh` (date): Ngày sinh
    - `ngay_tao` (timestamptz): Ngày tạo

  ### nhan_vien
    - `id` (uuid, primary key): ID nhân viên
    - `tai_khoan_id` (uuid): Liên kết tới tai_khoan
    - `ho_ten` (text): Họ tên nhân viên
    - `so_dien_thoai` (text): Số điện thoại
    - `chuc_vu` (text): Chức vụ
    - `ngay_vao_lam` (date): Ngày vào làm
    - `ngay_tao` (timestamptz): Ngày tạo

  ## 3. Bảng sản phẩm

  ### hang_dien_thoai
    - `id` (uuid, primary key): ID hãng
    - `ten_hang` (text, unique): Tên hãng (Apple, Samsung, Xiaomi...)
    - `quoc_gia` (text): Quốc gia xuất xứ
    - `mo_ta` (text): Mô tả hãng
    - `logo_url` (text): URL logo hãng
    - `trang_thai` (boolean): Trạng thái active
    - `ngay_tao` (timestamptz): Ngày tạo

  ### dien_thoai
    - `id` (uuid, primary key): ID điện thoại
    - `hang_id` (uuid): ID hãng điện thoại
    - `ten_san_pham` (text): Tên sản phẩm
    - `mo_ta` (text): Mô tả chi tiết
    - `gia_ban` (decimal): Giá bán
    - `so_luong_ton` (integer): Số lượng tồn kho
    - `chip` (text): Thông tin chip
    - `ram` (text): Dung lượng RAM
    - `bo_nho` (text): Dung lượng bộ nhớ
    - `man_hinh` (text): Thông tin màn hình
    - `camera` (text): Thông tin camera
    - `pin` (text): Dung lượng pin
    - `mau_sac` (text): Màu sắc
    - `hinh_anh_url` (text): URL hình ảnh sản phẩm
    - `trang_thai` (boolean): Trạng thái còn bán
    - `ngay_tao` (timestamptz): Ngày tạo
    - `ngay_cap_nhat` (timestamptz): Ngày cập nhật

  ## 4. Bảng đơn hàng

  ### don_hang
    - `id` (uuid, primary key): ID đơn hàng
    - `khach_hang_id` (uuid): ID khách hàng
    - `ma_trang_thai` (text): Trạng thái đơn hàng
    - `tong_tien` (decimal): Tổng tiền đơn hàng
    - `dia_chi_giao_hang` (text): Địa chỉ giao hàng
    - `so_dien_thoai_nhan` (text): Số điện thoại nhận hàng
    - `ghi_chu` (text): Ghi chú đơn hàng
    - `ngay_dat` (timestamptz): Ngày đặt hàng
    - `ngay_cap_nhat` (timestamptz): Ngày cập nhật

  ### chi_tiet_don_hang
    - `id` (uuid, primary key): ID chi tiết
    - `don_hang_id` (uuid): ID đơn hàng
    - `dien_thoai_id` (uuid): ID điện thoại
    - `so_luong` (integer): Số lượng mua
    - `gia_ban` (decimal): Giá bán tại thời điểm mua
    - `thanh_tien` (decimal): Thành tiền (số lượng * giá bán)

  ### hoa_don
    - `id` (uuid, primary key): ID hóa đơn
    - `don_hang_id` (uuid, unique): ID đơn hàng
    - `phuong_thuc_thanh_toan` (text): Phương thức thanh toán (COD, CARD, TRANSFER)
    - `trang_thai_thanh_toan` (boolean): Đã thanh toán hay chưa
    - `tong_tien` (decimal): Tổng tiền hóa đơn
    - `ngay_thanh_toan` (timestamptz): Ngày thanh toán
    - `ngay_tao` (timestamptz): Ngày tạo hóa đơn

  ## 5. Bảng phản hồi

  ### phan_hoi
    - `id` (uuid, primary key): ID phản hồi
    - `khach_hang_id` (uuid): ID khách hàng
    - `nhan_vien_id` (uuid): ID nhân viên trả lời
    - `tieu_de` (text): Tiêu đề phản hồi
    - `noi_dung` (text): Nội dung phản hồi
    - `tra_loi` (text): Câu trả lời từ nhân viên
    - `trang_thai` (text): Trạng thái (CHUA_TRA_LOI, DA_TRA_LOI)
    - `ngay_tao` (timestamptz): Ngày tạo
    - `ngay_tra_loi` (timestamptz): Ngày trả lời

  ## 6. Bảo mật (RLS - Row Level Security)
  
  Tất cả các bảng đều bật RLS với các chính sách:
  - Admin: Full access tất cả dữ liệu
  - Nhân viên: Truy cập dữ liệu nghiệp vụ (sản phẩm, đơn hàng, phản hồi)
  - Khách hàng: Chỉ truy cập dữ liệu của chính mình

  ## 7. Indexes
  
  Tạo indexes cho các cột thường xuyên tìm kiếm:
  - Email, vai trò trong tai_khoan
  - Hãng, tên sản phẩm, màu sắc trong dien_thoai
  - Khách hàng, trạng thái trong don_hang
*/

-- =====================================================
-- 1. TẠO CÁC BẢNG TRA CỨU (LOV)
-- =====================================================

CREATE TABLE IF NOT EXISTS lov_vai_tro (
  ma_vai_tro text PRIMARY KEY,
  ten_vai_tro text NOT NULL,
  mo_ta text
);

CREATE TABLE IF NOT EXISTS lov_trang_thai_don (
  ma_trang_thai text PRIMARY KEY,
  ten_trang_thai text NOT NULL,
  mo_ta text
);

-- Thêm dữ liệu mẫu cho LOV
INSERT INTO lov_vai_tro (ma_vai_tro, ten_vai_tro, mo_ta) VALUES
  ('ADMIN', 'Quản trị viên', 'Có toàn quyền quản lý hệ thống'),
  ('NHANVIEN', 'Nhân viên bán hàng', 'Quản lý sản phẩm, đơn hàng, phản hồi khách hàng'),
  ('KHACHHANG', 'Khách hàng', 'Người mua hàng, xem sản phẩm và đặt hàng')
ON CONFLICT (ma_vai_tro) DO NOTHING;

INSERT INTO lov_trang_thai_don (ma_trang_thai, ten_trang_thai, mo_ta) VALUES
  ('DANGXULY', 'Đang xử lý', 'Đơn hàng đang được xử lý'),
  ('DAGIAO', 'Đã giao', 'Đơn hàng đã giao thành công'),
  ('DAHUY', 'Đã hủy', 'Đơn hàng đã bị hủy')
ON CONFLICT (ma_trang_thai) DO NOTHING;

-- =====================================================
-- 2. TẠO BẢNG TÀI KHOẢN VÀ NGƯỜI DÙNG
-- =====================================================

CREATE TABLE IF NOT EXISTS tai_khoan (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  ma_vai_tro text NOT NULL DEFAULT 'KHACHHANG' REFERENCES lov_vai_tro(ma_vai_tro),
  trang_thai boolean DEFAULT true,
  ngay_tao timestamptz DEFAULT now(),
  ngay_cap_nhat timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS khach_hang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tai_khoan_id uuid NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
  ho_ten text NOT NULL,
  so_dien_thoai text,
  dia_chi text,
  ngay_sinh date,
  ngay_tao timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nhan_vien (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tai_khoan_id uuid NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
  ho_ten text NOT NULL,
  so_dien_thoai text,
  chuc_vu text,
  ngay_vao_lam date,
  ngay_tao timestamptz DEFAULT now()
);

-- =====================================================
-- 3. TẠO BẢNG SẢN PHẨM
-- =====================================================

CREATE TABLE IF NOT EXISTS hang_dien_thoai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ten_hang text UNIQUE NOT NULL,
  quoc_gia text,
  mo_ta text,
  logo_url text,
  trang_thai boolean DEFAULT true,
  ngay_tao timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dien_thoai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hang_id uuid NOT NULL REFERENCES hang_dien_thoai(id) ON DELETE CASCADE,
  ten_san_pham text NOT NULL,
  mo_ta text,
  gia_ban decimal(15, 2) NOT NULL DEFAULT 0,
  so_luong_ton integer NOT NULL DEFAULT 0,
  chip text,
  ram text,
  bo_nho text,
  man_hinh text,
  camera text,
  pin text,
  mau_sac text,
  hinh_anh_url text,
  trang_thai boolean DEFAULT true,
  ngay_tao timestamptz DEFAULT now(),
  ngay_cap_nhat timestamptz DEFAULT now()
);

-- =====================================================
-- 4. TẠO BẢNG ĐƠN HÀNG VÀ HÓA ĐƠN
-- =====================================================

CREATE TABLE IF NOT EXISTS don_hang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  khach_hang_id uuid NOT NULL REFERENCES khach_hang(id) ON DELETE CASCADE,
  ma_trang_thai text NOT NULL DEFAULT 'DANGXULY' REFERENCES lov_trang_thai_don(ma_trang_thai),
  tong_tien decimal(15, 2) NOT NULL DEFAULT 0,
  dia_chi_giao_hang text NOT NULL,
  so_dien_thoai_nhan text NOT NULL,
  ghi_chu text,
  ngay_dat timestamptz DEFAULT now(),
  ngay_cap_nhat timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chi_tiet_don_hang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  don_hang_id uuid NOT NULL REFERENCES don_hang(id) ON DELETE CASCADE,
  dien_thoai_id uuid NOT NULL REFERENCES dien_thoai(id) ON DELETE CASCADE,
  so_luong integer NOT NULL DEFAULT 1,
  gia_ban decimal(15, 2) NOT NULL,
  thanh_tien decimal(15, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS hoa_don (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  don_hang_id uuid UNIQUE NOT NULL REFERENCES don_hang(id) ON DELETE CASCADE,
  phuong_thuc_thanh_toan text NOT NULL DEFAULT 'COD',
  trang_thai_thanh_toan boolean DEFAULT false,
  tong_tien decimal(15, 2) NOT NULL,
  ngay_thanh_toan timestamptz,
  ngay_tao timestamptz DEFAULT now()
);

-- =====================================================
-- 5. TẠO BẢNG PHẢN HỒI
-- =====================================================

CREATE TABLE IF NOT EXISTS phan_hoi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  khach_hang_id uuid NOT NULL REFERENCES khach_hang(id) ON DELETE CASCADE,
  nhan_vien_id uuid REFERENCES nhan_vien(id) ON DELETE SET NULL,
  tieu_de text NOT NULL,
  noi_dung text NOT NULL,
  tra_loi text,
  trang_thai text NOT NULL DEFAULT 'CHUA_TRA_LOI',
  ngay_tao timestamptz DEFAULT now(),
  ngay_tra_loi timestamptz
);

-- =====================================================
-- 6. TẠO INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tai_khoan_email ON tai_khoan(email);
CREATE INDEX IF NOT EXISTS idx_tai_khoan_vai_tro ON tai_khoan(ma_vai_tro);
CREATE INDEX IF NOT EXISTS idx_khach_hang_tai_khoan ON khach_hang(tai_khoan_id);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_tai_khoan ON nhan_vien(tai_khoan_id);
CREATE INDEX IF NOT EXISTS idx_dien_thoai_hang ON dien_thoai(hang_id);
CREATE INDEX IF NOT EXISTS idx_dien_thoai_mau_sac ON dien_thoai(mau_sac);
CREATE INDEX IF NOT EXISTS idx_don_hang_khach_hang ON don_hang(khach_hang_id);
CREATE INDEX IF NOT EXISTS idx_don_hang_trang_thai ON don_hang(ma_trang_thai);
CREATE INDEX IF NOT EXISTS idx_chi_tiet_don_hang ON chi_tiet_don_hang(don_hang_id);
CREATE INDEX IF NOT EXISTS idx_phan_hoi_khach_hang ON phan_hoi(khach_hang_id);
CREATE INDEX IF NOT EXISTS idx_phan_hoi_trang_thai ON phan_hoi(trang_thai);

-- =====================================================
-- 7. BẬT ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE tai_khoan ENABLE ROW LEVEL SECURITY;
ALTER TABLE khach_hang ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhan_vien ENABLE ROW LEVEL SECURITY;
ALTER TABLE hang_dien_thoai ENABLE ROW LEVEL SECURITY;
ALTER TABLE dien_thoai ENABLE ROW LEVEL SECURITY;
ALTER TABLE don_hang ENABLE ROW LEVEL SECURITY;
ALTER TABLE chi_tiet_don_hang ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoa_don ENABLE ROW LEVEL SECURITY;
ALTER TABLE phan_hoi ENABLE ROW LEVEL SECURITY;
ALTER TABLE lov_vai_tro ENABLE ROW LEVEL SECURITY;
ALTER TABLE lov_trang_thai_don ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. TẠO POLICIES CHO TAI_KHOAN
-- =====================================================

CREATE POLICY "Cho phép mọi người đăng ký tài khoản"
  ON tai_khoan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Người dùng xem tài khoản của mình"
  ON tai_khoan FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin xem tất cả tài khoản"
  ON tai_khoan FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

CREATE POLICY "Admin cập nhật tài khoản"
  ON tai_khoan FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

CREATE POLICY "Admin xóa tài khoản"
  ON tai_khoan FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- =====================================================
-- 9. TẠO POLICIES CHO KHACH_HANG
-- =====================================================

CREATE POLICY "Khách hàng tạo hồ sơ"
  ON khach_hang FOR INSERT
  TO authenticated
  WITH CHECK (tai_khoan_id = auth.uid());

CREATE POLICY "Khách hàng xem hồ sơ của mình"
  ON khach_hang FOR SELECT
  TO authenticated
  USING (tai_khoan_id = auth.uid());

CREATE POLICY "Admin và nhân viên xem tất cả khách hàng"
  ON khach_hang FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Khách hàng cập nhật hồ sơ"
  ON khach_hang FOR UPDATE
  TO authenticated
  USING (tai_khoan_id = auth.uid())
  WITH CHECK (tai_khoan_id = auth.uid());

CREATE POLICY "Admin xóa khách hàng"
  ON khach_hang FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- =====================================================
-- 10. TẠO POLICIES CHO NHAN_VIEN
-- =====================================================

CREATE POLICY "Admin tạo nhân viên"
  ON nhan_vien FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

CREATE POLICY "Admin và nhân viên xem nhân viên"
  ON nhan_vien FOR SELECT
  TO authenticated
  USING (
    tai_khoan_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

CREATE POLICY "Admin cập nhật nhân viên"
  ON nhan_vien FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

CREATE POLICY "Admin xóa nhân viên"
  ON nhan_vien FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- =====================================================
-- 11. TẠO POLICIES CHO HANG_DIEN_THOAI
-- =====================================================

CREATE POLICY "Mọi người xem hãng điện thoại"
  ON hang_dien_thoai FOR SELECT
  TO authenticated
  USING (trang_thai = true);

CREATE POLICY "Admin và nhân viên thêm hãng"
  ON hang_dien_thoai FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin và nhân viên cập nhật hãng"
  ON hang_dien_thoai FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin xóa hãng"
  ON hang_dien_thoai FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- =====================================================
-- 12. TẠO POLICIES CHO DIEN_THOAI
-- =====================================================

CREATE POLICY "Mọi người xem điện thoại"
  ON dien_thoai FOR SELECT
  TO authenticated
  USING (trang_thai = true);

CREATE POLICY "Admin và nhân viên thêm điện thoại"
  ON dien_thoai FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin và nhân viên cập nhật điện thoại"
  ON dien_thoai FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin xóa điện thoại"
  ON dien_thoai FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- =====================================================
-- 13. TẠO POLICIES CHO DON_HANG
-- =====================================================

CREATE POLICY "Khách hàng tạo đơn hàng"
  ON don_hang FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM khach_hang
      WHERE khach_hang.id = don_hang.khach_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Khách hàng xem đơn hàng của mình"
  ON don_hang FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM khach_hang
      WHERE khach_hang.id = don_hang.khach_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Admin và nhân viên xem tất cả đơn hàng"
  ON don_hang FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Khách hàng cập nhật đơn hàng của mình"
  ON don_hang FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM khach_hang
      WHERE khach_hang.id = don_hang.khach_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM khach_hang
      WHERE khach_hang.id = don_hang.khach_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Admin và nhân viên cập nhật đơn hàng"
  ON don_hang FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

-- =====================================================
-- 14. TẠO POLICIES CHO CHI_TIET_DON_HANG
-- =====================================================

CREATE POLICY "Khách hàng tạo chi tiết đơn hàng"
  ON chi_tiet_don_hang FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM don_hang
      JOIN khach_hang ON khach_hang.id = don_hang.khach_hang_id
      WHERE don_hang.id = chi_tiet_don_hang.don_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Khách hàng xem chi tiết đơn hàng của mình"
  ON chi_tiet_don_hang FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM don_hang
      JOIN khach_hang ON khach_hang.id = don_hang.khach_hang_id
      WHERE don_hang.id = chi_tiet_don_hang.don_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Admin và nhân viên xem tất cả chi tiết"
  ON chi_tiet_don_hang FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin và nhân viên cập nhật chi tiết"
  ON chi_tiet_don_hang FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

-- =====================================================
-- 15. TẠO POLICIES CHO HOA_DON
-- =====================================================

CREATE POLICY "Khách hàng xem hóa đơn của mình"
  ON hoa_don FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM don_hang
      JOIN khach_hang ON khach_hang.id = don_hang.khach_hang_id
      WHERE don_hang.id = hoa_don.don_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Admin và nhân viên xem tất cả hóa đơn"
  ON hoa_don FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin và nhân viên tạo hóa đơn"
  ON hoa_don FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin và nhân viên cập nhật hóa đơn"
  ON hoa_don FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

-- =====================================================
-- 16. TẠO POLICIES CHO PHAN_HOI
-- =====================================================

CREATE POLICY "Khách hàng tạo phản hồi"
  ON phan_hoi FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM khach_hang
      WHERE khach_hang.id = phan_hoi.khach_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Khách hàng xem phản hồi của mình"
  ON phan_hoi FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM khach_hang
      WHERE khach_hang.id = phan_hoi.khach_hang_id
      AND khach_hang.tai_khoan_id = auth.uid()
    )
  );

CREATE POLICY "Admin và nhân viên xem tất cả phản hồi"
  ON phan_hoi FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin và nhân viên trả lời phản hồi"
  ON phan_hoi FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

-- =====================================================
-- 17. TẠO POLICIES CHO LOV
-- =====================================================

CREATE POLICY "Mọi người xem vai trò"
  ON lov_vai_tro FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mọi người xem trạng thái đơn"
  ON lov_trang_thai_don FOR SELECT
  TO authenticated
  USING (true);
