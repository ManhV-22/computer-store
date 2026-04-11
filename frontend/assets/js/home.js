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

            const icons = ['fa-laptop', 'fa-mobile-alt', 'fa-headphones', 'fa-desktop', 'fa-keyboard', 'fa-mouse', 'fa-tablet-alt'];
            
            if (uniqueCategories.length > 0) {
                categoryGrid.style.display = "grid";
                categoryGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 1fr))";
                categoryGrid.style.gap = "20px";

                categoryGrid.innerHTML = uniqueCategories.map((c, idx) => `
                    <div onclick="filterByCategory('${c.id}', '${c.name}')" class="category-item-card">
                        <i class="fas ${icons[idx % icons.length]}"></i>
                        <h4>${c.name}</h4>
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
// HÀM TẠO GIAO DIỆN SẢN PHẨM (ĐÃ FIX LỖI NÚT BẤM)
// ==========================================
function generateProductCard(prod) {
    const firstImage = prod.image ? prod.image.split(',')[0].trim() : "";
    
    // ĐÃ FIX: Thêm dấu nháy đơn vào '${prod.id}'
    return `
        <div class="product-card">
            <a href="detail.html?id=${prod.id}">
                <img src="${SERVER_URL}/assets/img/products/${firstImage}" alt="${prod.name}" onerror="this.src='../assets/img/default.jpg'">
            </a>
            <div class="product-info">
                <h4 class="product-title" title="${prod.name}">${prod.name}</h4>
                <div class="product-price">${Number(prod.price).toLocaleString('vi-VN')} ₫</div>
            </div>
            
            <div class="product-actions">
                <button onclick="addToCart('${prod.id}')" class="add-to-cart-btn" title="Thêm vào giỏ">
                    <i class="fas fa-cart-plus"></i>
                </button>
                <button onclick="buyNow('${prod.id}')" class="buy-now-btn">
                    Mua ngay
                </button>
            </div>
        </div>
    `;
}

function filterByCategory(categoryId, categoryName) {
    const filteredProducts = allProductsData.filter(p => p.category_id == categoryId);
    renderSpecificResults('category', `📂 Đang xem danh mục: ${categoryName}`, filteredProducts);
    
    const brandResult = document.getElementById('brand-filter-result');
    if(brandResult) brandResult.style.display = 'none';
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

document.addEventListener('DOMContentLoaded', initHomePage);