AOS.init({
    duration: 800,
    once: true
});
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

const AI_API = 'http://localhost:4200/v1/chat/completions';
const AI_CONVERSATION = 'http://localhost:4200/v1/chat/conversations';

// Hiển thị tin nhắn
function addMessage(content, isBot = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
    messageDiv.innerHTML = `
        <span class="sender">${isBot ? 'MyEvent AI' : 'Bạn'}</span>
        ${content}
        <div class="timestamp">${new Date().toLocaleTimeString('vi-VN')}</div>
    `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function formatChat(text) {
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
        if (line.trim() === '') {
            return '';
        }
        if (line.startsWith('/client')) {
            return `<p><a href="${line} " style="font-weight: bold; text-decoration: underline; color: black;">Tạo hợp đồng tại đây</a></p>`;
        }
        const boldRegex = /\*\*(.*?)\*\*/g;
        const formattedLine = line.replace(boldRegex, '<strong>$1</strong>');
        return `<p>${formattedLine}</p>`;
    });
    return formattedLines.join('');
}
async function sendMessageToAPI(message) {
    const conversationId = localStorage.getItem('conversationId');
    if (!conversationId) {
        addMessage('Không tìm thấy cuộc hội thoại. Vui lòng tải lại trang.', true);
        return;
    }
    try {
        typingIndicator.classList.add('active');
        sendBtn.disabled = true;

        let response = await fetch(`${AI_CONVERSATION}/${conversationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer FLUJO',
                Accept: 'application/json',
            }
        });
        let SYSTEM_MESSAGE = await response.json();
        SYSTEM_MESSAGE = SYSTEM_MESSAGE.messages;
        console.log("Minh: ", SYSTEM_MESSAGE);

        const payload = {
            model: 'flow-NewFlow',
            messages: [
                ...SYSTEM_MESSAGE,
                {
                    role: 'user',
                    content: message,
                    processNodeId: SYSTEM_MESSAGE.at(-1)?.processNodeId,
                },
            ],
            stream: false,
            metadata: {
                flujo: 'true',
                conversationId: conversationId,
            },
        };

        const res = await fetch(AI_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer FLUJO',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        console.log('Assistant message:', reply);

        addMessage(formatChat(reply) || 'Không có phản hồi từ AI.', true);
    } catch (err) {
        console.error(err);
        addMessage('Lỗi khi gọi API. Vui lòng thử lại!', true);
    } finally {
        typingIndicator.classList.remove('active');
        sendBtn.disabled = false;
    }
}

async function createConversation() {
    if (!chatBox) return;
    try {
        typingIndicator.classList.add('active');
        sendBtn.disabled = true;
        const data = await fetch(`${AI_API}?model=flow-NewFlow2&message=Xin chào&temperature=0.0`);
        const response = await data.json();
        const message = response.choices?.[0]?.message?.content;
        const conversationID = response.conversation_id;
        console.log('conversation_id:', conversationID);
        localStorage.setItem('conversationId', conversationID);
        console.log('Assistant message:', message);
        console.log("ID", localStorage.getItem('conversationId'));
        addMessage(message || 'Bạn muốn lên kế hoạch cho sự kiện nào? Xin cho tôi biết sự kiện bạn muốn tổ chức?', true);

    } catch (err) {
        console.error(err);
        addMessage('Hiện tại đang mất kết nối. Xin quay lại sau!', true);
    } finally {
        typingIndicator.classList.remove('active');
        sendBtn.disabled = false;
    }
}
window.addEventListener('DOMContentLoaded', () => {
    createConversation();
});

sendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        sendBtn.disabled = true;
        chatInput.disabled = true;
        addMessage(message);
        sendMessageToAPI(message);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.disabled = false;
        chatInput.disabled = false;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

const micBtn = document.getElementById('mic-btn');
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.style.background = 'linear-gradient(to right, #d32f2f, #b71c1c)';
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        micBtn.style.background = 'linear-gradient(to right, #0288d1, #0277bd)';
        sendBtn.click();
    };

    recognition.onerror = () => {
        micBtn.style.background = 'linear-gradient(to right, #0288d1, #0277bd)';
        addMessage('Không thể nhận diện giọng nói. Vui lòng thử lại!', true);
    };
} else {
    micBtn.disabled = true;
    micBtn.style.background = '#d1d5db';
}