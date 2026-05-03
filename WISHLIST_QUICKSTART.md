# 📋 Wishlist Feature - Quick Start Checklist

## ✅ Pre-Installation (Chuẩn Bị)

- [ ] Có database `computer_store` đã tạo sẵn
- [ ] Backend server (Node.js) đã cài đặt
- [ ] Frontend files đã có sẵn
- [ ] MySQL/MariaDB đang chạy

## ✅ Installation (Cài Đặt)

### Database Setup
- [ ] Mở MySQL console hoặc phpmyadmin
- [ ] Chọn database: `computer_store`
- [ ] Chạy file `wishlist_schema.sql` để tạo bảng
  ```sql
  -- Dán nội dung wishlist_schema.sql vào đây
  ```
- [ ] Kiểm tra 2 bảng được tạo: `wishlist` và `wishlist_item`

### Backend Setup
- [ ] Copy `backend/models/wishlistModel.js` ✓
- [ ] Copy `backend/controllers/wishlistController.js` ✓
- [ ] Copy `backend/routes/wishlistRoutes.js` ✓
- [ ] Kiểm tra `backend/server.js` đã import wishlist routes
  ```javascript
  app.use('/api/wishlist', require('./routes/wishlistRoutes'));
  ```

### Frontend Setup
- [ ] Copy `frontend/assets/js/wishlist.js` ✓
- [ ] Copy `frontend/pages/wishlist.html` ✓
- [ ] Tệp `frontend/pages/WISHLIST_EXAMPLE.html` là ví dụ (không bắt buộc)

## ✅ Configuration (Cấu Hình)

### Backend
- [ ] Kiểm tra `backend/config/db.js`:
  - Host: `localhost`
  - User: `root`
  - Password: `` (hoặc của bạn)
  - Database: `computer_store`

### Frontend
- [ ] Kiểm tra `frontend/assets/js/wishlist.js`:
  - API URL: `http://localhost:3000/api/wishlist`
  - Hàm `getUserId()` lấy từ localStorage

## ✅ Integration (Tích Hợp)

### Header/Navigation
- [ ] Thêm link đến `wishlist.html` trong header
  ```html
  <a href="wishlist.html">
    <i class="fas fa-heart"></i> Danh Sách Yêu Thích
    <span class="wishlist-count"></span>
  </a>
  ```

### Product Detail Page
- [ ] Thêm import script:
  ```html
  <script src="../assets/js/wishlist.js"></script>
  ```
- [ ] Thêm nút wishlist:
  ```html
  <button class="btn btn-outline-danger" 
          data-action="wishlist" 
          data-product-id="PRODUCT_ID">
    <i class="far fa-heart"></i> Thêm vào danh sách yêu thích
  </button>
  ```

### Product List Page
- [ ] Thêm import script: `wishlist.js`
- [ ] Thêm nút wishlist cho mỗi sản phẩm
- [ ] Gọi `updateWishlistButtons()` sau khi load danh sách

### Product Card Component
- [ ] Nếu có reusable card component, thêm nút wishlist vào
- [ ] Đảm bảo mỗi card có `data-product-id`

## ✅ Testing (Kiểm Thử)

### Backend API
- [ ] Test GET `/api/wishlist` - Lấy danh sách
- [ ] Test POST `/api/wishlist/add` - Thêm sản phẩm
- [ ] Test GET `/api/wishlist/check/:productId` - Kiểm tra
- [ ] Test DELETE `/api/wishlist/:id` - Xóa sản phẩm
- [ ] Test GET `/api/wishlist/count` - Lấy số lượng

```bash
# Ví dụ test với curl
curl -H "user-id: 1" http://localhost:3000/api/wishlist

curl -X POST \
  -H "user-id: 1" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}' \
  http://localhost:3000/api/wishlist/add
```

### Frontend
- [ ] Đăng nhập vào hệ thống
- [ ] Mở trang sản phẩm
- [ ] Click nút "Thêm vào danh sách yêu thích"
  - [ ] Nút chuyển đổi thành "Đã thích"
  - [ ] Thông báo hiển thị
- [ ] Kiểm tra badge counter cập nhật
- [ ] Click nút lại để xóa
  - [ ] Nút quay lại trạng thái ban đầu
  - [ ] Thông báo xóa hiển thị
- [ ] Truy cập trang `wishlist.html`
  - [ ] Xem danh sách sản phẩm yêu thích
  - [ ] Nút "Xóa" hoạt động
  - [ ] Nút "Thêm vào giỏ" hoạt động (nếu đã tích hợp)
  - [ ] Nút "Xóa tất cả" hoạt động

### Browser Console
- [ ] Không có lỗi JavaScript
- [ ] API calls thành công (Status 200)
- [ ] localStorage có user object

## ✅ Styling (Giao Diện)

- [ ] Thêm CSS styling vào `style.css`:
  ```css
  [data-action="wishlist"] { transition: all 0.3s ease; }
  [data-action="wishlist"].in-wishlist { 
    background-color: #e74c3c; 
    color: white;
  }
  ```
- [ ] Kiểm tra responsive trên mobile
- [ ] Kiểm tra button colors và states

## ✅ Advanced (Nâng Cao)

- [ ] Thêm animation khi thêm/xóa wishlist
- [ ] Integrate với shopping cart
- [ ] Thêm "Compare" feature với wishlist items
- [ ] Export wishlist
- [ ] Share wishlist với bạn bè
- [ ] Wishlist categories/collections

## ✅ Documentation (Tài Liệu)

- [ ] Đã đọc `WISHLIST_SUMMARY.md`
- [ ] Đã đọc `WISHLIST_INTEGRATION_GUIDE.md`
- [ ] Đã xem `WISHLIST_EXAMPLE.html`
- [ ] Hiểu các API endpoints
- [ ] Hiểu các hàm JavaScript

## ✅ Performance (Hiệu Năng)

- [ ] Wishlist items được cache trong localStorage (optional)
- [ ] Pagination cho danh sách lớn (optional)
- [ ] Lazy loading hình ảnh (optional)

## ✅ Security (Bảo Mật)

- [ ] Kiểm tra user-id trước mỗi operation
- [ ] Không tiết lộ wishlist của user khác
- [ ] SQL injection protection (đã sử dụng parameterized queries)
- [ ] CORS configuration đúng

## ✅ Final Steps (Bước Cuối)

- [ ] Restart backend server
- [ ] Clear browser cache/localStorage nếu có issue
- [ ] Test toàn bộ flow lần nữa
- [ ] Demo cho team/client
- [ ] Deploy lên production (nếu cần)

---

## 🔄 Troubleshooting Quick Links

| Vấn Đề | Giải Pháp |
|--------|----------|
| 404 API error | Kiểm tra server.js có import wishlistRoutes |
| User not found | Kiểm tra localStorage có user object |
| Cannot add to wishlist | Kiểm tra database connection |
| UI không update | Kiểm tra JavaScript có lỗi (F12 console) |
| CORS error | Kiểm tra CORS config trong server.js |
| Button không hiển thị | Kiểm tra CSS được load |

---

**Status**: ⏳ In Progress / ✅ Complete  
**Completed by**: [Your Name]  
**Date**: [Date]  
**Notes**: [Add any notes]
