<!-- WISHLIST INTEGRATION - COPY & PASTE CODE -->

<!-- ============================================
     1. ADD TO HEADER/NAVBAR
     ============================================ -->

<!-- Location: frontend/components/header.html OR anywhere in your header -->

<!-- Script: Add this in <head> or before </body> -->
<script src="../assets/js/wishlist.js"></script>

<!-- Link: Add this in your navigation menu -->
<li class="nav-item">
    <a class="nav-link" href="wishlist.html">
        <i class="fas fa-heart"></i> Wishlist
        <span class="badge bg-danger wishlist-count" style="display: none;"></span>
    </a>
</li>

<!-- OR if using icons only -->
<a href="wishlist.html" class="header-icon">
    <i class="fas fa-heart"></i>
    <span class="wishlist-count badge bg-danger" style="display: none;"></span>
</a>


<!-- ============================================
     2. ADD TO PRODUCT DETAIL PAGE
     ============================================ -->

<!-- Location: frontend/pages/product-detail.html -->

<!-- Step 1: Add script in <head> or before </body> -->
<script src="../assets/js/wishlist.js"></script>

<!-- Step 2: Add wishlist button next to Add to Cart button -->
<div class="product-actions">
    <!-- Existing Add to Cart button -->
    <button class="btn btn-primary btn-lg" id="add-to-cart-btn">
        <i class="fas fa-shopping-cart"></i> Add to Cart
    </button>
    
    <!-- NEW: Wishlist button -->
    <button class="btn btn-outline-danger btn-lg wishlist-btn" 
            id="wishlist-btn-PRODUCT_ID"
            data-action="wishlist" 
            data-product-id="PRODUCT_ID"
            style="transition: all 0.3s ease;">
        <i class="far fa-heart"></i> <span class="wishlist-text">Wishlist</span>
    </button>
</div>

<!-- Step 3: Add CSS to style.css -->
<style>
[data-action="wishlist"] {
    transition: all 0.3s ease;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
}

[data-action="wishlist"]:hover {
    transform: scale(1.05);
}

[data-action="wishlist"].in-wishlist {
    background-color: #e74c3c !important;
    color: white !important;
    border-color: #e74c3c !important;
}

[data-action="wishlist"].in-wishlist:hover {
    background-color: #c0392b !important;
    border-color: #c0392b !important;
}

.wishlist-count {
    margin-left: 5px;
    font-size: 12px;
}
</style>

<!-- Step 4: Add initialization script -->
<script>
document.addEventListener('DOMContentLoaded', async () => {
    // Get product ID from page (adjust according to your setup)
    const productId = getProductIdFromPage(); // You need to define this
    
    // OR if ID is in a data attribute
    // const productId = document.body.dataset.productId;
    
    // Check if product is in wishlist
    if (productId) {
        const inWishlist = await checkProductInWishlist(productId);
        if (inWishlist) {
            const btn = document.querySelector(`[data-product-id="${productId}"]`);
            if (btn) {
                btn.classList.add('in-wishlist');
                btn.querySelector('.wishlist-text').textContent = '❤️ Wishlist';
            }
        }
        
        // Also update all wishlist buttons
        updateWishlistButtons();
    }
});

function getProductIdFromPage() {
    // Method 1: From URL parameter
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
    
    // Method 2: From data attribute
    // return document.body.dataset.productId;
    
    // Method 3: From hidden input
    // return document.getElementById('productId').value;
}
</script>


<!-- ============================================
     3. ADD TO PRODUCT LIST PAGE
     ============================================ -->

<!-- Location: frontend/pages/products.html -->

<!-- Step 1: Add script -->
<script src="../assets/js/wishlist.js"></script>

<!-- Step 2: Add wishlist button to each product card -->
<div class="product-card">
    <div class="product-image">
        <img src="product.jpg" alt="Product Name">
        <!-- Add heart icon overlay -->
        <button class="wishlist-overlay-btn" 
                data-action="wishlist" 
                data-product-id="PRODUCT_ID"
                type="button">
            <i class="far fa-heart"></i>
        </button>
    </div>
    
    <div class="product-info">
        <h5>Product Name</h5>
        <p class="price">$99.99</p>
        <button class="btn btn-primary" onclick="addToCart(PRODUCT_ID)">
            Add to Cart
        </button>
    </div>
</div>

<!-- Step 3: Add CSS for overlay button -->
<style>
.product-image {
    position: relative;
    overflow: hidden;
}

.wishlist-overlay-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
}

.wishlist-overlay-btn:hover {
    background: white;
    transform: scale(1.1);
}

.wishlist-overlay-btn.in-wishlist {
    color: #e74c3c;
}

.wishlist-overlay-btn.in-wishlist i {
    font-weight: 900; /* Make heart solid */
}
</style>

<!-- Step 4: Initialize after loading products -->
<script>
async function loadProducts() {
    // ... Your existing product loading code ...
    
    // Load products...
    const products = await fetchProducts();
    displayProducts(products);
    
    // After displaying, update wishlist buttons
    await updateWishlistButtons();
}

async function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <button class="wishlist-overlay-btn" 
                        data-action="wishlist" 
                        data-product-id="${product.id}"
                        type="button">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h5>${product.name}</h5>
                <p class="price">$${product.price}</p>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
    
    // Update all buttons
    await updateWishlistButtons();
}
</script>


<!-- ============================================
     4. ADD TO SHOPPING CART PAGE
     ============================================ -->

<!-- Location: frontend/pages/cart.html -->

<!-- Optional: Show wishlist recommendations -->
<div class="wishlist-recommendations">
    <h3>Your Wishlist Items</h3>
    <a href="wishlist.html" class="btn btn-outline-primary">
        View Wishlist <span class="wishlist-count"></span>
    </a>
</div>

<!-- Or add a section showing wishlist items -->
<div class="cart-sidebar">
    <div class="wishlist-section">
        <h5>Saved for Later</h5>
        <div id="wishlist-sidebar"></div>
    </div>
</div>

<script>
async function loadWishlistSidebar() {
    const container = document.getElementById('wishlist-sidebar');
    if (!container) return;
    
    const items = await getWishlist();
    if (items.length === 0) {
        container.innerHTML = '<p>No saved items</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="wishlist-item-sidebar">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h6>${item.name}</h6>
                <p class="price">$${item.price}</p>
            </div>
            <button onclick="addToCartFromWishlist(${item.id})" 
                    class="btn btn-sm btn-primary">
                Add to Cart
            </button>
        </div>
    `).join('');
}

function addToCartFromWishlist(productId) {
    // Add to cart logic
    alert('Added ' + productId + ' to cart');
    // Then optionally remove from wishlist
}

// Load when page loads
document.addEventListener('DOMContentLoaded', loadWishlistSidebar);
</script>


<!-- ============================================
     5. EXAMPLE: COMPLETE PRODUCT DETAIL PAGE
     ============================================ -->

<!-- This is a complete working example -->

<!DOCTYPE html>
<html>
<head>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .product-actions {
            display: flex;
            gap: 15px;
            margin: 20px 0;
        }
        
        [data-action="wishlist"] {
            transition: all 0.3s ease;
        }
        
        [data-action="wishlist"].in-wishlist {
            background-color: #e74c3c !important;
            color: white !important;
            border-color: #e74c3c !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <img id="productImage" src="" alt="Product">
            </div>
            <div class="col-md-6">
                <h1 id="productName"></h1>
                <p class="price" id="productPrice"></p>
                <p id="productDescription"></p>
                
                <div class="product-actions">
                    <button class="btn btn-primary btn-lg" onclick="addToCart()">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn btn-outline-danger btn-lg" 
                            data-action="wishlist" 
                            id="wishlistBtn">
                        <i class="far fa-heart"></i> Wishlist
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="../assets/js/wishlist.js"></script>
    <script>
        let productId;
        
        async function loadProduct() {
            // Get product ID from URL
            const params = new URLSearchParams(window.location.search);
            productId = params.get('id');
            
            // Fetch product details
            const response = await fetch(`/api/products/${productId}`);
            const product = await response.json();
            
            // Display product
            document.getElementById('productName').textContent = product.name;
            document.getElementById('productPrice').textContent = '$' + product.price;
            document.getElementById('productDescription').textContent = product.description;
            document.getElementById('productImage').src = product.image;
            document.getElementById('wishlistBtn').dataset.productId = productId;
            
            // Check if in wishlist
            const inWishlist = await checkProductInWishlist(productId);
            if (inWishlist) {
                document.getElementById('wishlistBtn').classList.add('in-wishlist');
                document.getElementById('wishlistBtn').innerHTML = '<i class="fas fa-heart"></i> Wishlist';
            }
        }
        
        function addToCart() {
            alert('Added to cart: ' + productId);
        }
        
        // Load on page ready
        document.addEventListener('DOMContentLoaded', loadProduct);
    </script>
</body>
</html>


<!-- ============================================
     6. QUICK CSS SNIPPETS
     ============================================ -->

<!-- Add these to your style.css -->

<style>
/* Wishlist Button Styling */
[data-action="wishlist"] {
    transition: all 0.3s ease !important;
}

[data-action="wishlist"] i {
    transition: color 0.3s ease;
}

[data-action="wishlist"]:hover {
    transform: scale(1.05);
}

[data-action="wishlist"].in-wishlist {
    background-color: #e74c3c !important;
    color: white !important;
    border-color: #e74c3c !important;
}

[data-action="wishlist"].in-wishlist i {
    color: white !important;
}

/* Wishlist Badge Counter */
.wishlist-count {
    position: relative;
    background-color: #e74c3c;
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    margin-left: 5px;
}

/* Wishlist Page Styling */
.wishlist-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    gap: 15px;
    align-items: center;
}

.wishlist-item img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
}

.wishlist-info {
    flex: 1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .product-actions {
        flex-direction: column;
    }
    
    .product-actions button {
        width: 100%;
    }
    
    .wishlist-item {
        flex-wrap: wrap;
    }
}
</style>

---

✅ READY TO USE TEMPLATES ABOVE - Choose one based on your need!

Questions? Check the main documentation files!
