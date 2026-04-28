/**
 * FILE: chatbot.js - Phiên bản sửa lỗi CORS triệt để
 */

window.toggleChat = function() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.toggle('hidden');
        chatWindow.style.display = chatWindow.classList.contains('hidden') ? 'none' : 'flex';
    }
};
window.handleChat = async function() {
    const input = document.getElementById('chat-input');
    const userText = input.value.trim();
    if (!userText) return;

    // Hiện tin nhắn User màu đỏ
    appendMessage('user', userText);
    input.value = '';

    const loadingId = "loading-" + Date.now();
    appendMessage('bot', 'Minh đang gõ tin nhắn... 💬', loadingId);

    try {
        const response = await fetch('http://127.0.0.1/get_products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });

        const data = await response.json();
        document.getElementById(loadingId)?.remove();
        
        // Hiện tin nhắn AI Gemini trả về
        appendMessage('bot', data.reply);

    } catch (error) {
        document.getElementById(loadingId)?.remove();
        appendMessage('bot', "Lỗi kết nối XAMPP rồi đại ca ơi! Check lại Apache nhé. 🛠️");
    }
};

function appendMessage(sender, text, id = null) {
    const box = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    if (id) msgDiv.id = id;
    const isUser = sender === 'user';
    
    msgDiv.style.cssText = `
        margin-bottom: 12px; padding: 10px 15px; border-radius: 15px; max-width: 85%;
        ${isUser ? 'align-self: flex-end; background: #e74c3c; color: white;' : 'align-self: flex-start; background: #f1f1f1; color: #333; border: 1px solid #ddd;'}
    `;
    msgDiv.innerText = text;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
}