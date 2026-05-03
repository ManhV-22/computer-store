# 🎁 Chức Năng Danh Sách Yêu Thích (Wishlist) - README

## 📖 Giới Thiệu

Chức năng Danh Sách Yêu Thích cho phép khách hàng lưu các sản phẩm yêu thích để xem sau hoặc so sánh. Đây là một tính năng quan trọng cho e-commerce, giúp:

✅ Khách hàng quản lý sản phẩm yêu thích  
✅ Tăng engagement và customer retention  
✅ Thu thập dữ liệu về sở thích khách hàng  
✅ Giúp khách hàng quyết định mua sắm dễ hơn  

## 🎯 Tính Năng Chính

### 1. 💾 Lưu Sản Phẩm Yêu Thích
- Click nút "❤️ Yêu thích" trên bất kỳ trang sản phẩm
- Sản phẩm được tự động lưu vào danh sách
- Thông báo xác nhận hiển thị

### 2. 📋 Xem Danh Sách Yêu Thích
- Trang riêng `wishlist.html` hiển thị tất cả sản phẩm yêu thích
- Thông tin sản phẩm: ảnh, tên, giá, danh mục, thương hiệu
- Số lượng sản phẩm trong kho

### 3. 🗑️ Quản Lý Wishlist
- Xóa sản phẩm riêng lẻ
- Xóa toàn bộ danh sách cùng lúc
- Cập nhật tự động

### 4. 🛒 Tích Hợp Giỏ Hàng
- Thêm sản phẩm yêu thích vào giỏ hàng trực tiếp
- Không cần rời khỏi trang wishlist

### 5. 📊 Số Lượng Wishlist
- Badge hiển thị số sản phẩm trong wishlist
- Cập nhật real-time khi thêm/xóa

## 📦 Nội Dung Gói

```
📁 wishlist-feature/
├── 📁 backend/
│   ├── models/wishlistModel.js          # Logic xử lý
│   ├── controllers/wishlistController.js # API handlers
│   └── routes/wishlistRoutes.js         # Route definitions
├── 📁 frontend/
│   ├── assets/js/wishlist.js            # Frontend logic
│   ├── pages/wishlist.html              # Wishlist page
│   └── pages/WISHLIST_EXAMPLE.html      # Integration example
├── 📄 wishlist_schema.sql               # Database creation
├── 📄 WISHLIST_SUMMARY.md               # Summary
├── 📄 WISHLIST_INTEGRATION_GUIDE.md     # Detailed guide
├── 📄 WISHLIST_QUICKSTART.md            # Quick checklist
└── 📄 README.md                         # File này
```

## 🗄️ Cấu Trúc Database

### Bảng: `wishlist`
```sql
┌─────────────┬──────────┬─────────────────────┐
│ Column      │ Type     │ Description         │
├─────────────┼──────────┼─────────────────────┤
│ id          │ INT      │ Primary Key         │
│ user_id     │ INT      │ FK → users(id)      │
│ created_at  │ DATETIME │ Timestamp           │
└─────────────┴──────────┴─────────────────────┘
```

### Bảng: `wishlist_item`
```sql
┌─────────────┬──────────┬──────────────────────────┐
│ Column      │ Type     │ Description              │
├─────────────┼──────────┼──────────────────────────┤
│ id          │ INT      │ Primary Key              │
│ wishlist_id │ INT      │ FK → wishlist(id)        │
│ product_id  │ INT      │ FK → products(id)        │
│ created_at  │ DATETIME │ Timestamp                │
└─────────────┴──────────┴──────────────────────────┘
```

## 🔌 API Endpoints

### 1️⃣ GET `/api/wishlist`
**Lấy danh sách yêu thích**

```javascript
fetch('http://localhost:3000/api/wishlist', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'user-id': 1
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "wishlist_item_id": 1,
      "id": 1,
      "name": "Laptop Dell XPS 13",
      "price": 25000000,
      "image": "img/products/laptop1.jpg",
      "category_name": "Laptop",
      "brand_name": "Dell",
      "quantity": 5
    }
  ]
}
```

### 2️⃣ POST `/api/wishlist/add`
**Thêm sản phẩm vào wishlist**

```javascript
fetch('http://localhost:3000/api/wishlist/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'user-id': 1
  },
  body: JSON.stringify({ productId: 1 })
})
.then(res => res.json())
.then(data => console.log(data))
```

**Response:**
```json
{
  "success": true,
  "message": "Thêm vào danh sách yêu thích thành công"
}
```

### 3️⃣ DELETE `/api/wishlist/:wishlistItemId`
**Xóa sản phẩm khỏi wishlist**

```javascript
fetch('http://localhost:3000/api/wishlist/1', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data))
```

### 4️⃣ GET `/api/wishlist/check/:productId`
**Kiểm tra sản phẩm có trong wishlist không**

```javascript
fetch('http://localhost:3000/api/wishlist/check/1', {
  method: 'GET',
  headers: { 'user-id': 1 }
})
.then(res => res.json())
.then(data => console.log(data.exists)) // true/false
```

### 5️⃣ GET `/api/wishlist/count`
**Lấy số lượng sản phẩm trong wishlist**

```javascript
fetch('http://localhost:3000/api/wishlist/count', {
  method: 'GET',
  headers: { 'user-id': 1 }
})
.then(res => res.json())
.then(data => console.log(data.count))
```

### 6️⃣ DELETE `/api/wishlist`
**Xóa toàn bộ wishlist**

```javascript
fetch('http://localhost:3000/api/wishlist', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
})
```

## 💻 Hàm JavaScript

### `getWishlist()`
Lấy danh sách sản phẩm yêu thích
```javascript
const items = await getWishlist();
console.log(items);
```

### `addToWishlist(productId)`
Thêm sản phẩm vào wishlist
```javascript
await addToWishlist(1);
```

### `removeFromWishlist(wishlistItemId)`
Xóa sản phẩm khỏi wishlist
```javascript
await removeFromWishlist(5);
```

### `checkProductInWishlist(productId)`
Kiểm tra sản phẩm có trong wishlist không
```javascript
const inWishlist = await checkProductInWishlist(1);
if (inWishlist) {
  console.log('Sản phẩm đã được yêu thích');
}
```

### `updateWishlistButtons()`
Cập nhật trạng thái tất cả nút wishlist
```javascript
updateWishlistButtons();
```

### `updateWishlistCount()`
Cập nhật số lượng trong badge
```javascript
updateWishlistCount();
```

## 🎨 HTML/CSS Usage

### Thêm Nút Wishlist
```html
<button class="btn btn-outline-danger" 
        data-action="wishlist" 
        data-product-id="1">
  <i class="far fa-heart"></i> Yêu thích
</button>
```

### Hiển Thị Số Lượng
```html
<a href="wishlist.html">
  <i class="fas fa-heart"></i>
  <span class="wishlist-count"></span>
</a>
```

### CSS Styling
```css
/* Button states */
[data-action="wishlist"] {
  transition: all 0.3s ease;
}

[data-action="wishlist"].in-wishlist {
  background-color: #e74c3c;
  color: white;
}

/* Badge */
.wishlist-count {
  position: absolute;
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## 🚀 Cài Đặt Nhanh

### Step 1: Database
```bash
# Mở MySQL/phpMyAdmin
# Chọn database: computer_store
# Chạy wishlist_schema.sql
```

### Step 2: Backend
```javascript
// Trong backend/server.js, đã thêm:
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
```

### Step 3: Frontend - Product Detail Page
```html
<!-- Thêm vào trước </body> -->
<script src="../assets/js/wishlist.js"></script>

<!-- Thêm nút wishlist -->
<button data-action="wishlist" data-product-id="1">
  <i class="far fa-heart"></i> Yêu thích
</button>
```

### Step 4: Frontend - Header
```html
<!-- Thêm link trong header -->
<a href="wishlist.html">
  <i class="fas fa-heart"></i> Wishlist
  <span class="wishlist-count"></span>
</a>
```

## 🔄 User Flow

```
┌─────────────────┐
│ Khách hàng      │
└────────┬────────┘
         │
         ├─► Xem sản phẩm
         │   └─► Click "❤️ Yêu thích"
         │       └─► Thêm vào wishlist
         │           └─► Thông báo xác nhận
         │
         ├─► Xem danh sách yêu thích
         │   └─► Click link wishlist
         │       └─► Hiển thị tất cả sản phẩm
         │           ├─► Xóa sản phẩm
         │           ├─► Thêm vào giỏ
         │           └─► Xóa toàn bộ
         │
         └─► Quay lại trang sản phẩm
             └─► Nút wishlist đã cập nhật (✓)
```

## 🔒 Security

- ✅ Kiểm tra user-id header
- ✅ Sử dụng parameterized queries
- ✅ Không tiết lộ wishlist của user khác
- ✅ CORS được cấu hình
- ✅ Input validation

## 📱 Responsive Design

- ✅ Desktop: Wishlist items hiển thị theo hàng
- ✅ Tablet: Responsive layout
- ✅ Mobile: Stack vertically, buttons full width
- ✅ Touch-friendly buttons

## 🧪 Kiểm Thử

### Unit Testing
```javascript
// Test addToWishlist
describe('Wishlist', () => {
  it('should add product to wishlist', async () => {
    const result = await addToWishlist(1);
    expect(result.success).toBe(true);
  });
});
```

### Manual Testing Checklist
- [ ] Đăng nhập
- [ ] Thêm sản phẩm vào wishlist
- [ ] Nút chuyển thành "✓ Đã thích"
- [ ] Xem trang wishlist
- [ ] Sản phẩm hiển thị đúng
- [ ] Xóa sản phẩm
- [ ] Thêm vào giỏ hàng
- [ ] Xóa toàn bộ wishlist

## 🐛 Troubleshooting

| Lỗi | Giải Pháp |
|-----|----------|
| 404 API Error | Kiểm tra server.js import wishlistRoutes |
| Cannot find user | Kiểm tra localStorage user object |
| Database error | Chạy wishlist_schema.sql |
| Button không cập nhật | Kiểm tra JavaScript console |
| CORS error | Kiểm tra backend CORS config |

## 📚 Tài Liệu Liên Quan

- `WISHLIST_INTEGRATION_GUIDE.md` - Hướng dẫn chi tiết
- `WISHLIST_QUICKSTART.md` - Checklist nhanh
- `WISHLIST_EXAMPLE.html` - Ví dụ tích hợp
- `wishlist_schema.sql` - Database schema

## 🎓 Học Thêm

### Concepts
- REST API Design
- Database Relationships
- Frontend-Backend Integration
- Real-time UI Updates
- User Authentication

### Technologies
- Node.js/Express
- MySQL
- JavaScript/Fetch API
- HTML/CSS
- Bootstrap

## 🚢 Deployment

### Production Considerations
- [ ] Environment variables
- [ ] Database backups
- [ ] Error logging
- [ ] Performance optimization
- [ ] CDN for assets
- [ ] Rate limiting

## 🤝 Contributing

Để cải thiện chức năng:
1. Report bugs
2. Suggest features
3. Submit pull requests

## 📄 License

[Your License Here]

## 👥 Support

- **Email**: support@computerstore.com
- **Issues**: GitHub Issues
- **Documentation**: See docs folder

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready

---

## 🎉 Chúc Mừng!

Bạn đã thêm thành công chức năng Wishlist!  
Khách hàng bây giờ có thể lưu và quản lý sản phẩm yêu thích. 🎁❤️
