-- Fix RLS policies for khach_hang table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admin to insert khach_hang" ON khach_hang;
DROP POLICY IF EXISTS "Allow admin to read khach_hang" ON khach_hang;
DROP POLICY IF EXISTS "Allow admin to update khach_hang" ON khach_hang;

-- Enable RLS
ALTER TABLE khach_hang ENABLE ROW LEVEL SECURITY;

-- Policy: Admin và nhân viên có thể đọc tất cả khách hàng
CREATE POLICY "Allow staff to read khach_hang"
ON khach_hang FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tai_khoan
    WHERE tai_khoan.id = auth.uid()
    AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
  )
  OR tai_khoan_id = auth.uid()
);

-- Policy: Admin có thể insert khách hàng mới
CREATE POLICY "Allow admin to insert khach_hang"
ON khach_hang FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tai_khoan
    WHERE tai_khoan.id = auth.uid()
    AND tai_khoan.ma_vai_tro = 'ADMIN'
  )
);

-- Policy: Khách hàng có thể tự đăng ký (insert chính mình)
CREATE POLICY "Allow customer self registration"
ON khach_hang FOR INSERT
TO authenticated
WITH CHECK (tai_khoan_id = auth.uid());

-- Policy: Admin có thể update khách hàng
CREATE POLICY "Allow admin to update khach_hang"
ON khach_hang FOR UPDATE
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

-- Policy: Khách hàng có thể update thông tin của chính mình
CREATE POLICY "Allow customer to update own profile"
ON khach_hang FOR UPDATE
TO authenticated
USING (tai_khoan_id = auth.uid())
WITH CHECK (tai_khoan_id = auth.uid());
