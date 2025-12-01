# ⚡ DEPLOY NHANH - 5 PHÚT

## 🎯 Cách nhanh nhất: VERCEL

### Bước 1: Tạo tài khoản Vercel
1. Vào https://vercel.com
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"**
4. Cho phép Vercel truy cập GitHub

### Bước 2: Push code lên GitHub

#### Nếu chưa có repo GitHub:
1. Vào https://github.com/new
2. Tạo repo mới (vd: `phone-store`)
3. Chạy lệnh:

```bash
cd project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/phone-store.git
git push -u origin main
```

### Bước 3: Deploy trên Vercel

1. Vào https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import"** bên cạnh repo `phone-store`
4. Vercel tự động detect Vite
5. Click **"Environment Variables"**
6. Thêm 2 biến:
   - Name: `VITE_SUPABASE_URL`
     Value: `https://your-project.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `your-anon-key-here`
7. Click **"Deploy"**

### Bước 4: Đợi 1-2 phút

Vercel sẽ:
- ✅ Install dependencies
- ✅ Build project
- ✅ Deploy lên CDN
- ✅ Tạo SSL certificate

### Bước 5: Lấy link

Sau khi deploy xong, bạn sẽ có link:
```
https://phone-store-abc123.vercel.app
```

✅ **XONG!** Trang web đã online!

---

## 🔧 Cập nhật Supabase

Để trang web hoạt động, cần thêm domain vào Supabase:

1. Vào https://supabase.com
2. Chọn project
3. Settings → API
4. Scroll xuống **"URL Configuration"**
5. Thêm domain Vercel vào **"Site URL"**:
   ```
   https://phone-store-abc123.vercel.app
   ```
6. Save

---

## 🚀 Auto Deploy

Từ giờ, mỗi khi bạn cập nhật code:

```bash
git add .
git commit -m "Update feature"
git push
```

→ Vercel tự động deploy!
→ Trang web cập nhật sau 1-2 phút!

---

## 📱 Chia sẻ link

Gửi link cho khách hàng:
```
https://phone-store-abc123.vercel.app
```

Họ có thể:
- ✅ Xem sản phẩm
- ✅ Đặt hàng
- ✅ Xem đơn hàng

Bạn quản lý tại:
```
https://phone-store-abc123.vercel.app/admin
```

---

## 🎨 Domain riêng (Tùy chọn)

Nếu muốn domain đẹp hơn (vd: `cuahang.com`):

1. Mua domain tại Namecheap (~$10/năm)
2. Vào Vercel → Settings → Domains
3. Add domain `cuahang.com`
4. Làm theo hướng dẫn của Vercel
5. Đợi 24h để DNS propagate

---

## ⚠️ LƯU Ý

### Environment Variables
Đừng commit file `.env` lên GitHub!
Chỉ thêm trên Vercel Dashboard.

### Supabase CORS
Nhớ thêm domain Vercel vào Supabase Settings.

### Build errors
Nếu deploy lỗi, check logs trên Vercel Dashboard.

---

## 💡 TIPS

### 1. Preview Deployments
Mỗi Pull Request tự động tạo preview URL để test.

### 2. Rollback
Nếu deploy lỗi, click "Rollback" trên Vercel để quay lại version cũ.

### 3. Analytics
Vercel cung cấp analytics miễn phí để xem traffic.

### 4. Custom Domain
Có thể thêm nhiều domain (www, non-www, subdomain).

---

## 🆘 Troubleshooting

### Lỗi: "Build failed"
→ Chạy `npm run build` local để test

### Lỗi: "Environment variables not found"
→ Check lại Environment Variables trên Vercel

### Lỗi: "Supabase connection failed"
→ Check CORS settings trên Supabase

### Trang trắng sau deploy
→ Check Console (F12) để xem lỗi
→ Thường do thiếu Environment Variables

---

## 📞 Hỗ trợ

Nếu cần giúp:
1. Check Vercel logs
2. Check browser console (F12)
3. Verify Environment Variables
4. Test local build: `npm run build && npm run preview`
