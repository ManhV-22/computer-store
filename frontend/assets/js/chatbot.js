function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) chatWindow.classList.toggle('hidden');
}

/**
 * Hàm xử lý tin nhắn Chat
 */
// Dán API Key của bạn vào đây
const GEMINI_API_KEY = "AIzaSyAJOVlMeGMMCX1oVEM-iJeAbW5BwK21ylk"; 

// Tạo một "nhân cách" cho AI để nó không trả lời lan man
const SYSTEM_INSTRUCTION = `
Bạn là một nhân viên tư vấn bán hàng nhiệt tình, chuyên nghiệp của cửa hàng máy tính "ComputerStore".
Quy tắc trả lời:
1. Luôn xưng hô là "mình" hoặc "em" và gọi khách là "bạn" hoặc "anh/chị".
2. Trả lời ngắn gọn, súc tích (dưới 4 câu), tập trung vào việc tư vấn mua bán máy tính, laptop, linh kiện PC.
3. CHỈ DỰA VÀO DANH SÁCH SẢN PHẨM TRONG DATABASE để tư vấn. Nếu khách hỏi sản phẩm không có trong danh sách, hãy báo hết hàng và gợi ý sản phẩm khác.
4. Lấy đúng mức giá từ Database, tuyệt đối không tự bịa giá.
5. Nếu khách hỏi ngoài lề (nấu ăn, lịch sử...), hãy từ chối khéo léo và lái câu chuyện về đồ công nghệ.
`;

window.handleChat = async function(textInput = null) {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-messages');
    if (!input || !box) return;

    const text = textInput ? textInput : input.value.trim();
    if (!text) return;

    // 1. In tin nhắn của khách lên màn hình
    box.innerHTML += `<div class="message user">${text}</div>`;
    input.value = '';
    box.scrollTop = box.scrollHeight;

    // 2. Hiện hiệu ứng Loading
    const loadingId = "loading-" + Date.now();
    box.innerHTML += `<div id="${loadingId}" class="message bot">Đang kiểm tra kho... ⏳</div>`;
    box.scrollTop = box.scrollHeight;

    try {
        // ==========================================
        // BƯỚC 1: LẤY DỮ LIỆU TỪ DATABASE (XAMPP)
        // ==========================================
        const dbResponse = await fetch('http://127.0.0.1/get_products.php'); 
        const dbData = await dbResponse.json();
        
        let danhSachSP = "";
        if (dbData.error) {
            console.error("Lỗi từ PHP:", dbData.error);
            danhSachSP = "Hiện không thể lấy dữ liệu kho.";
        } else {
            // Biến mảng Data thành 1 đoạn text để AI đọc
            danhSachSP = dbData.map(sp => `- ${sp.ten} | Giá: ${sp.gia} | Tình trạng: ${sp.tinh_trang}`).join('\n');
        }

        // ==========================================
        // BƯỚC 2: GỬI CHO GEMINI
        // ==========================================
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        // Gộp tất cả (Lệnh + Kho hàng + Câu hỏi) vào một nội dung duy nhất
        const finalPrompt = `
        ${SYSTEM_INSTRUCTION}
        
        KHO HÀNG HIỆN CÓ TỪ DATABASE:
        ${danhSachSP}
        
        KHÁCH HÀNG HỎI:
        ${text}
        `;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }] 
            })
        });

        const data = await response.json();

        // 3. Xóa hiệu ứng Loading
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        // 4. In câu trả lời của AI ra màn hình
        if (data.candidates && data.candidates[0].content) {
            let aiText = data.candidates[0].content.parts[0].text;
            // Thay thế markdown ** in đậm thành thẻ <strong> HTML
            aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            box.innerHTML += `<div class="message bot">${aiText}</div>`;
        } else {
            console.error("Chi tiết phản hồi lỗi từ Google:", data);
            box.innerHTML += `<div class="message bot">Dạ hệ thống AI đang quá tải chút xíu, bạn hỏi lại nhé! 😅</div>`;
        }

    } catch (error) {
        // Xóa loading nếu bị lỗi mạng/API
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();
        
        console.error("Lỗi:", error);
        box.innerHTML += `<div class="message bot">Lỗi kết nối máy chủ! 🛠️ Vui lòng bật XAMPP và kiểm tra file get_products.php.</div>`;
    }
    
    // Tự động cuộn xuống cuối cùng
    box.scrollTop = box.scrollHeight;
};