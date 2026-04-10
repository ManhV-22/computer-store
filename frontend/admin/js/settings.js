const SERVER_URL = "http://localhost:3000";
const API_URL = `${SERVER_URL}/api/settings`;
const token = localStorage.getItem('adminToken');
// if (!token) {
//     window.location.href = 'login.html';
// }
// 1. Hàm Upload Banner Phụ (Cho Sub 1 và Sub 2)
async function uploadSubBanner(key) {
    // Tìm input tương ứng dựa trên key (sub_banner_1 -> sub-banner-1-input)
    const inputId = `${key.replace(/_/g, '-')}-input`;
    const fileInput = document.getElementById(inputId);
    
    if (!fileInput || !fileInput.files[0]) {
        return alert("Vui lòng chọn ảnh trước khi lưu!");
    }

    const formData = new FormData();
    formData.append("banner", fileInput.files[0]);
    formData.append("key", key);

    try {
        const res = await fetch(`${API_URL}/upload-sub-banner`, {
            method: "POST",
            body: formData
        });
        const result = await res.json();
        if (result.success) {
            alert("Cập nhật banner thành công!");
            location.reload(); 
        } else {
            alert("Lỗi: " + result.error);
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Không thể kết nối đến Server!");
    }
}

// 2. Hàm cập nhật thời gian Flash Sale
async function updateFlashSale() {
    const timeInput = document.getElementById("flash-sale-input");
    if (!timeInput.value) return alert("Vui lòng chọn thời gian kết thúc!");

    try {
        const res = await fetch(`${API_URL}/update-flashsale`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endTime: timeInput.value })
        });
        const result = await res.json();
        if (result.success) {
            alert("Đã cập nhật thời gian Flash Sale!");
        } else {
            alert("Lỗi: " + result.error);
        }
    } catch (err) {
        console.error("Lỗi:", err);
    }
}

// 3. Tự động load dữ liệu cũ khi mở trang (Để biết đang có ảnh/giờ nào)
async function loadCurrentSettings() {
    try {
        const res = await fetch(`${API_URL}/home-configs`);
        const result = await res.json();
        if (result.success) {
            const data = result.data;
            // Điền thời gian cũ vào input nếu có
            if(data.flash_sale_end) {
                document.getElementById("flash-sale-input").value = data.flash_sale_end.substring(0, 16);
            }
        }
    } catch (err) {
        console.warn("Chưa có cấu hình cũ để hiển thị.");
    }
}
// Preview cho Banner Phụ 1
document.getElementById('sub-banner-1-input').addEventListener('change', function(e) {
    // Logic tạo URL preview và hiển thị vào một thẻ img (nếu bạn muốn thêm)
    console.log("Đã chọn ảnh cho Banner 1");
});
document.addEventListener("DOMContentLoaded", loadCurrentSettings);