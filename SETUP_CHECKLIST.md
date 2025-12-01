# ✅ Setup Checklist - Hệ thống Bán Điện thoại

Sử dụng checklist này để đảm bảo hệ thống được cài đặt và cấu hình đúng cách.

## 📋 Pre-requisites

- [ ] Node.js >= 18.x đã được cài đặt
- [ ] npm hoặc yarn đã được cài đặt
- [ ] Git đã được cài đặt (optional)
- [ ] Tài khoản Supabase (nếu dùng cloud) hoặc Docker (nếu dùng local)

## 🔧 Installation

### 1. Clone/Download Project
- [ ] Project đã được download hoặc clone
- [ ] Đã cd vào thư mục `project/`

### 2. Install Dependencies
```bash
npm install
```
- [ ] Tất cả dependencies đã được cài đặt thành công
- [ ] Không có lỗi trong quá trình cài đặt

### 3. Supabase CLI (Optional nhưng khuyến nghị)
```bash
npm install -g supabase
```
- [ ] Supabase CLI đã được cài đặt
- [ ] Chạy `supabase --version` để kiểm tra

## 🗄️ Database Setup

### Option A: Supabase Cloud

#### 1. Tạo Project
- [ ] Đã tạo project tại [supabase.com](https://supabase.com)
- [ ] Project đã được khởi tạo thành công

#### 2. Lấy Credentials
- [ ] Đã vào Settings → API
- [ ] Đã copy Project URL
- [ ] Đã copy Anon/Public Key

#### 3. Cấu hình Environment
- [ ] Đã copy `.env.example` thành `.env`
- [ ] Đã điền `VITE_SUPABASE_URL`
- [ ] Đã điền `VITE_SUPABASE_ANON_KEY`

#### 4. Link Project
```bash
supabase link --project-ref your-project-ref
```
- [ ] Project đã được link thành công

#### 5. Push Migrations
```bash
npm run db:push
```
- [ ] Migrations đã được áp dụng thành công
- [ ] Không có lỗi trong quá trình migration

### Option B: Supabase Local

#### 1. Start Supabase
```bash
npm run db:start
```
- [ ] Supabase local đã khởi động thành công
- [ ] Docker containers đang chạy

#### 2. Cấu hình Environment
- [ ] Đã copy `.env.example` thành `.env`
- [ ] Đã điền `VITE_SUPABASE_URL=http://localhost:54321`
- [ ] Đã điền `VITE_SUPABASE_ANON_KEY` (từ output của db:start)

#### 3. Migrations
- [ ] Migrations đã tự động được áp dụng khi start

## ✅ Verification

### 1. Kiểm tra Database

#### Supabase Dashboard
- [ ] Đã mở Supabase Dashboard
- [ ] Thấy 9 bảng trong schema public:
  - [ ] tai_khoan
  - [ ] nhan_vien
  - [ ] khach_hang
  - [ ] hang
  - [ ] loai_san_pham
  - [ ] san_pham
  - [ ] thuoc_tinh_san_pham
  - [ ] hoa_don
  - [ ] chi_tiet_hoa_don

#### Kiểm tra dữ liệu mẫu
- [ ] Bảng `hang`: 5 hãng (Apple, Samsung, Xiaomi, OPPO, Vivo)
- [ ] Bảng `loai_san_pham`: 5 loại
- [ ] Bảng `san_pham`: 6 sản phẩm
- [ ] Bảng `tai_khoan`: 10 tài khoản (5 nhân viên + 5 khách hàng)
- [ ] Bảng `nhan_vien`: 5 nhân viên (1 admin + 4 nhân viên)
- [ ] Bảng `khach_hang`: 5 khách hàng

### 2. Kiểm tra RLS Policies

Trong Supabase Dashboard → Authentication → Policies:

- [ ] `hang`: 2 policies (public view, admin manage)
- [ ] `loai_san_pham`: 2 policies (public view, admin manage)
- [ ] `san_pham`: 3 policies (public view active, staff view all, staff manage)
- [ ] `thuoc_tinh_san_pham`: 2 policies (public view, staff manage)
- [ ] `hoa_don`: 3 policies (customer view own, staff view all, staff manage)
- [ ] `chi_tiet_hoa_don`: 3 policies (customer view own, staff view all, staff manage)

### 3. Test Connection

Chạy test script:
```typescript
import { runAllTests } from './lib/test-connection';
runAllTests();
```

- [ ] Kết nối Supabase thành công
- [ ] Lấy được dữ liệu từ tất cả bảng
- [ ] RLS policies hoạt động đúng

## 🚀 Run Application

### 1. Start Dev Server
```bash
npm run dev
```
- [ ] Dev server đã khởi động thành công
- [ ] Không có lỗi trong console
- [ ] Ứng dụng mở tại http://localhost:5173

### 2. Kiểm tra UI
- [ ] Trang chủ hiển thị đúng
- [ ] Không có lỗi trong browser console
- [ ] Không có lỗi TypeScript

### 3. Test Authentication

#### Đăng nhập Admin
- [ ] Mở trang đăng nhập
- [ ] Đăng nhập với `admin@example.com` / `123456`
- [ ] Đăng nhập thành công
- [ ] Redirect đến dashboard
- [ ] Thấy menu admin

#### Đăng nhập Nhân viên
- [ ] Đăng xuất
- [ ] Đăng nhập với `nvban1@example.com` / `123456`
- [ ] Đăng nhập thành công
- [ ] Thấy menu nhân viên

#### Đăng nhập Khách hàng
- [ ] Đăng xuất
- [ ] Đăng nhập với `a@example.com`
- [ ] Đăng nhập thành công
- [ ] Thấy giao diện khách hàng

### 4. Test Features

#### Xem sản phẩm
- [ ] Danh sách sản phẩm hiển thị đúng
- [ ] Hình ảnh, giá, tên sản phẩm hiển thị
- [ ] Filter theo hãng hoạt động
- [ ] Tìm kiếm hoạt động

#### Giỏ hàng
- [ ] Thêm sản phẩm vào giỏ hàng
- [ ] Cập nhật số lượng
- [ ] Xóa sản phẩm
- [ ] Tính tổng tiền đúng

#### Đặt hàng (nếu đã implement)
- [ ] Tạo đơn hàng thành công
- [ ] Xem lịch sử đơn hàng
- [ ] Chi tiết đơn hàng hiển thị đúng

#### Quản lý sản phẩm (Admin/Staff)
- [ ] Xem danh sách sản phẩm
- [ ] Thêm sản phẩm mới
- [ ] Sửa sản phẩm
- [ ] Xóa sản phẩm
- [ ] Cập nhật tồn kho

## 📊 Performance Check

- [ ] Trang load nhanh (< 3s)
- [ ] Không có memory leaks
- [ ] Database queries tối ưu
- [ ] Images load đúng

## 🔒 Security Check

- [ ] RLS policies đã được enable
- [ ] Không thể truy cập dữ liệu của người khác
- [ ] API keys không bị expose trong code
- [ ] .env file đã được gitignore

## 📝 Documentation Check

- [ ] Đã đọc README.md
- [ ] Đã đọc QUICK_START.md
- [ ] Đã đọc DATABASE_SCHEMA.md
- [ ] Hiểu cấu trúc database
- [ ] Hiểu cách sử dụng helper functions

## 🎯 Next Steps

Sau khi hoàn thành checklist:

### Immediate
- [ ] Customize UI theo brand
- [ ] Thêm logo và branding
- [ ] Cấu hình email templates (Supabase Auth)

### Short-term
- [ ] Implement file upload cho hình ảnh
- [ ] Thêm validation forms
- [ ] Implement error handling
- [ ] Thêm loading states

### Long-term
- [ ] Implement real-time features
- [ ] Thêm notifications
- [ ] Optimize performance
- [ ] Deploy to production

## ❌ Common Issues

### Issue: Cannot connect to Supabase
**Solution:**
- Kiểm tra .env file
- Kiểm tra internet connection
- Verify Supabase project status

### Issue: Migrations failed
**Solution:**
```bash
npm run db:reset
```

### Issue: RLS blocking queries
**Solution:**
- Kiểm tra policies trong Supabase Dashboard
- Verify user authentication
- Check user role

### Issue: TypeScript errors
**Solution:**
```bash
npm run typecheck
```

### Issue: Port already in use
**Solution:**
```bash
# Change port in vite.config.ts
# Or kill process using port 5173
```

## 📞 Support

Nếu gặp vấn đề không có trong checklist:

1. Kiểm tra logs: `supabase logs`
2. Xem browser console
3. Đọc documentation files
4. Check Supabase Dashboard

## ✅ Final Verification

Trước khi bắt đầu development:

- [ ] ✅ Tất cả items trong checklist đã được check
- [ ] ✅ Application chạy không lỗi
- [ ] ✅ Database có đầy đủ dữ liệu mẫu
- [ ] ✅ Authentication hoạt động
- [ ] ✅ RLS policies hoạt động đúng
- [ ] ✅ Đã đọc và hiểu documentation

---

**🎉 Congratulations! Hệ thống đã sẵn sàng để sử dụng!**

Bắt đầu development với:
```bash
npm run dev
```

Happy coding! 🚀
