# ✅ CHECKLIST DEPLOY

## Trước khi deploy

- [ ] Code đang chạy tốt trên local (`npm run dev`)
- [ ] Đã test build (`npm run build`)
- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Vercel (đã login bằng GitHub)
- [ ] Đã có Supabase project
- [ ] Đã copy SUPABASE_URL từ Supabase Dashboard
- [ ] Đã copy SUPABASE_ANON_KEY từ Supabase Dashboard

## Bước 1: Push lên GitHub

- [ ] Tạo repo mới trên GitHub: https://github.com/new
- [ ] Chạy `push-to-github.bat` HOẶC chạy lệnh:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/USERNAME/REPO.git
  git push -u origin main
  ```

## Bước 2: Deploy trên Vercel

- [ ] Vào https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import repo từ GitHub
- [ ] Vercel tự động detect Vite
- [ ] Thêm Environment Variables:
  - [ ] `VITE_SUPABASE_URL` = `https://xxx.supabase.co`
  - [ ] `VITE_SUPABASE_ANON_KEY` = `eyJxxx...`
- [ ] Click "Deploy"
- [ ] Đợi 1-2 phút

## Bước 3: Lấy link

- [ ] Copy link deploy: `https://xxx.vercel.app`
- [ ] Test trang web: Mở link trong browser
- [ ] Test đăng nhập admin
- [ ] Test xem sản phẩm

## Bước 4: Cập nhật Supabase

- [ ] Vào https://supabase.com
- [ ] Settings → API
- [ ] Thêm domain Vercel vào "Site URL"
- [ ] Save
- [ ] Đợi 1-2 phút

## Bước 5: Test lại

- [ ] Refresh trang web
- [ ] Test đăng nhập
- [ ] Test xem sản phẩm
- [ ] Test thêm vào giỏ hàng
- [ ] Test đặt hàng
- [ ] Test admin panel
- [ ] Test quản lý đơn hàng

## Sau khi deploy

- [ ] Lưu link trang web
- [ ] Lưu link admin panel
- [ ] Chia sẻ link với khách hàng
- [ ] Test trên mobile
- [ ] Test trên các trình duyệt khác

## Cập nhật sau này

Mỗi khi sửa code:
```bash
git add .
git commit -m "Update feature"
git push
```
→ Vercel tự động deploy!

## Troubleshooting

### Build failed
- [ ] Chạy `npm run build` local
- [ ] Sửa lỗi
- [ ] Push lại

### Trang trắng
- [ ] Check Console (F12)
- [ ] Check Environment Variables
- [ ] Check Supabase CORS

### Lỗi CORS
- [ ] Vào Supabase Settings
- [ ] Thêm domain Vercel
- [ ] Đợi 1-2 phút

### Không load được data
- [ ] Check Environment Variables
- [ ] Check Supabase connection
- [ ] Check Network tab (F12)

## Links quan trọng

- GitHub Repo: `https://github.com/USERNAME/REPO`
- Vercel Dashboard: `https://vercel.com/dashboard`
- Trang web: `https://xxx.vercel.app`
- Admin panel: `https://xxx.vercel.app/admin`
- Supabase Dashboard: `https://supabase.com/dashboard`

## Ghi chú

- Vercel miễn phí: 100GB bandwidth/tháng
- Auto deploy khi push code
- SSL/HTTPS miễn phí
- CDN toàn cầu
- Preview deployments cho mỗi branch
