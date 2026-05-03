// URL của Backend (Bạn điều chỉnh cho đúng với project của bạn)
const API_URL = window.API_URL || 'http://localhost:3000/api';
let currentProduct = null; // Biến lưu toàn bộ data của sản phẩm đang xem
let selectedVariant = "Đen tuyền (Mặc định)"; // Màu sắc mặc định ban đầu
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
    
    setupVariantButtons();
    setupReviewForm();
});
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert('Không tìm thấy mã sản phẩm!');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const product = await response.json();

        if (!product || product.message) throw new Error("Sản phẩm không tồn tại");

        currentProduct = product;

        // --- XỬ LÝ HIỂN THỊ DANH SÁCH ẢNH (THUMBNAILS) ---
        const thumbList = document.getElementById('thumb-list');
        let mainImgUrl = "https://placehold.co/600x600/eeeeee/999999?text=No+Image";
        
        if (product.image) {
            // 1. Tách chuỗi và làm sạch ký tự lạ (ngoặc vuông, dấu nháy)
            const allImages = product.image.split(',')
                .map(img => img.trim().replace(/[\[\]"']/g, ""))
                .filter(img => img !== ""); // Loại bỏ các chuỗi rỗng do lỗi cắt cụt

            if (allImages.length > 0) {
                // 2. Tạo HTML cho danh sách ảnh nhỏ
                thumbList.innerHTML = allImages.map((imgName, index) => {
                    const currentUrl = imgName.startsWith('http') 
                        ? imgName 
                        : `../assets/img/products/${imgName}`;
                    
                    // Lấy ảnh đầu tiên làm ảnh chính
                    if (index === 0) mainImgUrl = currentUrl;

                    return `
                        <div class="thumb-item ${index === 0 ? 'active' : ''}" 
                             onclick="changeMainImage(this, '${currentUrl}')">
                            <img src="${currentUrl}" 
                                 onerror="this.parentElement.style.display='none'">
                        </div>
                    `;
                }).join('');
            }
        }

        // 3. Đổ dữ liệu vào HTML
        document.getElementById('main-img').src = mainImgUrl;
        document.getElementById('breadcrumb-name').innerText = product.name;
        document.getElementById('detail-name').innerText = product.name;
        document.getElementById('detail-price').innerText = Number(product.price).toLocaleString('vi-VN') + ' ₫';
        
        // Xử lý mô tả
        const descElement = document.getElementById('detail-desc');
        descElement.innerHTML = (product.description && product.description !== 'null') 
            ? product.description 
            : "Thông tin đang được cập nhật...";

        updateRatingUI(product.average_rating, product.total_reviews);
        renderReviews(product.reviews);

        loadRelatedProducts(productId);
        loadSamePriceProducts(productId, product.price);
        
        // Initialize wishlist button
        initializeWishlistButton(productId);
        
    } catch (error) {
        console.error('Lỗi tải chi tiết:', error);
    }
}

// Hàm đổi ảnh chính (Cần thêm vào để xử lý khi click ảnh nhỏ)
window.changeMainImage = function(element, url) {
    document.getElementById('main-img').src = url;
    
    // Đổi trạng thái active cho viền ảnh nhỏ
    document.querySelectorAll('.thumb-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
};

// Hàm tăng giảm số lượng input
function changeQuantity(amount) {
    let input = document.getElementById('buy-qty');
    let currentValue = parseInt(input.value);
    let newValue = currentValue + amount;
    if (newValue >= 1) {
        input.value = newValue;
    }
}

// Hàm thêm vào giỏ hàng (Bạn sẽ nối với logic Giỏ hàng sau)
function addToCartFromDetail() {
    let qty = document.getElementById('buy-qty').value;
    alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng! (Chức năng đang hoàn thiện)`);
}

// Hàm tải sản phẩm liên quan
async function loadRelatedProducts(currentProductId) {
    try {
        // Gọi API lấy toàn bộ sản phẩm (hoặc API lấy theo danh mục nếu Backend hỗ trợ)
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        // Lọc bỏ sản phẩm hiện tại đang xem và lấy 5 sản phẩm ngẫu nhiên/mới nhất
        const related = products.filter(p => p.id != currentProductId).slice(0, 5);

        const container = document.getElementById('related-products-list');
        let html = '';

        related.forEach(prod => {
            // Logic xử lý đường dẫn ảnh (giống trang chủ)
            let imgUrl = "https://placehold.co/400x400/eeeeee/999999?text=No+Image";
            if (prod.image) {
                let cleanImg = prod.image.split(',')[0].trim().replace(/[\[\]"']/g, "");
                if (cleanImg.startsWith('http')) {
                    imgUrl = cleanImg;
                } else if (cleanImg !== "") {
                    imgUrl = `../assets/img/products/${cleanImg}`;
                }
            }

            // Tạo mã HTML cho từng thẻ
            html += `
                <div class="related-card">
                    <a href="detail.html?id=${prod.id}">
                        <img src="${imgUrl}" alt="${prod.name}" 
                             onerror="this.onerror=null; this.src='https://placehold.co/400x400/eeeeee/999999?text=L%E1%BB%97i+%E1%BA%A2nh';">
                        <h4 class="related-title" title="${prod.name}">${prod.name}</h4>
                        <div class="related-price">${Number(prod.price).toLocaleString('vi-VN')} ₫</div>
                    </a>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm liên quan:', error);
        document.getElementById('related-products-list').innerHTML = '<p>Không thể tải sản phẩm liên quan lúc này.</p>';
    }
}

// Hàm tải sản phẩm cùng phân khúc giá (+/- 20%)
async function loadSamePriceProducts(currentProductId, currentPrice) {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        // Tính toán khoảng giá: Thấp hơn 20% và cao hơn 20%
        const minPrice = currentPrice * 0.8;
        const maxPrice = currentPrice * 1.2;

        // Lọc: Bỏ sản phẩm đang xem VÀ Giá phải nằm trong khoảng min - max
        const samePriceProducts = products.filter(p => 
            p.id != currentProductId && 
            p.price >= minPrice && 
            p.price <= maxPrice
        ).slice(0, 5); // Lấy tối đa 5 sản phẩm để vừa 1 hàng

        const container = document.getElementById('same-price-products-list');
        let html = '';

        if (samePriceProducts.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666; padding: 20px;">Chưa có sản phẩm nào cùng phân khúc giá.</p>';
            return;
        }

        samePriceProducts.forEach(prod => {
            // Xử lý ảnh giống hệt các phần khác
            let imgUrl = "https://placehold.co/400x400/eeeeee/999999?text=No+Image";
            if (prod.image) {
                let cleanImg = prod.image.split(',')[0].trim().replace(/[\[\]"']/g, "");
                if (cleanImg.startsWith('http')) {
                    imgUrl = cleanImg;
                } else if (cleanImg !== "") {
                    imgUrl = `../assets/img/products/${cleanImg}`;
                }
            }

            html += `
                <div class="related-card">
                    <a href="detail.html?id=${prod.id}">
                        <img src="${imgUrl}" alt="${prod.name}" 
                             onerror="this.onerror=null; this.src='https://placehold.co/400x400/eeeeee/999999?text=L%E1%BB%97i+%E1%BA%A2nh';">
                        <h4 class="related-title" title="${prod.name}">${prod.name}</h4>
                        <div class="related-price">${Number(prod.price).toLocaleString('vi-VN')} ₫</div>
                    </a>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm cùng phân khúc:', error);
    }
}

function updateRatingUI(avgRating, totalReviews) {
    const starContainer = document.getElementById('detail-average-stars');
    const reviewCount = document.getElementById('detail-review-count');
    const averageScore = document.getElementById('average-score');
    const totalCount = document.getElementById('total-reviews');
    
    if (!starContainer || !reviewCount) return;

    let stars = '';
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }

    starContainer.innerHTML = stars;
    if (reviewCount) reviewCount.textContent = `(${totalReviews} đánh giá)`;
    if (averageScore) averageScore.textContent = avgRating.toFixed(1);
    if (totalCount) totalCount.textContent = `(${totalReviews} đánh giá)`;
}

function renderReviews(reviews) {
    const reviewList = document.getElementById('review-list');
    if (!reviewList) return;

    if (!reviews || reviews.length === 0) {
        reviewList.innerHTML = '<p>Chưa có đánh giá nào cho sản phẩm này.</p>';
        return;
    }

    let html = '';
    reviews.forEach(review => {
        const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : '';
        html += `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-user">${review.user_name || 'Khách hàng'}</span>
                    <span class="review-rating">${generateStars(review.rating)}</span>
                </div>
                <div class="review-date">${reviewDate}</div>
                <div class="review-comment">${review.comment || ''}</div>
            </div>
        `;
    });

    reviewList.innerHTML = html;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return stars;
}

function setupReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const rating = document.querySelector('input[name="rating"]:checked');
        const comment = document.getElementById('comment').value.trim();
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!rating) {
            alert('Vui lòng chọn số sao để đánh giá.');
            return;
        }

        if (!comment) {
            alert('Vui lòng nhập bình luận của bạn.');
            return;
        }

        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        if (!token) {
            alert('Vui lòng đăng nhập để gửi đánh giá.');
            window.location.href = 'login.html';
            return;
        }

        try {
        console.log('Sending review to:', `${API_URL}/products/${productId}/review`);
        console.log('With token:', token.substring(0, 20) + '...');
        const response = await fetch(`${API_URL}/products/${productId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating: Number(rating.value), comment })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                alert('Cảm ơn bạn đã gửi đánh giá!');
                window.location.reload();
            } else if (response.status === 401 || response.status === 403) {
                alert('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            } else {
                if (result.message) {
                    alert(result.message);
                } else {
                    alert('Không thể gửi đánh giá.');
                }
            }
        } catch (error) {
            console.error('Lỗi gửi đánh giá:', error);
            alert('Có lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
        }
    });
}

// Hàm xử lý khi khách hàng bấm lưu Voucher
function saveVoucher(buttonElement) {
    // Đổi chữ thành Đã lưu
    buttonElement.innerText = "Đã lưu";
    
    // Thêm class 'saved' để đổi sang màu xanh lá
    buttonElement.classList.add("saved");
    
    // Khóa nút lại, không cho bấm 2 lần
    buttonElement.disabled = true;
    
    // Tùy chọn: Hiện thông báo nhỏ (bạn có thể bỏ dòng này nếu không thích)
    // alert("Bạn đã lưu thành công mã giảm giá!");
}

// Hàm khởi tạo nút wishlist
async function initializeWishlistButton(productId) {
    try {
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (!wishlistBtn) return;
        
        // Set product ID
        wishlistBtn.dataset.productId = productId;
        
        // Kiểm tra sản phẩm có trong wishlist không
        const wishlistItemId = await checkProductInWishlist(productId);
        
        if (wishlistItemId) {
            wishlistBtn.classList.add('in-wishlist');
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> <span class="wishlist-text">Đã thích</span>';
            wishlistBtn.dataset.wishlistItemId = wishlistItemId;
        }
        
        // Add click event handler
        wishlistBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const prodId = wishlistBtn.dataset.productId;
            const inWishlist = wishlistBtn.classList.contains('in-wishlist');
            
            if (inWishlist) {
                const itemId = wishlistBtn.dataset.wishlistItemId;
                if (itemId) {
                    await removeFromWishlist(itemId);
                    wishlistBtn.classList.remove('in-wishlist');
                    wishlistBtn.innerHTML = '<i class="far fa-heart"></i> <span class="wishlist-text">Yêu thích</span>';
                    delete wishlistBtn.dataset.wishlistItemId;
                }
            } else {
                await addToWishlist(prodId);
            }
        });
    } catch (error) {
        console.error('Lỗi khởi tạo nút wishlist:', error);
    }
}

// Hàm xử lý chọn phiên bản/màu sắc
function setupVariantButtons() {
    const variantBtns = document.querySelectorAll('.variant-btn');
    variantBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Xóa class 'active' khỏi tất cả các nút
            variantBtns.forEach(b => b.classList.remove('active'));
            
            // Thêm class 'active' vào nút vừa click
            this.classList.add('active');
            
            // Cập nhật lại biến màu sắc đang chọn
            selectedVariant = this.innerText;
        });
    });
}


function changeQuantity(amount) {
    const qtyInput = document.getElementById('buy-qty');
    let currentQty = parseInt(qtyInput.value);
    
    // Nếu nhập bậy bạ không phải số, set về 1
    if (isNaN(currentQty)) currentQty = 1;
    
    let newQty = currentQty + amount;
    
    // Đảm bảo số lượng mua tối thiểu luôn là 1
    if (newQty >= 1) {
        qtyInput.value = newQty;
    }
}

// Xử lý Thêm vào giỏ hàng
function addToCartFromDetail() {
    if (!currentProduct) {
        alert("Dữ liệu sản phẩm chưa tải xong, vui lòng đợi chút nhé!");
        return;
    }

    const quantity = parseInt(document.getElementById('buy-qty').value) || 1;
    
    // 1. Lấy giỏ hàng cũ từ localStorage (nếu chưa có thì tạo mảng rỗng)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 2. Tạo object lưu thông tin món hàng khách vừa chọn
    // Lấy ảnh đầu tiên để làm ảnh đại diện trong giỏ hàng
    let firstImage = "https://placehold.co/100x100";
    if (currentProduct.image) {
        let cleanImg = currentProduct.image.split(',')[0].trim().replace(/[\[\]"']/g, "");
        firstImage = cleanImg.startsWith('http') ? cleanImg : `../assets/img/products/${cleanImg}`;
    }

    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: firstImage,
        variant: selectedVariant, // Màu sắc đã chọn
        quantity: quantity
    };

    // 3. Kiểm tra: Nếu sản phẩm VÀ màu sắc này đã có trong giỏ -> Chỉ cộng dồn số lượng
    const existingItemIndex = cart.findIndex(item => item.id === cartItem.id && item.variant === cartItem.variant);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Nếu chưa có thì thêm mới vào mảng
        cart.push(cartItem);
    }

    // 4. Lưu ngược lại vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert(`Đã thêm ${quantity} sản phẩm (${selectedVariant}) vào giỏ hàng thành công!`);
    
    // Tùy chọn: Nếu bạn có icon giỏ hàng trên header, gọi hàm cập nhật số lượng ở đây
    // updateCartIconCount();
}

// Xử lý Mua ngay (Thêm vào giỏ rồi chuyển trang luôn)
function buyNow() {
    // Gọi hàm thêm vào giỏ hàng trước
    addToCartFromDetail();
    
    // Chuyển hướng trình duyệt sang trang giỏ hàng (cart.html)
    window.location.href = "cart.html"; 
}