# Chức Năng Danh Sách Yêu Thích (Wishlist) - Tổng Hợp

## 📋 Tóm Tắt
Đã thêm chức năng danh sách yêu thích (wishlist) đầy đủ cho ứng dụng Computer Store. User có thể thêm/xóa sản phẩm yêu thích và xem danh sách tất cả các sản phẩm đã thích.

## 📁 Cấu Trúc Tệp Được Tạo

### Backend (API Server)
```
backend/
├── models/
│   └── wishlistModel.js          (Model xử lý logic wishlist)
├── controllers/
│   └── wishlistController.js     (Controller xử lý request)
└── routes/
    └── wishlistRoutes.js         (Route định nghĩa API endpoints)
```

### Frontend (Client)
```
frontend/
├── assets/
│   └── js/
│       └── wishlist.js           (JavaScript xử lý wishlist)
└── pages/
    ├── wishlist.html             (Trang hiển thị danh sách yêu thích)
    └── WISHLIST_EXAMPLE.html     (Ví dụ tích hợp)
```

### Cơ Sở Dữ Liệu
```
wishlist_schema.sql              (Script tạo bảng database)
```

### Tài Liệu
```
WISHLIST_INTEGRATION_GUIDE.md    (Hướng dẫn tích hợp chi tiết)
WISHLIST_SUMMARY.md              (File này)
```

## 🗄️ Cơ Sở Dữ Liệu

### Bảng: wishlist
```sql
CREATE TABLE wishlist (
  id int PRIMARY KEY AUTO_INCREMENT,
  user_id int NOT NULL UNIQUE,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Bảng: wishlist_item
```sql
CREATE TABLE wishlist_item (
  id int PRIMARY KEY AUTO_INCREMENT,
  wishlist_id int NOT NULL,
  product_id int NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wishlist_id) REFERENCES wishlist(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY wishlist_product (wishlist_id, product_id)
);
```

## 🔌 API Endpoints

| Phương Thức | Endpoint | Mô Tả |
|------------|----------|-------|
| GET | /api/wishlist | Lấy danh sách yêu thích |
| GET | /api/wishlist/count | Lấy số lượng sản phẩm |
| GET | /api/wishlist/check/:productId | Kiểm tra sản phẩm có trong wishlist |
| POST | /api/wishlist/add | Thêm sản phẩm vào wishlist |
| DELETE | /api/wishlist/:wishlistItemId | Xóa sản phẩm khỏi wishlist |
| DELETE | /api/wishlist | Xóa toàn bộ danh sách |

## 🛠️ Các Chức Năng Chính

### 1. Xem Danh Sách Yêu Thích
- Hiển thị tất cả sản phẩm user đã thêm vào yêu thích
- Hiển thị: tên, hình ảnh, giá, danh mục, thương hiệu, kho

### 2. Thêm Sản Phẩm Vào Yêu Thích
- Click nút "Yêu thích" trên trang sản phẩm
- Tự động thêm vào wishlist (nếu chưa có)
- Hiển thị thông báo xác nhận

### 3. Xóa Sản Phẩm Khỏi Yêu Thích
- Click nút "Xóa" trong danh sách yêu thích
- Hoặc click lại nút "Yêu thích" trên trang sản phẩm
- Tự động cập nhật

### 4. Quản Lý Danh Sách
- Xóa tất cả sản phẩm cùng lúc
- Xem số lượng sản phẩm trong wishlist
- Thêm sản phẩm vào giỏ hàng từ danh sách yêu thích

## 📱 Giao Diện

### Trang Wishlist (wishlist.html)
- Header: Tiêu đề, số lượng sản phẩm, nút xóa tất cả
- Nội dung chính: Danh sách các sản phẩm yêu thích
- Footer: Thông tin khác
- Responsive: Tối ưu cho mobile

### Thành Phần Sản Phẩm Trong Danh Sách
```
┌─────────────────────────────────────────┐
│ [Image] │ Tên sản phẩm                 │
│         │ Danh mục: ...                 │
│         │ Thương hiệu: ...              │
│         │ Kho: ... sản phẩm             │
│         │ Giá: 10,000,000 VND           │
│         │ [Thêm vào giỏ] [Xóa]         │
└─────────────────────────────────────────┘
```

## 🔐 Xác Thực

- Sử dụng header `user-id` để xác định user
- User ID lấy từ `localStorage.getItem('user')`
- Yêu cầu user phải đăng nhập để sử dụng

## 🎨 CSS Classes & Styles

```css
/* Wishlist Item */
.wishlist-item { ... }
.wishlist-item img { ... }
.wishlist-info { ... }
.wishlist-price { ... }
.wishlist-actions { ... }

/* Buttons */
.btn-add-cart { background: #27ae60; }
.btn-remove { background: #e74c3c; }

/* Status */
[data-action="wishlist"].in-wishlist { ... }

/* Empty State */
.empty-wishlist { ... }
```

## 💻 Hàm JavaScript Utili Available

```javascript
// Lấy danh sách
getWishlist()

// Thêm sản phẩm
addToWishlist(productId)

// Xóa sản phẩm
removeFromWishlist(wishlistItemId)

// Kiểm tra
checkProductInWishlist(productId)

// Cập nhật UI
updateWishlistButtons()
updateWishlistCount()

// Hiển thị thông báo
showMessage(message, type)
```

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Tạo Bảng Database
```bash
# Mở MySQL/phpmyadmin
# Chọn database: computer_store
# Chạy file: wishlist_schema.sql
```

### Bước 2: Backend
- Copy các file từ `backend/` đến project
- Đã cập nhật `server.js` để import wishlist routes

### Bước 3: Frontend
- Copy các file từ `frontend/` đến project
- Thêm `<script src="../assets/js/wishlist.js"></script>` vào trang

### Bước 4: Tích Hợp
- Thêm nút wishlist vào product detail page
- Thêm link đến wishlist.html trong header
- Thêm CSS styling từ WISHLIST_INTEGRATION_GUIDE.md

## 📝 Ví Dụ Sử Dụng

### Thêm Nút Wishlist
```html
<button class="btn btn-outline-danger" data-action="wishlist" data-product-id="1">
    <i class="far fa-heart"></i> Thêm vào danh sách yêu thích
</button>
```

### Kiểm Tra Wishlist
```javascript
const inWishlist = await checkProductInWishlist(productId);
if (inWishlist) {
    console.log('Sản phẩm đã có trong wishlist');
}
```

### Hiển Thị Số Lượng
```html
<span class="wishlist-count"></span>
<script>updateWishlistCount();</script>
```

## ⚠️ Lưu Ý Quan Trọng

1. **User ID**: Phải có user đăng nhập
2. **API URL**: Mặc định là `http://localhost:3000`
3. **CORS**: Đã cấu hình trong server.js
4. **Local Storage**: User object được lưu trong localStorage
5. **Xác Thực**: Kiểm tra user-id header trong mỗi request

## 🐛 Troubleshooting

### Không thể thêm vào wishlist
- Kiểm tra user đã đăng nhập?
- Kiểm tra localStorage có user object?
- Kiểm tra console xem API response?

### Database error
- Chạy wishlist_schema.sql?
- Kiểm tra connection trong config/db.js?

### API 404
- Kiểm tra server.js đã import wishlistRoutes?
- Kiểm tra port 3000?

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. File WISHLIST_INTEGRATION_GUIDE.md
2. Console trong browser (F12)
3. Network tab để xem API response
4. Server logs trong terminal

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 2024  
**Tác giả**: Development Team
