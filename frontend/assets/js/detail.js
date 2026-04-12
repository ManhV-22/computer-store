// URL của Backend (Bạn điều chỉnh cho đúng với project của bạn)
const API_URL = 'http://localhost:3000/api/products'; 
let currentProduct = null; // Biến lưu toàn bộ data của sản phẩm đang xem
let selectedVariant = "Đen tuyền (Mặc định)"; // Màu sắc mặc định ban đầu
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
    
    setupVariantButtons();
});

async function loadProductDetail() {
    // 1. Lấy ID từ URL (Ví dụ: detail.html?id=15)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert('Không tìm thấy mã sản phẩm!');
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. Gọi API lấy dữ liệu sản phẩm
        const response = await fetch(`${API_URL}/${productId}`);
        const product = await response.json();

        currentProduct = product;

        // Xử lý logic đường dẫn ảnh (Giống như đã fix ở trang chủ)
        let imgUrl = "https://placehold.co/600x600/eeeeee/999999?text=No+Image";
        if (product.image) {
            let cleanImg = product.image.split(',')[0].trim().replace(/[\[\]"']/g, "");
            if (cleanImg.startsWith('http')) {
                imgUrl = cleanImg;
            } else if (cleanImg !== "") {
                imgUrl = `../assets/img/products/${cleanImg}`;
            }
        }

        // 3. Đổ dữ liệu vào HTML
        document.getElementById('breadcrumb-name').innerText = product.name;
        document.getElementById('detail-name').innerText = product.name;
        document.getElementById('detail-price').innerText = Number(product.price).toLocaleString('vi-VN') + ' ₫';
        
        // Đặt ảnh chính và 1 ảnh thumbnail mẫu
        document.getElementById('main-img').src = imgUrl;
        document.getElementById('thumb-list').innerHTML = `<img src="${imgUrl}" onclick="document.getElementById('main-img').src='${imgUrl}'">`;

        // Nếu DB của bạn có trường description thì in ra, nếu null thì báo Đang cập nhật
        if(product.description && product.description !== 'null') {
            document.getElementById('detail-desc').innerHTML = product.description;
        }

        loadRelatedProducts(productId);
        loadSamePriceProducts(productId, product.price);
        
    } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
        document.getElementById('detail-name').innerText = "Lỗi khi tải dữ liệu sản phẩm.";
    }
}

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
        const response = await fetch(API_URL);
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
        const response = await fetch(API_URL);
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
        firstImage = cleanImg.startsWith('http') ? cleanImg : `../assets/img/${cleanImg}`;
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