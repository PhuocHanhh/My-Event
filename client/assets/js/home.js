
document.addEventListener("DOMContentLoaded", () => {
    const serviceList = document.getElementById("service-list");

    // Render trực tiếp các dịch vụ cố định
    serviceList.innerHTML = `
        <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="0">
            <div class="service-item position-relative">
                <div class="service-card">
                    <img src="../client/assets/img/services/dv1.jpg" alt="Sự kiện trọn gói" class="service-img">
                    <a href="service.html?category=event" class="stretched-link"></a>
                    <h3>TỔ CHỨC SỰ KIỆN TRỌN GÓI</h3>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
            <div class="service-item position-relative">
                <div class="service-card">
                    <img src="../client/assets/img/services/dv2.jpg" alt="Cho thuê thiết bị" class="service-img">
                    <a href="service.html?category=device" class="stretched-link"></a>
                    <h3>CHO THUÊ THIẾT BỊ</h3>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
            <div class="service-item position-relative">
                <div class="service-card">
                    <img src="../client/assets/img/services/dv3.jpg" alt="Cung cấp dịch vụ" class="service-img">
                    <a href="service.html?category=service" class="stretched-link"></a>
                    <h3>CUNG CẤP DỊCH VỤ</h3>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
            <div class="service-item position-relative">
                <div class="service-card">
                    <img src="../client/assets/img/services/dv4.jpeg" alt="Cho thuê địa điểm" class="service-img">
                    <a href="service.html?category=location" class="stretched-link"></a>
                    <h3>CHO THUÊ ĐỊA ĐIỂM</h3>
                </div>
            </div>
        </div>
    `;
});

// Lắng nghe sự kiện khi người dùng nhấn nút
document.getElementById('generateBtn').addEventListener('click', function () {
    // Lấy prompt từ input (có thể thay bằng form khác nếu cần)
    const prompt = document.getElementById('promptInput').value;

    // Gửi POST request đến backend (Spring Boot)
    fetch('http://localhost:8080/event-management/api/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt) // Gửi dữ liệu prompt
    })
        .then(response => response.json())  // Chờ backend trả về dữ liệu
        .then(data => {
            console.log(data); // Xử lý dữ liệu trả về (ví dụ: hiển thị kết quả lên UI)
            document.getElementById('result').innerText = data;  // Hiển thị kết quả từ AI
        })
        .catch(error => console.error('Error:', error)); // Xử lý lỗi nếu có
});
