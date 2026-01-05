document.addEventListener("DOMContentLoaded", async function () {
    const API_URL = "assets/data/eventdetail.json"; // API lấy dữ liệu sự kiện

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu từ API");

        const eventData = await response.json();

        // Cập nhật thông tin sự kiện
        document.querySelector("#eventName").textContent = eventData.name;
        document.querySelector("#eventDescription").textContent = eventData.description;

        // Cập nhật hình ảnh trong carousel
        const carouselInner = document.querySelector("#carouselImages");
        carouselInner.innerHTML = "";
        eventData.images.forEach((image, index) => {
            const div = document.createElement("div");
            div.classList.add("carousel-item");
            if (index === 0) div.classList.add("active");
            div.innerHTML = `<img src="${image}" class="d-block w-100" alt="Sự kiện">`;
            carouselInner.appendChild(div);
        });
        // Cập nhật lịch trình
        const timelineList = document.querySelector("#eventTimeline");
        timelineList.innerHTML = "";
        eventData.timeline.forEach(item => {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.innerHTML = `<strong>${item.time}:</strong> ${item.activity}`;
            timelineList.appendChild(li);
        });

        // Cập nhật danh sách thiết bị
        const equipmentTable = document.querySelector("#equipmentList");
        equipmentTable.innerHTML = "";
        eventData.device.forEach(device => {
            const row = `<tr>
                <td><img src="${device.image}" alt="${device.name}" class="img-fluid" width="80"></td>
                <td><strong>${device.name}</strong></td>
                <td>${device.description}</td>
                <td>${device.supplier}</td>
                <td><input type="number" class="form-control quantity" value="1" min="0" data-price="${device.price}"></td>
                <td class="price">${device.price.toLocaleString()} VND</td>
                <td class="total-price">${device.price.toLocaleString()} VND</td>
            </tr>`;
            equipmentTable.insertAdjacentHTML("beforeend", row);
        });
        // Cập nhật danh sách nhân sự
        const staffTable = document.querySelector("#staffList");
        staffTable.innerHTML = "";
        eventData.service.forEach(service => {
            const row = `<tr>
                <td><img src="${service.image}" alt="${service.name}" class="img-fluid" width="80"></td>
                <td><strong>${service.name}</strong></td>
                <td>${service.description}</td>
                <td>${service.supplier}</td>
                <td><input type="number" class="form-control quantity" value="1" min="0" data-price="${service.price}"></td>
                <td class="price">${service.price.toLocaleString()} VND</td>
                <td class="total-price">${service.price.toLocaleString()} VND</td>
            </tr>`;
            staffTable.insertAdjacentHTML("beforeend", row);
        });
        // Cập nhật danh sách địa điểm
        const locationTable = document.querySelector("#locationList");
        locationTable.innerHTML = "";
        eventData.location.forEach(location => {
            // Kiểm tra dữ liệu ngày
            const startDate = location.start_date ? new Date(location.start_date) : null;
            const endDate = location.end_date ? new Date(location.end_date) : null;

            // Chuyển đổi định dạng ngày sang dd/mm/yyyy
            const formattedStartDate = startDate ? startDate.toLocaleDateString("vi-VN") : "Chưa có";
            const formattedEndDate = endDate ? endDate.toLocaleDateString("vi-VN") : "Chưa có";

            // Tính số ngày thuê (đảm bảo không bị NaN)
            let totalDays = 1; // Mặc định là 1 ngày nếu không có đủ thông tin
            if (startDate && endDate && endDate >= startDate) {
                totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            }

            // Tính tổng giá thuê địa điểm
            const totalPrice = totalDays * location.price_per_day;

            const row = `<tr>
                <td><img src="${location.image}" alt="${location.name}" class="img-fluid" width="80"></td>
                <td><strong>${location.name}</strong></td>
                <td>${location.supplier}</td>
                <td>${formattedStartDate}</td>
                <td>${formattedEndDate}</td>
                <td>${totalDays} ngày</td>
                <td>${location.price_per_day.toLocaleString()} VND</td>
                <td class="total-location-price">${totalPrice.toLocaleString()} VND</td>
            </tr>`;
            locationTable.insertAdjacentHTML("beforeend", row);
        });
        // Gọi lại updateTotal sau khi thêm dữ liệu
        setupQuantityEventListeners();
        updateTotal(); // Tính tổng tiền ngay sau khi load dữ liệu

    } catch (error) {
        console.error("Lỗi tải dữ liệu sự kiện:", error);
    }
});

// Hàm cập nhật tổng tiền & thành tiền từng dòng
function updateTotal() {
    let total = 0;

    // Cập nhật tổng tiền của thiết bị & nhân sự
    document.querySelectorAll(".quantity").forEach(input => {
        const price = parseInt(input.getAttribute("data-price"));
        const quantity = parseInt(input.value) || 0; // Tránh NaN nếu input rỗng
        const row = input.closest("tr");
        const totalCell = row.querySelector(".total-price");

        // Cập nhật thành tiền của mỗi dòng
        const rowTotal = price * quantity;
        totalCell.textContent = new Intl.NumberFormat('vi-VN').format(rowTotal) + " VND";

        // Cộng vào tổng tiền
        total += rowTotal;
    });
    // Cập nhật tổng tiền của địa điểm
    document.querySelectorAll(".total-location-price").forEach(cell => {
        const locationTotal = parseInt(cell.textContent.replace(/\D/g, "")) || 0;
        total += locationTotal;
    });

    // Hiển thị tổng tiền cuối cùng
    document.getElementById("totalPrice").textContent = new Intl.NumberFormat('vi-VN').format(total);
}

// Gán lại sự kiện sau khi DOM thay đổi
function setupQuantityEventListeners() {
    document.querySelectorAll(".quantity").forEach(input => {
        input.addEventListener("input", updateTotal);
    });
}


// data cho events khi nhấn vào sự kiện napf thì hiển thị chi tiết của sự kiện đso
// {
//     "eventTypes": [
//         { "id": 1, "name": "Hội nghị doanh nghiệp" },
//         { "id": 2, "name": "Tiệc cưới" },
//         { "id": 3, "name": "Sự kiện âm nhạc" },
//         { "id": 4, "name": "Triển lãm & Hội chợ" }
//     ],
//     "events": [
//         {
//             "id": 101,
//             "name": "Hội nghị doanh nghiệp",
//             "image": "assets/img/events/sk2.jpg",
//             "guests": 200,
//             "location": "Khách sạn InterContinental",
//             "type": 1
//         },
//         {
//             "id": 102,
//             "name": "Lễ cưới Hoàng Gia",
//             "image": "assets/img/events/sk1.jpg",
//             "guests": 500,
//             "location": "Nhà hàng Diamond",
//             "type": 2
//         },
//         {
//             "id": 103,
//             "name": "Rock Festival 2025",
//             "image": "assets/img/events/sk3.jpg",
//             "guests": 1000,
//             "location": "Sân vận động Mỹ Đình",
//             "type": 3
//         },
//         {
//             "id": 104,
//             "name": "Hội chợ Triển lãm Sáng tạo",
//             "image": "assets/img/events/sk4.jpg",
//             "guests": 300,
//             "location": "Trung tâm triển lãm SECC",
//             "type": 4
//         }
//     ],
//     "eventDetails": {
//         "id": 201,
//         "name": "Sự Kiện Đặc Biệt",
//         "description": "Sự kiện của chúng tôi mang đến trải nghiệm độc đáo với nhiều hoạt động hấp dẫn.",
//         "images": [
//             "assets/img/events/sk1.jpg",
//             "assets/img/events/sk2.jpg"
//         ],
//         "guests": 400,
//         "timeline": [
//             { "time": "08:00", "activity": "Đón khách" },
//             { "time": "09:00", "activity": "Khai mạc" },
//             { "time": "10:30", "activity": "Workshop và Giao lưu" },
//             { "time": "12:00", "activity": "Nghỉ trưa" },
//             { "time": "14:00", "activity": "Hoạt động nhóm" },
//             { "time": "16:00", "activity": "Tổng kết và kết thúc" }
//         ],
//         "devices": [
//             {
//                 "id": 301,
//                 "image": "assets/img/devices/projector.jpg",
//                 "name": "Máy Chiếu HD",
//                 "description": "Máy chiếu độ phân giải cao",
//                 "supplier": "Nguyễn Hồng Minh",
//                 "price": 500000
//             },
//             {
//                 "id": 302,
//                 "image": "assets/img/devices/speaker.jpg",
//                 "name": "Loa Âm Thanh",
//                 "description": "Hệ thống loa công suất lớn",
//                 "supplier": "Nguyễn Hồng Minh",
//                 "price": 750000
//             },
//             {
//                 "id": 303,
//                 "image": "assets/img/devices/light.jpg",
//                 "name": "Đèn Sân Khấu",
//                 "description": "Hệ thống đèn LED chuyên nghiệp",
//                 "supplier": "Nguyễn Hồng Minh",
//                 "price": 400000
//             }
//         ],
//         "services": [
//             {
//                 "id": 401,
//                 "image": "assets/img/services/organizer.jpg",
//                 "name": "Nhân viên tổ chức",
//                 "description": "Hỗ trợ sự kiện chuyên nghiệp",
//                 "supplier": "Nguyễn Hồng Minh",
//                 "price": 300000
//             },
//             {
//                 "id": 402,
//                 "image": "assets/img/services/mc.jpg",
//                 "name": "MC dẫn chương trình",
//                 "description": "MC chuyên nghiệp, hoạt náo",
//                 "supplier": "Nguyễn Hồng Minh",
//                 "price": 1200000
//             },
//             {
//                 "id": 403,
//                 "image": "assets/img/services/tech_support.jpg",
//                 "name": "Nhóm hỗ trợ kỹ thuật",
//                 "description": "Quản lý âm thanh, ánh sáng, máy chiếu",
//                 "supplier": "Nguyễn Hồng Minh",
//                 "price": 500000
//             }
//         ],
//         "locations": [
//             {
//                 "id": 501,
//                 "image": "assets/img/locations/conference_center.jpg",
//                 "name": "Trung tâm Hội nghị Quốc gia",
//                 "address": "57 Phạm Hùng, Nam Từ Liêm, Hà Nội",
//                 "supplier": "Nguyễn Hồng Minh",
//                 "capacity": 1000,
//                 "start_date": "2025-04-09",
//                 "end_date": "2025-04-12",
//                 "price_per_day": 5000000
//             }
//         ]
//     }
// }
