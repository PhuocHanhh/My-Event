const express = require('express');
const cors = require('cors');
const app = express();

// Bật CORS cho tất cả nguồn
// app.use(cors());
app.use(cors({
    origin: '', // Hoặc nguồn cụ thể của bạn
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

// Xử lý preflight request (OPTIONS)
app.options('', cors());
// Cho phép Express phân tích JSON từ body của yêu cầu
app.use(express.json());

// Mock data để lưu trữ cuộc trò chuyện (thay thế bằng database nếu cần)
let conversations = {};

// Route để tạo cuộc trò chuyện mới (POST /v1/chat/conversations)
app.post('/v1/chat/conversations', (req, res) => {
    console.log('Nhận yêu cầu POST:', req.body); // Log để debug
    const { id, title, flowId, createdAt, updatedAt } = req.body;
    if (!id || !title || !flowId) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    conversations[id] = { id, title, flowId, createdAt, updatedAt, messages: [] };
    res.status(201).json({ id }); // Trả về ID của cuộc trò chuyện
});

// Route để lấy thông tin cuộc trò chuyện (GET /v1/chat/conversations/:id)
app.get('/v1/chat/conversations/:id', (req, res) => {
    console.log('Nhận yêu cầu GET cho ID:', req.params.id); // Log để debug
    const conversationId = req.params.id;
    const conversation = conversations[conversationId];
    if (!conversation) {
        return res.status(404).json({ error: 'Cuộc trò chuyện không tồn tại' });
    }

    // Giả lập phản hồi từ AI (thay thế bằng logic thực tế)
    const mockMessages = [
        { role: 'user', content: 'Xin chào!' },
        { role: 'assistant', content: 'Xin chào! Rất vui được trò chuyện với bạn.' },
        { role: 'user', content: 'Bạn khỏe không?' },
        { role: 'assistant', content: 'Tôi là AI, tôi luôn "khỏe"! Bạn thì sao?' },
        { role: 'assistant', content: 'Hôm nay tôi có thể giúp gì cho bạn?' } // Dữ liệu giả để khớp với data[4]?.content
    ];

    res.status(200).json(mockMessages);
});

// Khởi động server
const PORT = 4200;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});