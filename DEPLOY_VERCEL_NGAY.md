# ⚡ DEPLOY LÊN VERCEL NGAY - 3 PHÚT

## Bước 1: Push code lên GitHub

### Nếu chưa có repo GitHub:
1. Vào https://github.com/new
2. Tạo repo mới (vd: `phone-store`)
3. **KHÔNG** tick "Initialize with README"
4. Click "Create repository"

### Chạy lệnh trong terminal:

```bash
cd project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/phone-store.git
git push -u origin main
```

**Thay `USERNAME` bằng username GitHub của bạn!**

---

## Bước 2: Import vào Vercel

1. Vào https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Tìm repo `phone-store` → Click **"Import"**
4. Vercel tự động detect:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **"Environment Variables"** (mở rộng)
6. Thêm 2 biến:

   **Biến 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: (Copy từ Supabase Dashboard → Settings → API → Project URL)
   
   **Biến 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: (Copy từ Supabase Dashboard → Settings → API → anon public key)

7. Click **"Deploy"**

---

## Bước 3: Đợi deploy (1-2 phút)

Vercel sẽ:
- ✅ Clone code từ GitHub
- ✅ Install dependencies
- ✅ Build project
- ✅ Deploy lên CDN
- ✅ Tạo SSL certificate

---

## Bước 4: Lấy link

Sau khi deploy xong, bạn sẽ thấy:
```
🎉 Congratulations!
Your project is live at:
https://phone-store-abc123.vercel.app
```

**Copy link này!**

---

## Bước 5: Cập nhật Supabase CORS

**QUAN TRỌNG:** Để trang web hoạt động, phải thêm domain vào Supabase:

1. Vào https://supabase.com
2. Chọn project của bạn
3. Settings → API
4. Scroll xuống **"URL Configuration"**
5. Trong ô **"Site URL"**, thêm:
   ```
   https://phone-store-abc123.vercel.app
   ```
   (Thay bằng link Vercel của bạn)
6. Click **"Save"**

---

## ✅ XONG!

Bây giờ:
- ✅ Trang web đã online
- ✅ Khách hàng có thể truy cập
- ✅ Đặt hàng hoạt động
- ✅ Admin panel hoạt động

**Link trang web:** `https://phone-store-abc123.vercel.app`
**Link admin:** `https://phone-store-abc123.vercel.app/admin`

---

## 🔄 Cập nhật sau này

Mỗi khi sửa code:

```bash
git add .
git commit -m "Update feature"
git push
```

→ Vercel tự động deploy!
→ Trang web cập nhật sau 1-2 phút!

---

## 🎨 Đổi tên domain (Tùy chọn)

Nếu không thích tên `phone-store-abc123.vercel.app`:

1. Vào Vercel Dashboard
2. Chọn project
3. Settings → Domains
4. Click **"Edit"** bên cạnh domain
5. Đổi thành tên khác (vd: `cuahang-dienthoai.vercel.app`)
6. Save

**Lưu ý:** Nhớ cập nhật lại domain mới trong Supabase!

---

## ⚠️ Checklist trước khi deploy

- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Vercel
- [ ] Đã có Supabase project
- [ ] Đã copy SUPABASE_URL và ANON_KEY
- [ ] Code đang chạy tốt trên local

---

## 🆘 Nếu gặp lỗi

### Lỗi: "Build failed"
→ Chạy `npm run build` local để test
→ Sửa lỗi rồi push lại

### Lỗi: "Environment variables not found"
→ Check lại Environment Variables trên Vercel
→ Đảm bảo có prefix `VITE_`

### Trang trắng sau deploy
→ Mở Console (F12) xem lỗi
→ Thường do thiếu Environment Variables
→ Hoặc chưa cập nhật CORS trên Supabase

### Lỗi CORS
→ Vào Supabase → Settings → API
→ Thêm domain Vercel vào Site URL
→ Đợi 1-2 phút để cập nhật

---

## 📱 Chia sẻ với khách hàng

Gửi link cho khách:
```
https://phone-store-abc123.vercel.app
```

Họ có thể:
- Xem sản phẩm
- Thêm vào giỏ hàng
- Đặt hàng
- Xem đơn hàng của mình

Bạn quản lý tại:
```
https://phone-store-abc123.vercel.app/admin
```

Login bằng tài khoản admin đã tạo trong Supabase.

---

## 💡 Tips

1. **Preview Deployments:** Mỗi branch tự động tạo preview URL
2. **Rollback:** Nếu deploy lỗi, click "Rollback" để quay lại version cũ
3. **Analytics:** Xem traffic miễn phí trên Vercel Dashboard
4. **Logs:** Check logs để debug nếu có lỗi

---

**Bắt đầu ngay! Chỉ mất 3 phút!** 🚀
