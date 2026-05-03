# Hướng Dẫn Tích Hợp Chức Năng Danh Sách Yêu Thích (Wishlist)

## 1. Chuẩn Bị Cơ Sở Dữ Liệu

Chạy file SQL `wishlist_schema.sql` để tạo các bảng cần thiết:
- `wishlist`: Lưu danh sách yêu thích của mỗi user
- `wishlist_item`: Lưu các sản phẩm trong danh sách yêu thích

## 2. Các File Đã Được Tạo

### Backend:
- `backend/models/wishlistModel.js` - Model xử lý logic wishlist
- `backend/controllers/wishlistController.js` - Controller xử lý request
- `backend/routes/wishlistRoutes.js` - Route định nghĩa API endpoints

### Frontend:
- `frontend/assets/js/wishlist.js` - JavaScript để xử lý wishlist
- `frontend/pages/wishlist.html` - Trang hiển thị danh sách yêu thích

## 3. API Endpoints

### GET /api/wishlist
Lấy danh sách yêu thích của user hiện tại
```
Headers:
- user-id: (required) ID của user
```

### POST /api/wishlist/add
Thêm sản phẩm vào danh sách yêu thích
```
Headers:
- user-id: (required) ID của user
Body:
{
  "productId": 1
}
```

### DELETE /api/wishlist/:wishlistItemId
Xóa sản phẩm khỏi danh sách yêu thích

### GET /api/wishlist/check/:productId
Kiểm tra sản phẩm có trong wishlist không
```
Headers:
- user-id: (required) ID của user
```

### GET /api/wishlist/count
Lấy số lượng sản phẩm trong wishlist

### DELETE /api/wishlist
Xóa toàn bộ danh sách yêu thích

## 4. Cách Sử Dụng Frontend

### 4.1. Trang Sản Phẩm (Product Detail)
Thêm nút wishlist vào trang chi tiết sản phẩm:

```html
<!-- Thêm script wishlist.js vào head hoặc trước </body> -->
<script src="../assets/js/wishlist.js"></script>

<!-- Thêm nút wishlist vào trang -->
<button class="btn btn-outline-danger" data-action="wishlist" data-product-id="1">
    <i class="far fa-heart"></i> Thêm vào danh sách yêu thích
</button>
```

### 4.2. Danh Sách Sản Phẩm
Thêm nút wishlist vào từng sản phẩm trong danh sách:

```html
<div class="product-item">
    <img src="..." alt="...">
    <h5>Tên sản phẩm</h5>
    <p class="price">Giá: 10,000,000đ</p>
    <div class="product-actions">
        <button class="btn btn-primary">
            <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
        </button>
        <button class="btn btn-outline-danger" data-action="wishlist" data-product-id="1">
            <i class="far fa-heart"></i>
        </button>
    </div>
</div>
```

### 4.3. Hiển Thị Số Lượng Wishlist
Thêm badge để hiển thị số lượng sản phẩm trong wishlist:

```html
<a href="wishlist.html">
    <i class="fas fa-heart"></i>
    <span class="wishlist-count" style="display: none;"></span>
</a>
```

## 5. Tích Hợp Với Trang Hiện Tại

### Cập Nhật frontend/pages/product-detail.html
Thêm dòng sau vào phần `<head>` hoặc trước `</body>`:
```html
<script src="../assets/js/wishlist.js"></script>
```

Thêm nút wishlist vào trang:
```html
<button class="btn btn-outline-danger" data-action="wishlist" data-product-id="<?php echo $product['id']; ?>">
    <i class="far fa-heart"></i> Yêu thích
</button>
```

### Cập Nhật frontend/assets/js/product.js
Khi hiển thị sản phẩm, thêm attribute cho nút wishlist:
```javascript
// Sau khi hiển thị sản phẩm, cập nhật nút wishlist
if (window.updateWishlistButtons) {
    updateWishlistButtons();
}
```

### Cập Nhật frontend/components/header.html
Thêm link đến trang wishlist:
```html
<a href="wishlist.html" class="nav-link">
    <i class="fas fa-heart"></i> Yêu thích
    <span class="wishlist-count" style="display: none;"></span>
</a>
```

## 6. Ví Dụ CSS Styling

Thêm vào `frontend/assets/css/style.css`:

```css
/* Wishlist Button */
[data-action="wishlist"] {
    transition: all 0.3s ease;
}

[data-action="wishlist"].in-wishlist {
    background-color: #e74c3c;
    color: white;
    border-color: #e74c3c;
}

[data-action="wishlist"].in-wishlist:hover {
    background-color: #c0392b;
    border-color: #c0392b;
}

[data-action="wishlist"]:hover {
    transform: scale(1.05);
}

.wishlist-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: red;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
}
```

## 7. Các Hàm JavaScript Có Sẵn

### `addToWishlist(productId)`
Thêm sản phẩm vào wishlist

### `removeFromWishlist(wishlistItemId)`
Xóa sản phẩm khỏi wishlist

### `getWishlist()`
Lấy danh sách yêu thích của user

### `checkProductInWishlist(productId)`
Kiểm tra sản phẩm có trong wishlist không

### `updateWishlistButtons()`
Cập nhật trạng thái tất cả nút wishlist trên trang

### `updateWishlistCount()`
Cập nhật số lượng sản phẩm trong wishlist

## 8. Lưu Ý

1. **Xác Thực Người Dùng**: Chức năng wishlist yêu cầu user phải đăng nhập
2. **User ID**: Lấy từ `localStorage.getItem('user')` (cần user object trong localStorage)
3. **CORS Headers**: API sử dụng header `user-id` để xác định user
4. **Toast/Notification**: Sử dụng hàm `showMessage()` để hiển thị thông báo

## 9. Kiểm Thử

1. Đăng nhập vào hệ thống
2. Mở trang sản phẩm
3. Click nút "Thêm vào danh sách yêu thích"
4. Kiểm tra trong console xem API call
5. Truy cập trang wishlist.html để xem danh sách yêu thích
