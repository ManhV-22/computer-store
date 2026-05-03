// frontend/assets/js/wishlist.js
const WISHLIST_API = 'http://localhost:3000/api/wishlist';

// Lấy user ID từ localStorage
function getUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user.user_id;
    return userId ? String(userId) : null;
}

// Lấy danh sách yêu thích
async function getWishlist() {
    try {
        const userId = getUserId();
        if (!userId) {
            showMessage('Vui lòng đăng nhập để xem danh sách yêu thích', 'warning');
            return [];
        }

        const response = await fetch(`${WISHLIST_API}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Lỗi lấy wishlist:', error);
        return [];
    }
}

// Thêm sản phẩm vào danh sách yêu thích
async function addToWishlist(productId) {
    try {
        const userId = getUserId();
        if (!userId) {
            showMessage('Vui lòng đăng nhập để thêm vào danh sách yêu thích', 'warning');
            window.location.href = '/frontend/pages/login.html';
            return;
        }

        const response = await fetch(`${WISHLIST_API}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();
        if (window.showNotification) {
            window.showNotification(data.message, data.success ? 'success' : 'error');
        } else {
            showMessage(data.message, data.success ? 'success' : 'error');
        }
        
        if (data.success) {
            updateWishlistButton(productId, true, data.wishlistItemId);
            if (window.updateWishlistCount) window.updateWishlistCount();
        }
    } catch (error) {
        console.error('Lỗi thêm vào wishlist:', error);
        showMessage('Lỗi thêm vào danh sách yêu thích', 'error');
    }
}

// Xóa sản phẩm khỏi danh sách yêu thích
async function removeFromWishlist(wishlistItemId) {
    try {
        const response = await fetch(`${WISHLIST_API}/${wishlistItemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (window.showNotification) {
            window.showNotification(data.message, data.success ? 'success' : 'error');
        } else {
            showMessage(data.message, data.success ? 'success' : 'error');
        }
        
        if (data.success) {
            const wishlistItem = document.querySelector(`[data-wishlist-id="${wishlistItemId}"]`);
            if (wishlistItem) {
                wishlistItem.remove();
            }
            if (window.updateWishlistCount) window.updateWishlistCount();
        }
    } catch (error) {
        console.error('Lỗi xóa khỏi wishlist:', error);
        showMessage('Lỗi xóa khỏi danh sách yêu thích', 'error');
    }
}

// Kiểm tra sản phẩm có trong wishlist không
async function checkProductInWishlist(productId) {
    try {
        const userId = getUserId();
        if (!userId) {
            return null;
        }

        const response = await fetch(`${WISHLIST_API}/check/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        const data = await response.json();
        return data.exists ? data.wishlistItemId : null;
    } catch (error) {
        console.error('Lỗi kiểm tra wishlist:', error);
        return null;
    }
}

// Cập nhật nút wishlist
function updateWishlistButton(productId, inWishlist, wishlistItemId = null) {
    const button = document.querySelector(`[data-product-id="${productId}"][data-action="wishlist"]`);
    if (button) {
        if (inWishlist) {
            button.classList.add('in-wishlist');
            button.innerHTML = '<i class="fas fa-heart"></i> Đã thích';
            if (wishlistItemId) {
                button.dataset.wishlistItemId = wishlistItemId;
            }
        } else {
            button.classList.remove('in-wishlist');
            button.innerHTML = '<i class="far fa-heart"></i> Thêm vào danh sách yêu thích';
            delete button.dataset.wishlistItemId;
        }
    }
}

// Hiển thị thông báo
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 3000);
}

// Khởi tạo wishlist
function initWishlist() {
    if (window.updateWishlistCount) window.updateWishlistCount();
    
    // Xử lý sự kiện nút wishlist
    document.addEventListener('click', async (e) => {
        if (e.target.closest('[data-action="wishlist"]')) {
            const button = e.target.closest('[data-action="wishlist"]');
            const productId = button.dataset.productId;
            const inWishlist = button.classList.contains('in-wishlist');
            
            if (inWishlist) {
                const wishlistItemId = button.dataset.wishlistItemId;
                if (wishlistItemId) {
                    await removeFromWishlist(wishlistItemId);
                    updateWishlistButton(productId, false);
                }
            } else {
                await addToWishlist(productId);
            }
        }
    });
}

// Kiểm tra và cập nhật nút wishlist trên trang
async function updateWishlistButtons() {
    const buttons = document.querySelectorAll('[data-action="wishlist"]');
    for (const button of buttons) {
        const productId = button.dataset.productId;
        const wishlistItemId = await checkProductInWishlist(productId);
        updateWishlistButton(productId, wishlistItemId !== null, wishlistItemId);
    }
}

// Chạy khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWishlist);
} else {
    initWishlist();
}
