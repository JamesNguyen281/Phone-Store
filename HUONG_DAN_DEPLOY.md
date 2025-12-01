# 🚀 HƯỚNG DẪN DEPLOY TRANG WEB ONLINE

## 🎯 Các nền tảng MIỄN PHÍ tốt nhất

### 1. ⭐ VERCEL (Khuyến nghị - Dễ nhất)

**Ưu điểm:**
- ✅ Hoàn toàn MIỄN PHÍ
- ✅ Deploy tự động từ GitHub
- ✅ SSL/HTTPS miễn phí
- ✅ CDN toàn cầu (nhanh)
- ✅ Domain miễn phí: `ten-ban-chon.vercel.app`

**Cách deploy:**

#### Bước 1: Tạo tài khoản
1. Vào https://vercel.com
2. Sign up bằng GitHub (khuyến nghị)

#### Bước 2: Push code lên GitHub
```bash
# Trong thư mục project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/ten-repo.git
git push -u origin main
```

#### Bước 3: Deploy trên Vercel
1. Vào Vercel Dashboard
2. Click **"New Project"**
3. Import repository từ GitHub
4. Vercel tự động detect Vite
5. Thêm Environment Variables:
   - `VITE_SUPABASE_URL`: URL Supabase của bạn
   - `VITE_SUPABASE_ANON_KEY`: Anon key của Supabase
6. Click **"Deploy"**

✅ **Xong!** Trang web sẽ online sau 1-2 phút tại `https://ten-ban-chon.vercel.app`

---

### 2. 🔥 NETLIFY (Thay thế tốt)

**Ưu điểm:**
- ✅ Miễn phí
- ✅ Deploy từ GitHub hoặc drag & drop
- ✅ SSL miễn phí
- ✅ Domain: `ten-ban-chon.netlify.app`

**Cách deploy:**

#### Cách 1: Drag & Drop (Nhanh nhất)
```bash
# Build project
npm run build
```
1. Vào https://netlify.com
2. Kéo thả thư mục `dist` vào Netlify
3. Thêm Environment Variables trong Settings
4. Done!

#### Cách 2: Deploy từ GitHub
1. Push code lên GitHub (như Vercel)
2. Vào Netlify → New site from Git
3. Chọn repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Thêm Environment Variables
7. Deploy

---

### 3. 🌐 GITHUB PAGES (Đơn giản)

**Ưu điểm:**
- ✅ Miễn phí
- ✅ Tích hợp GitHub
- ✅ Domain: `username.github.io/repo-name`

**Cách deploy:**

#### Bước 1: Cài đặt gh-pages
```bash
npm install --save-dev gh-pages
```

#### Bước 2: Thêm vào package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://username.github.io/repo-name"
}
```

#### Bước 3: Deploy
```bash
npm run deploy
```

**Lưu ý:** GitHub Pages không hỗ trợ Environment Variables tốt, cần hardcode hoặc dùng GitHub Actions.

---

### 4. 🚀 CLOUDFLARE PAGES

**Ưu điểm:**
- ✅ Miễn phí
- ✅ CDN cực nhanh
- ✅ Unlimited bandwidth
- ✅ Domain: `ten-ban-chon.pages.dev`

**Cách deploy:**
1. Vào https://pages.cloudflare.com
2. Connect GitHub
3. Chọn repo
4. Build command: `npm run build`
5. Output directory: `dist`
6. Thêm Environment Variables
7. Deploy

---

## 📋 CHECKLIST TRƯỚC KHI DEPLOY

### 1. Chuẩn bị Environment Variables
Tạo file `.env.production`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Test build local
```bash
npm run build
npm run preview
```

### 3. Cập nhật Supabase Settings
1. Vào Supabase Dashboard
2. Settings → API
3. Thêm domain deploy vào **Allowed Origins**:
   - `https://ten-ban-chon.vercel.app`
   - `https://ten-ban-chon.netlify.app`

### 4. Tạo .gitignore
```
node_modules/
dist/
.env
.env.local
.env.production
```

---

## 🎯 KHUYẾN NGHỊ

### Cho người mới:
**→ Dùng VERCEL** (Dễ nhất, tự động nhất)

### Cho người có kinh nghiệm:
**→ Dùng NETLIFY hoặc CLOUDFLARE PAGES**

---

## 🔧 DEPLOY NHANH BẰNG VERCEL (5 PHÚT)

### Bước 1: Cài Vercel CLI
```bash
npm install -g vercel
```

### Bước 2: Login
```bash
vercel login
```

### Bước 3: Deploy
```bash
cd project
vercel
```

### Bước 4: Thêm Environment Variables
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Bước 5: Deploy lại
```bash
vercel --prod
```

✅ **Done!** Link sẽ hiện ra: `https://ten-project.vercel.app`

---

## 🌟 DOMAIN TÙY CHỈNH (Tùy chọn)

Nếu muốn domain riêng (vd: `cuahang.com`):

1. Mua domain tại:
   - Namecheap (~$10/năm)
   - GoDaddy
   - Google Domains

2. Trỏ domain về Vercel/Netlify:
   - Vào DNS Settings
   - Thêm CNAME record
   - Trỏ về domain của Vercel/Netlify

3. Xác nhận trên Vercel/Netlify
   - Settings → Domains
   - Add custom domain
   - Verify

---

## 📱 AUTO DEPLOY

Sau khi setup xong, mỗi khi bạn push code lên GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

→ Vercel/Netlify tự động build và deploy!
→ Trang web cập nhật sau 1-2 phút!

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:
1. Check build logs trên Vercel/Netlify
2. Kiểm tra Environment Variables
3. Test `npm run build` local trước
4. Check Supabase CORS settings

---

## 💰 CHI PHÍ

- **Vercel Free:** Unlimited projects, 100GB bandwidth/tháng
- **Netlify Free:** Unlimited projects, 100GB bandwidth/tháng
- **Cloudflare Pages Free:** Unlimited bandwidth
- **GitHub Pages Free:** 100GB bandwidth/tháng

→ **Hoàn toàn đủ cho dự án nhỏ và vừa!**
