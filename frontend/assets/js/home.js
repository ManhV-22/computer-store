const SERVER_URL = "http://localhost:3000";
let allProductsData = []; 

function getCategoryIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('laptop')) return 'fa-laptop';
    if (n.includes('màn hình')) return 'fa-desktop';
    if (n.includes('linh kiện')) return 'fa-microchip';
    if (n.includes('pc lắp ráp') || n.includes('máy tính')) return 'fa-computer';
    if (n.includes('phụ kiện')) return 'fa-keyboard';
    if (n.includes('chuột')) return 'fa-mouse';
    if (n.includes('điện thoại')) return 'fa-mobile-alt';
    if (n.includes('tai nghe')) return 'fa-headphones';
    return 'fa-box';
}

// --- HÀM BỔ SUNG: Chạy slider tự động ---
function startAutoSlider() {
    const slider = document.getElementById('main-banner-slider');
    const images = slider.querySelectorAll('img');
    if (images.length <= 1) return;

    let currentIndex = 0;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        const width = slider.offsetWidth;
        slider.scrollTo({
            left: currentIndex * width,
            behavior: 'smooth'
        });
    }, 4000); // 4 giây đổi ảnh 1 lần
}

async function initHomePage() {
    try {
        // 1. GỌI API CONFIG (Banner, Flash Sale)
        const configRes = await fetch(`${SERVER_URL}/api/settings/home-configs`).catch(() => null);
        if (configRes && configRes.ok) {
            const configResult = await configRes.json();
            if (configResult.success) {
                const configs = configResult.data;
                
                // Đổ Banner chính
                const bannerSlider = document.getElementById('main-banner-slider');

if (bannerSlider && configs.main_banners) {
    try {
        const mainBanners = typeof configs.main_banners === "string"
            ? JSON.parse(configs.main_banners)
            : configs.main_banners;

        bannerSlider.innerHTML = mainBanners.map(img => {
            const finalSrc = img.startsWith('http')
                ? img
                : `${SERVER_URL}/assets/img/banners/${img}`;

            return `<img src="${finalSrc}" 
                        style="width:100%; height:100%; object-fit:cover;" 
                        >`;
        }).join('');

        // gọi sau khi render xong
        setTimeout(startAutoSlider, 500);

    } catch (e) {
        console.error("Lỗi parse banner chính:", e);
    }
}

                // Đổ Banner phụ
                const sub1 = document.getElementById('sub-banner-1');
                if (sub1 && configs.sub_banner_1) {
                    sub1.src = `${SERVER_URL}/assets/img/banners/${configs.sub_banner_1.replace(/[\[\]" ]/g, "")}`;
                    sub1.style.display = "block"; 
                }

                const sub2 = document.getElementById('sub-banner-2');
                if (sub2 && configs.sub_banner_2) {
                    sub2.src = `${SERVER_URL}/assets/img/banners/${configs.sub_banner_2.replace(/[\[\]" ]/g, "")}`;
                    sub2.style.display = "block";
                }

                if (configs.flash_sale_end) startCountdown(configs.flash_sale_end);
            }
        }

        // 2. GỌI API SECTIONS (Các danh mục phía dưới)
        const sectionRes = await fetch(`${SERVER_URL}/api/settings/home-sections`).catch(() => null);
        if (sectionRes && sectionRes.ok) {
            const sectionResult = await sectionRes.json();
            if (sectionResult.success) {
                const container = document.getElementById('home-sections-container');
                if (container) {
                    container.innerHTML = sectionResult.data.map(section => `
                        <section class="container" style="margin-bottom: 50px;">
                            <h3 style="border-bottom: 3px solid #e74c3c; display: inline-block; padding-bottom: 8px; margin-bottom: 20px; color: #333;">
                                ${section.categoryName}
                            </h3>
                            <div class="product-grid">
                                ${section.products.map(prod => generateProductCard(prod)).join('')}
                            </div>
                        </section>
                    `).join('');
                }
            }
        }

        // 3. GỌI API PRODUCTS TỔNG
        const productRes = await fetch(`${SERVER_URL}/api/products`);
        const productResult = await productRes.json();
        allProductsData = productResult.data || productResult; 

        // --- Đổ sản phẩm vào Flash Sale ---
        const flashSaleContainer = document.getElementById('flash-sale-list');
        if (flashSaleContainer && allProductsData.length > 0) {
            const featuredProducts = allProductsData.filter(p => p.is_featured == 1).slice(0, 4);
            if (featuredProducts.length > 0) {
                flashSaleContainer.innerHTML = featuredProducts.map(prod => generateProductCard(prod)).join('');
            }
        }

       // 4. HIỂN THỊ DANH MỤC NỔI BẬT
        const categoryGrid = document.getElementById('dynamic-category-grid');
        if (categoryGrid && allProductsData.length > 0) {
            const uniqueCategories = [];
            const catIds = new Set();
            
            allProductsData.forEach(p => {
                if (p.category_id && !catIds.has(p.category_id)) {
                    catIds.add(p.category_id);
                    uniqueCategories.push({ id: p.category_id, name: p.category_name || `Danh mục ${p.category_id}` });
                }
            });

            const icons = ['fa-laptop', 'fa-desktop', 'fa-microchip', 'fa-screwdriver-wrench', 'fa-keyboard', 'fa-mouse', 'fa-headphones'];
            
            if (uniqueCategories.length > 0) {
                categoryGrid.innerHTML = uniqueCategories.slice(0, 5).map((c, idx) => `
                    <div onclick="filterByCategory('${c.id}', '${c.name}')" class="category-item-card category-item" style="cursor: pointer; text-align: center;">
                        <div class="category-icon-wrapper" style="margin: 0 auto 10px;">
                            <i class="fas ${icons[idx % icons.length]}" style="font-size: 2rem; color: var(--primary-color);"></i>
                        </div>
                        <h4 style="margin:0; font-size: 14px;">${c.name}</h4>
                    </div>
                `).join('');
            }
        }

        // 5. HIỂN THỊ THƯƠNG HIỆU NỔI BẬT
        const brandListContainer = document.getElementById('brand-list');
        if (brandListContainer) {
            let brands = [];
            try {
                const brandRes = await fetch(`${SERVER_URL}/api/brands`).catch(() => null); 
                if (brandRes && brandRes.ok) {
                    const brandResult = await brandRes.json();
                    brands = brandResult.data || brandResult;
                }
            } catch (error) { console.warn("Lỗi fetch API Thương hiệu:", error); }

            if (!Array.isArray(brands) || brands.length === 0) {
                brands = [];
                const brandIds = new Set();
                allProductsData.forEach(p => {
                    if (p.brand_id && !brandIds.has(p.brand_id)) {
                        brandIds.add(p.brand_id);
                        brands.push({ id: p.brand_id, name: p.brand_name || `Thương hiệu ${p.brand_id}` });
                    }
                });
            }

            if (brands.length > 0) {
                brandListContainer.style.display = "flex";
                brandListContainer.style.flexWrap = "wrap";
                brandListContainer.style.gap = "15px";

                brandListContainer.innerHTML = brands.map(b => `
                    <button onclick="filterByBrand('${b.id}', '${b.name}')" class="brand-btn">
                        ${b.name}
                    </button>
                `).join('');
            }
        }

    } catch (error) {
        console.error("Lỗi khởi tạo trang chủ:", error);
    }
}

// ==========================================
// HÀM TẠO GIAO DIỆN SẢN PHẨM (ĐÃ CHUẨN HOÁ 100% KÍCH THƯỚC)
// ==========================================
function generateProductCard(prod) {
    const firstImage = prod.image ? prod.image.split(',')[0].trim().replace(/[\[\]"']/g, "") : "default.jpg";
    const imgUrl = firstImage.startsWith('http') ? firstImage : `${SERVER_URL}/assets/img/products/${firstImage}`;
    
    return `
        <div class="product-card category-item" style="display: flex; flex-direction: column; height: 100%; border: 1px solid #eee; border-radius: 8px; padding: 15px; background: #fff; transition: box-shadow 0.3s; box-sizing: border-box;">
            
            <a href="detail.html?id=${prod.id}" style="text-decoration: none; color: inherit; flex-grow: 1; display: flex; flex-direction: column;">
                <img src="${imgUrl}" alt="${prod.name}" style="width: 100%; height: 180px; object-fit: contain; margin-bottom: 15px;" onerror="this.src='https://placehold.co/200x200?text=Lỗi+ảnh'">
                
                <h4 title="${prod.name}" style="font-size: 14px; margin: 0 0 10px; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${prod.name}</h4>
                
                <div style="color: #d70018; font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: auto;">${Number(prod.price).toLocaleString('vi-VN')} ₫</div>
            </a>
            
            <div class="product-actions" style="display: flex; gap: 8px; width: 100%;">
                <button onclick="addToCart('${prod.id}')" title="Thêm vào giỏ" style="height: 40px; width: 45px; flex-shrink: 0; display: flex; justify-content: center; align-items: center; background: #fff; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 5px; cursor: pointer; transition: 0.2s;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </button>
                
                <button onclick="buyNow('${prod.id}')" style="height: 40px; flex: 1; display: flex; justify-content: center; align-items: center; background: #e74c3c; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.2s;">
                    Mua ngay
                </button>
            </div>
            
        </div>
    `;
}

function filterByBrand(brandId, brandName) {
    const filteredProducts = allProductsData.filter(p => p.brand_id == brandId);
    renderSpecificResults('brand', `🔥 Đang xem thương hiệu: ${brandName}`, filteredProducts);
    
    const catResult = document.getElementById('category-filter-result');
    if(catResult) catResult.style.display = 'none';
}

function renderSpecificResults(type, title, products) {
    const resultContainer = document.getElementById(`${type}-filter-result`);
    const titleElement = document.getElementById(`${type}-result-title`);
    const listElement = document.getElementById(`${type}-filtered-list`);
    
    if(!resultContainer || !listElement || !titleElement) return;

    resultContainer.style.setProperty('display', 'block', 'important');
    titleElement.innerText = title;

    if(products.length === 0) {
        listElement.innerHTML = `<p style="text-align:center; width:100%; color:#7f8c8d; font-size: 1.1rem; padding: 20px; grid-column: 1 / -1;">Chưa có sản phẩm nào thuộc mục này.</p>`;
        return;
    }

    // ĐÃ CHUẨN HOÁ: Gọi chung hàm tạo thẻ
    listElement.innerHTML = products.map(p => generateProductCard(p)).join('');
}

function startCountdown(endTime) {
    const timerElement = document.getElementById('flash-sale-timer');
    if (!timerElement) return;
    const target = new Date(endTime).getTime();

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = target - now;
        if (distance < 0) {
            clearInterval(interval);
            timerElement.innerHTML = "HẾT GIỜ";
            return;
        }
        const h = Math.floor((distance % (86400000)) / 3600000);
        const m = Math.floor((distance % 3600000) / 60000);
        const s = Math.floor((distance % 60000) / 1000);
        timerElement.innerHTML = `${h.toString().padStart(2,'0')} : ${m.toString().padStart(2,'0')} : ${s.toString().padStart(2,'0')}`;
    }, 1000);
}

// ==========================================
// CHỨC NĂNG LỌC THEO DANH MỤC
// ==========================================
function filterByCategory(categoryId, categoryName) {
    if (!allProductsData || allProductsData.length === 0) return;

    const filteredProducts = allProductsData.filter(p => p.category_id == categoryId);
    const resultContainer = document.getElementById('category-filter-result');
    const resultTitle = document.getElementById('category-result-title');
    const resultList = document.getElementById('category-filtered-list');

    resultContainer.style.display = 'block';

    if (filteredProducts.length === 0) {
        resultTitle.innerHTML = `Sản phẩm thuộc danh mục: <strong style="color: #e74c3c;">${categoryName}</strong> (0)`;
        resultList.innerHTML = '<p style="text-align: center; width: 100%; color: #888;">Đang cập nhật sản phẩm cho danh mục này...</p>';
        return;
    }

    resultTitle.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <span>Sản phẩm thuộc danh mục: <strong style="color: #e74c3c;">${categoryName}</strong> (${filteredProducts.length})</span>
            <div>
                <a href="products.html?category_id=${categoryId}" style="color: #3498db; text-decoration: none; font-weight: bold; margin-right: 15px; font-size: 14px;">Xem tất cả ➔</a>
                <button onclick="document.getElementById('category-filter-result').style.display='none'" style="border:none; background:none; color:#e74c3c; cursor:pointer; font-weight:bold;">✖ Đóng</button>
            </div>
        </div>
    `;

    const topProducts = filteredProducts.slice(0, 10);

    // ĐÃ CHUẨN HOÁ: Gọi chung hàm tạo thẻ (Không phải viết HTML dài dòng nữa)
    resultList.innerHTML = topProducts.map(p => generateProductCard(p)).join('');

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==========================================
// CHỨC NĂNG LỌC THEO THƯƠNG HIỆU (GỌI API)
// ==========================================
async function showProductsByBrand(brandName, brandId) {
    try {
        const resultContainer = document.getElementById('brand-filter-result');
        const resultTitle = document.getElementById('brand-result-title');
        const resultList = document.getElementById('brand-filtered-list');
        
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        resultList.innerHTML = '<p style="text-align:center; width:100%;">Đang tải sản phẩm...</p>';

        const response = await fetch(`${SERVER_URL}/api/products?brand_id=${brandId}`);
        const products = await response.json();

        if (products.length === 0) {
            resultTitle.innerHTML = `Sản phẩm thuộc thương hiệu: <strong style="color: #f39c12;">${brandName}</strong> (0)`;
            resultList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Chưa có sản phẩm nào thuộc thương hiệu này.</p>';
            return;
        }

        resultTitle.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span>Sản phẩm thuộc thương hiệu: <strong style="color: #f39c12;">${brandName}</strong> (${products.length})</span>
                <div>
                    <a href="products.html?brand_id=${brandId}" style="color: #3498db; text-decoration: none; font-weight: bold; margin-right: 15px; font-size: 14px;">Xem tất cả ➔</a>
                    <button onclick="document.getElementById('brand-filter-result').style.display='none'" style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;">✖ Đóng</button>
                </div>
            </div>
        `;

        const topBrandProducts = products.slice(0, 10);

        // ĐÃ CHUẨN HOÁ: Gọi chung hàm tạo thẻ
        resultList.innerHTML = topBrandProducts.map(p => generateProductCard(p)).join('');

    } catch (error) {
        console.error("Lỗi khi tải sản phẩm theo thương hiệu:", error);
    }
}

// Xoá hàm renderFilteredProducts cũ vì nó đã dư thừa và được thay thế bằng generateProductCard

async function loadBrands() {
    try {
        const response = await fetch(`${SERVER_URL}/api/brands`);
        const brands = await response.json();
        const brandGrid = document.getElementById('dynamic-brand-grid');

        brandGrid.innerHTML = brands.map(brand => {
            // Kiểm tra nếu brand.image đã có sẵn đường dẫn assets/
            // Admin và Pages đều nằm trong thư mục con nên đều dùng ../
            const imageSource = (brand.image && brand.image !== 'undefined') 
                ? `../${brand.image}` 
                : '../assets/img/brands/default.jpg';

            return `
                <div class="brand-item-card" onclick="showProductsByBrand('${brand.name}', ${brand.id})">
                    <img src="${imageSource}" 
                         alt="${brand.name}" 
                         onerror="this.src='../assets/img/brands/default.jpg'">
                    <span>${brand.name}</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error("Lỗi tải thương hiệu:", error);
    }
}

function closeBrandFilter() {
    document.getElementById('brand-filter-result').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadBrands);
document.addEventListener('DOMContentLoaded', initHomePage);