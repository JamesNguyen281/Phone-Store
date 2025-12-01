# 📱 Hệ thống Quản lý Bán Điện thoại

Hệ thống quản lý bán điện thoại toàn diện với React + TypeScript + Supabase, được chuyển đổi từ MySQL schema.

## ✨ Tính năng

### 👥 Cho Khách hàng
- 🛍️ Xem và tìm kiếm sản phẩm
- 🛒 Quản lý giỏ hàng
- 📦 Đặt hàng và theo dõi đơn hàng
- 📱 Xem chi tiết sản phẩm và thuộc tính

### 👨‍💼 Cho Nhân viên
- 📊 Quản lý sản phẩm (CRUD)
- 📋 Quản lý đơn hàng
- 📦 Quản lý tồn kho
- 🧾 Tạo hóa đơn bán/nhập
- 📈 Xem thống kê cơ bản

### 👑 Cho Admin
- ✅ Tất cả quyền của nhân viên
- 🏢 Quản lý hãng điện thoại
- 📂 Quản lý loại sản phẩm
- 👤 Quản lý tài khoản
- 📊 Xem báo cáo chi tiết

## 🚀 Quick Start

### 1. Cài đặt

```bash
cd project
npm install
```

### 2. Cấu hình Database

#### Option A: Supabase Cloud (Khuyến nghị)

1. Tạo project tại [supabase.com](https://supabase.com)
2. Copy `.env.example` thành `.env` và điền thông tin:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Áp dụng migrations:

```bash
npm install -g supabase
supabase link --project-ref your-project-ref
npm run db:push
```

#### Option B: Supabase Local

```bash
npm run db:start
```

### 3. Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt: http://localhost:5173

## 🔑 Tài khoản mẫu

### Admin
- Email: `admin@example.com`
- Password: `123456`

### Nhân viên
- `nvban1@example.com` / `123456`
- `nvban2@example.com` / `123456`
- `nvkho1@example.com` / `123456`
- `nvketoan@example.com` / `123456`

### Khách hàng
- `a@example.com` - Nguyễn Văn A
- `b@example.com` - Trần Thị B
- `c@example.com` - Lê Văn C

## 📊 Database Schema

### Các bảng chính

1. **tai_khoan** - Tài khoản đăng nhập
2. **nhan_vien** - Thông tin nhân viên
3. **khach_hang** - Thông tin khách hàng
4. **hang** - Hãng điện thoại (Apple, Samsung, Xiaomi, OPPO, Vivo)
5. **loai_san_pham** - Loại sản phẩm (Điện thoại, Phụ kiện, v.v.)
6. **san_pham** - Sản phẩm
7. **thuoc_tinh_san_pham** - Thuộc tính chi tiết sản phẩm
8. **hoa_don** - Hóa đơn (bán và nhập)
9. **chi_tiet_hoa_don** - Chi tiết hóa đơn

Chi tiết: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## 🛠️ Scripts

```bash
# Development
npm run dev              # Chạy dev server
npm run build            # Build production
npm run preview          # Preview production build
npm run typecheck        # Kiểm tra TypeScript
npm run lint             # Lint code

# Database
npm run db:start         # Khởi động Supabase local
npm run db:stop          # Dừng Supabase local
npm run db:reset         # Reset database và chạy lại migrations
npm run db:push          # Push migrations lên Supabase
npm run db:diff          # Xem sự khác biệt schema
npm run db:status        # Kiểm tra trạng thái Supabase
```

## 📁 Cấu trúc thư mục

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication
│   │   ├── Products/       # Quản lý sản phẩm
│   │   ├── Orders/         # Quản lý đơn hàng
│   │   ├── Shop/           # Giao diện shop
│   │   ├── Cart/           # Giỏ hàng
│   │   ├── Dashboard/      # Dashboard
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── CartContext.tsx # Cart context
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   ├── database-helpers.ts # Helper functions
│   │   └── test-connection.ts  # Test utilities
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── App.tsx             # Main app
├── supabase/
│   └── migrations/         # Database migrations
├── .env                    # Environment variables
├── package.json
└── README.md
```

## 💡 Sử dụng Database Helpers

```typescript
import {
  getSanPhamDangKinhDoanh,
  timKiemSanPham,
  taoHoaDonBanHang,
  thongKeDoanhThu,
  sanPhamBanChay,
} from './lib/database-helpers';

// Lấy sản phẩm đang kinh doanh
const sanPham = await getSanPhamDangKinhDoanh();

// Tìm kiếm sản phẩm
const ketQua = await timKiemSanPham('iPhone');

// Tạo hóa đơn bán hàng
const hoaDon = await taoHoaDonBanHang({
  maNv: 'nhan-vien-id',
  maKh: 'khach-hang-id',
  ghiChu: 'Bán lẻ tại quầy',
  sanPham: [
    {
      maSp: 'san-pham-id',
      soLuong: 1,
      donGia: 18000000,
      giamGia: 0,
      baoHanh: 12,
    },
  ],
});

// Thống kê doanh thu
const doanhThu = await thongKeDoanhThu('2025-01-01', '2025-01-31');

// Sản phẩm bán chạy
const topSanPham = await sanPhamBanChay(10);
```

## 🔒 Security

### Row Level Security (RLS)

Database được bảo vệ bởi RLS policies:

- **Public**: Xem sản phẩm, hãng, loại sản phẩm
- **Khách hàng**: Xem đơn hàng của mình
- **Nhân viên**: Quản lý sản phẩm, đơn hàng
- **Admin**: Toàn quyền

### Best Practices

- ✅ Mật khẩu nên được hash (hiện tại chỉ demo)
- ✅ Sử dụng Supabase Auth cho authentication
- ✅ Validate input trước khi lưu database
- ✅ Sử dụng prepared statements (Supabase tự động)
- ✅ Kiểm tra quyền trước khi thực hiện actions

## 🧪 Testing

### Test kết nối database

```typescript
import { runAllTests } from './lib/test-connection';

// Trong component hoặc console
runAllTests();
```

Output sẽ hiển thị:
- ✅ Trạng thái kết nối
- ✅ Số lượng dữ liệu trong các bảng
- ✅ Dữ liệu mẫu
- ✅ RLS policies

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Hướng dẫn bắt đầu nhanh
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Chi tiết schema
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Hướng dẫn migration
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Tóm tắt migration

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas

## 📦 Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0",
    "jspdf": "^3.0.4",
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "vite": "^5.4.2",
    "tailwindcss": "^3.4.1",
    "@vitejs/plugin-react": "^4.3.1"
  }
}
```

## ❓ Troubleshooting

### Lỗi kết nối Supabase

```bash
# Kiểm tra .env
cat .env

# Kiểm tra Supabase status
npm run db:status

# Xem logs
supabase logs
```

### Lỗi migrations

```bash
# Reset database
npm run db:reset

# Hoặc chạy từng migration
supabase db reset --debug
```

### Lỗi TypeScript

```bash
# Kiểm tra types
npm run typecheck

# Xem diagnostics
npm run lint
```

## 🚀 Deployment

### Supabase

1. Tạo project tại [supabase.com](https://supabase.com)
2. Push migrations: `npm run db:push`
3. Cấu hình RLS policies (đã có sẵn trong migrations)

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy thư mục `dist/`
3. Cấu hình environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 👨‍💻 Author

Hệ thống được phát triển dựa trên MySQL schema và chuyển đổi sang Supabase PostgreSQL.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [React](https://react.dev) - UI Framework
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework
- [Vite](https://vitejs.dev) - Build Tool

---

**Happy Coding! 🎉**

Nếu gặp vấn đề, vui lòng tạo issue hoặc xem documentation trong thư mục project.
