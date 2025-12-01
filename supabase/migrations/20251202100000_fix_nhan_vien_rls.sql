-- Fix RLS policies for nhan_vien table to allow admin to create employees

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admin to insert nhan_vien" ON nhan_vien;
DROP POLICY IF EXISTS "Allow admin to update nhan_vien" ON nhan_vien;
DROP POLICY IF EXISTS "Allow admin to read nhan_vien" ON nhan_vien;

-- Enable RLS
ALTER TABLE nhan_vien ENABLE ROW LEVEL SECURITY;

-- Policy: Admin và nhân viên có thể đọc tất cả nhân viên
CREATE POLICY "Allow staff to read nhan_vien"
ON nhan_vien FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tai_khoan
    WHERE tai_khoan.id = auth.uid()
    AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
  )
  OR tai_khoan_id = auth.uid()
);

-- Policy: Admin có thể insert nhân viên mới
CREATE POLICY "Allow admin to insert nhan_vien"
ON nhan_vien FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tai_khoan
    WHERE tai_khoan.id = auth.uid()
    AND tai_khoan.ma_vai_tro = 'ADMIN'
  )
);

-- Policy: Admin có thể update nhân viên
CREATE POLICY "Allow admin to update nhan_vien"
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

-- Policy: Nhân viên có thể update thông tin của chính mình
CREATE POLICY "Allow employee to update own profile"
ON nhan_vien FOR UPDATE
TO authenticated
USING (tai_khoan_id = auth.uid())
WITH CHECK (tai_khoan_id = auth.uid());
