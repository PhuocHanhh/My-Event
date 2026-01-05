let suppliers = [];
const baseImageUrl = "http://localhost:8080/event-management/api/v1/FileUpload/files/";

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return (amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Hàm lấy tên nhà cung cấp
function getSupplierName(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? `${supplier.first_name} ${supplier.last_name}` : "Không xác định";
}

// Hàm gọi API chung
async function fetchData(url, errorMessage = "Lỗi khi lấy dữ liệu") {
    try {
        const response = await fetch(url);
        console.log(`Response from ${url}:`, response);

        if (!response.ok) {
            throw new Error(`${errorMessage}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Data from ${url}:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");
    console.log("Event ID:", eventId);

    if (!eventId) {
        document.getElementById("eventName").textContent = "Không tìm thấy sự kiện!";
        document.getElementById("eventDescription").textContent = "Vui lòng quay lại trang danh sách.";
        return;
    }

    try {
        rentalId = await fetchData(
            `http://localhost:8080/event-management/rentals/event/${eventId}`,
            "Lỗi khi lấy danh sách rental"
        )
            .then(rentals => {
                if (Array.isArray(rentals) && rentals.length > 0) {
                    rentalId = rentals[0].id; // Lấy rentalId từ rental đầu tiên
                    console.log("Rental ID:", rentalId);
                    return rentalId;
                } else {
                    throw new Error("Không tìm thấy rental cho sự kiện này.");
                }
            }) || [];

        //2. Lấy chi tiết sự kiện (tên, mô tả, hình ảnh)
        const event = await fetchData(
            `http://localhost:8080/event-management/event/${eventId}`
        );
        console.log("Event details:", event);
        if (!event) {
            document.getElementById("eventName").textContent = "Sự kiện không tồn tại!";
            document.getElementById("eventDescription").textContent = "Vui lòng kiểm tra lại.";
            return;
        }

        // Cập nhật tiêu đề, mô tả và hình ảnh
        document.getElementById("eventName").textContent = event.name || "Không có tiêu đề";
        document.getElementById("eventDescription").textContent = event.description || "Không có mô tả";

        const eventImage = document.getElementById("eventImage");
        const imageFileName = event.img ? event.img.split('/').pop() : null;
        const imageUrl = imageFileName ? `${baseImageUrl}${imageFileName}` : "assets/img/default-image.jpg";
        eventImage.src = imageUrl;
        eventImage.onerror = () => { eventImage.src = "assets/img/default-image.jpg"; };
        eventImage.style.display = "block";

        // 3. Lấy dữ liệu lịch trình
        var timeline = await fetchData(
            `http://localhost:8080/event-management/timelines/rental/${rentalId}`,
            "Lỗi khi lấy lịch trình"
        );
        timeline = timeline.data;
        console.log("Timeline data:", timeline);
        const timelineElement = document.getElementById("eventTimeline");
        timelineElement.innerHTML = "";
        if (!Array.isArray(timeline) || timeline.length === 0) {
            if (timeline && timeline.message) {
                timelineElement.innerHTML = `<li class="list-group-item text-danger">${timeline.message}</li>`;
            }
            else {
                timelineElement.innerHTML = `<li class="list-group-item">Không có thông tin lịch trình</li>`;
            }

        }
        else {
            timeline.forEach(item => {
                const content = typeof item === 'string' ? item : item.description || "Không xác định";
                const timeStart = item.time_start ? new Date(item.time_start) : null;
                const formattedTime = timeStart ? timeStart.toLocaleString('vi-VN', {
                    // dateStyle: 'short',
                    timeStyle: 'short'
                }) : "Không xác định";

                timelineElement.innerHTML += `
                        <li class="list-group-item border-0 p-3 mb-3 shadow-sm rounded d-flex align-items-start gap-3" style="background-color: #fdfdfd;">
                            <div class="mt-1" style="width: 10px; height: 10px; background-color: #87986A; border-radius: 50%; flex-shrink: 0;"></div>
                            <div class="flex-grow-1" style="display: flex;">
                                <div class="fw-bold mb-1" style="color:rgb(60, 71, 40);">${formattedTime} </div>
                                <div class="text-dark"> : ${content}</div>
                            </div>
                        </li>
                    `;
            });
        }

        // 4. Lấy danh sách thiết bị
        var devices = await fetchData(
            `http://localhost:8080/event-management/api/device-rentals/rental/${rentalId}`,
            "Lỗi khi lấy danh sách thiết bị"
        );

        devices = devices.result;
        console.log("Devices data:", devices);
        const equipmentList = document.getElementById("equipmentList");
        equipmentList.innerHTML = "";
        if (!Array.isArray(devices) || devices.length === 0) {
            if (devices && devices.message) {
                equipmentList.innerHTML = `<tr><td colspan='7' class='text-danger'>${devices.message}</td></tr>`;
            } else {
                equipmentList.innerHTML = "<tr><td colspan='7'>Không có thiết bị</td></tr>";
            }
        } else {
            devices.forEach(item => {
                const deviceImageUrl = item.image ? `${baseImageUrl}${item.image.split('/').pop()}` : "assets/img/default-device.jpg";
                // const totalPrice = (item.quantity || 0) * (item.pricePerDay || 0);
                equipmentList.innerHTML += `
                    <tr>
                        <td><img src="${deviceImageUrl}" onerror="this.src='assets/img/default-device.jpg'" alt="${item.deviceName || item.name} " style="max-width: 50px;"></td>
                        <td>${item.deviceName || item.name}</td>
                        <td>${item.deviceTypeName || "Không có mô tả"}</td>
                        <td>${item.supplierName}</td>
                        <td>${item.quantity || 0}</td>
                        <td>${formatCurrency(item.pricePerDay)}</td>
                        <td>${formatCurrency(item.totalPrice)}</td>
                    </tr>
                `;
            });
        }

        // 5. Lấy danh sách dịch vụ
        var services = await fetchData(
            `http://localhost:8080/event-management/api/service-rentals/rental/${rentalId}`,
            "Lỗi khi lấy danh sách dịch vụ"
        );

        services = services.result;
        console.log("Services data:", services);
        const serviceList = document.getElementById("serviceList");
        serviceList.innerHTML = "";
        if (!Array.isArray(services) || services.length === 0) {
            if (services && services.message) {
                serviceList.innerHTML = `<tr><td colspan='7' class='text-danger'>${services.message}</td></tr>`;
            } else {
                serviceList.innerHTML = "<tr><td colspan='7'>Không có dịch vụ</td></tr>";
            }
        } else {
            services.forEach(item => {
                const serviceImageUrl = item.image ? `${baseImageUrl}${item.image.split('/').pop()}` : "assets/img/default-service.jpg";
                const totalPrice = (item.quantity || 0) * (item.hourly_salary || 0);
                serviceList.innerHTML += `
                    <tr>
                        <td><img src="${serviceImageUrl}" onerror="this.src='assets/img/default-service.jpg'" alt="${item.serviceName}" style="max-width: 50px;"></td>
                        <td>${item.serviceName || "Không xác định"}</td>
                        <td>${item.supplierName}</td>
                        <td>${item.quantity || 0}</td>
                        <td>${formatCurrency(item.pricePerDay)}</td>
                        <td>${formatCurrency(item.totalPrice)}</td>
                    </tr>
                `;
            });
        }

        // 7. Kiểm tra nếu cần mở modal sau khi đăng nhập
        if (localStorage.getItem("openContractAfterLogin") === "true") {
            localStorage.removeItem("openContractAfterLogin");
            openContractModal();
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        document.getElementById("eventName").textContent = "Lỗi tải dữ liệu!";
        document.getElementById("eventDescription").textContent = "Vui lòng thử lại sau.";
        document.getElementById("eventImage").style.display = "none";
    }
});

function checkLoginAndOpenContract() {
    console.log("Nút Đăng ký ngay được nhấn!");
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("openContractAfterLogin", "true");
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get("id");
        localStorage.setItem("redirectAfterLogin", `event_detail.html?id=${eventId}`);
        window.location.href = "login.html";
    } else {
        openContractModal();
    }
}

// function openContractModal() {
//     console.log("Mở modal hợp đồng");
//     const urlParams = new URLSearchParams(window.location.search);
//     const eventId = urlParams.get("id");

//     const iframe = document.getElementById("contractIframe");
//     if (!iframe) {
//         console.error("Không tìm thấy iframe!");
//         return;
//     }
//     iframe.src = "contract.html";

//     const modalElement = document.getElementById("iframeModal");
//     if (!modalElement) {
//         console.error("Không tìm thấy modal!");
//         return;
//     }
//     const modal = new bootstrap.Modal(modalElement, {});
//     modal.show();

//     // Gửi dữ liệu sự kiện đến contract.html
//     iframe.onload = async () => {
//         try {
//             const event = await fetchData(
//                 `http://localhost:8080/event-management/event/${eventId}`,
//                 "Lỗi khi tải chi tiết sự kiện"
//             );
//             rentalId = await fetchData(
//                 `http://localhost:8080/event-management/rentals/event/${eventId}`,
//                 "Lỗi khi lấy danh sách rental"
//             )
//                 .then(rentals => {
//                     if (Array.isArray(rentals) && rentals.length > 0) {
//                         rentalId = rentals[0].id; // Lấy rentalId từ rental đầu tiên
//                         console.log("Rental ID:", rentalId);
//                         return rentalId;
//                     } else {
//                         throw new Error("Không tìm thấy rental cho sự kiện này.");
//                     }
//                 }) || [];
//             if (event) {
//                 iframe.contentWindow.postMessage({
//                     type: "preloadEvent",
//                     event: {
//                         id: eventId,
//                         name: event.name,
//                         description: event.description,
//                         img: event.img,
//                         device: await fetchData(
//                             `http://localhost:8080/event-management/api/device-rentals/rental/${rentalId}`,
//                             "Lỗi khi lấy thiết bị"
//                         ) || [],
//                         service: await fetchData(
//                             `http://localhost:8080/event-management/api/service-rentals/rental/${rentalId}`,
//                             "Lỗi khi lấy dịch vụ"
//                         ) || [],
//                         // locations: await fetchData(
//                         //     `http://localhost:8080/event-management/rentals/event/${eventId}/locations`,
//                         //     "Lỗi khi lấy địa điểm"
//                         // ) || [],
//                         timeline: await fetchData(
//                             `http://localhost:8080/event-management/timeline/rental/${rentalId}`,
//                             "Lỗi khi lấy timeline"
//                         ) || []
//                     }

//                 }, "*");
//             }
//         } catch (error) {
//             console.error("Lỗi khi gửi dữ liệu sự kiện đến iframe:", error);
//         }
//     };

//     window.addEventListener("message", function closeModal(event) {
//         if (event.data === "closeIframe") {
//             console.log("Nhận tín hiệu đóng modal");
//             modal.hide();
//             window.removeEventListener("message", closeModal);
//         }
//     }, { once: true });
// }
function openContractModal() {
    console.log("Mở modal hợp đồng");
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");

    const iframe = document.getElementById("contractIframe");
    if (!iframe) {
        console.error("Không tìm thấy iframe!");
        return;
    }
    iframe.src = "contract.html";

    const modalElement = document.getElementById("iframeModal");
    if (!modalElement) {
        console.error("Không tìm thấy modal!");
        return;
    }
    const modal = new bootstrap.Modal(modalElement, {});
    modal.show();

    // Gửi dữ liệu sự kiện đến contract.html
    iframe.onload = async () => {
        try {
            let event = await fetchData(
                `http://localhost:8080/event-management/event/${eventId}`,
                "Lỗi khi tải chi tiết sự kiện"
            );

            const rentals = await fetchData(
                `http://localhost:8080/event-management/rentals/event/${eventId}`,
                "Lỗi khi lấy danh sách rental"
            );
            console.log("Rentals:", rentals, "Event name:", event.name);
            let rentalId;
            if (Array.isArray(rentals) && rentals.length > 0) {
                rentalId = rentals[0].id;
                console.log("Rental ID:", rentalId);
            } else {
                throw new Error("Không tìm thấy rental cho sự kiện này.");
            }

            const devices = await fetchData(
                `http://localhost:8080/event-management/api/device-rentals/rental/${rentalId}`,
                "Lỗi khi lấy thiết bị"
            );
            const services = await fetchData(
                `http://localhost:8080/event-management/api/service-rentals/rental/${rentalId}`,
                "Lỗi khi lấy dịch vụ"
            );
            const timeline = await fetchData(
                `http://localhost:8080/event-management/timelines/rental/${rentalId}`,
                "Lỗi khi lấy timeline"
            );

            console.log("API Devices:", devices);
            console.log("API Services:", services);
            console.log("API Timeline:", timeline);

            if (event) {
                iframe.contentWindow.postMessage({
                    type: "preloadEvent",
                    event: {
                        id: event.id,
                        name: event.name,
                        description: event.description,
                        img: event.img,
                        device: devices.result || [], // Truy cập result
                        service: services.result || [], // Truy cập result
                        timeline: timeline.data || [] // Truy cập data
                    }
                }, "*");
            }
            // const newEventData = {
            //     name: event.name + " (Copy)",
            //     description: event.description,
            //     img: event.img,
            //     devices: devices.result || [],
            //     services: services.result || [],
            //     timeline: timeline.data || []
            // };

            // const createResponse = await fetch("http://localhost:8080/event-management/event/create-event", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify(rentalData)
            // });

            // console.log("Response from create event:", createResponse);
            // if (!createResponse.ok) {
            //     throw new Error("Tạo sự kiện mới thất bại.");
            // }
            // const createdEvent = await createResponse.json();
            // console.log("Sự kiện mới đã được tạo:", createdEvent);

            // Optional: gửi dữ liệu đến iframe để hiển thị nếu muốn
            iframe.contentWindow.postMessage({
                type: "preloadEvent",
                event: {
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    img: event.img,
                    device: devices.result || [], // Truy cập result
                    service: services.result || [], // Truy cập result
                    timeline: timeline.data || [] // Truy cập data
                }
            }, "*");
            console.log("Đã gửi dữ liệu đến iframe", event.id, event.name, devices, services, timeline);

        } catch (error) {
            console.error("Lỗi khi gửi dữ liệu sự kiện đến iframe:", error);
        }
    };

    window.addEventListener("message", function closeModal(event) {
        if (event.data === "closeIframe") {
            console.log("Nhận tín hiệu đóng modal");
            modal.hide();
            window.removeEventListener("message", closeModal);
        }
    }, { once: true });
}

async function createRental(rentalData) {
    try {
        const response = await fetch("http://localhost:8080/event-management/rentals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(rentalData)
        });
        if (!response.ok) {
            let errorMsg = "Lỗi không xác định";
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || JSON.stringify(errorData);
            } catch (e) { }
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (error) {
        alert("Lỗi khi tạo rental: " + error.message);
        throw error;
    }
}

// Ví dụ gọi hàm này khi người dùng nhấn nút đăng ký:
async function handleCreateRental() {
    const userId = localStorage.getItem("userId"); // hoặc lấy từ nơi bạn lưu user
    const urlParams = new URLSearchParams(window.location.search);
    const eventid = urlParams.get("id");

    // TODO: Lấy các giá trị này từ form hoặc dữ liệu thực tế của bạn
    const totalPrice = 1000000; // hoặc lấy từ input
    const rentalStartTime = new Date().toISOString(); // hoặc lấy từ input
    const rentalEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // hoặc lấy từ input
    const customLocation = "Địa điểm ABC"; // hoặc lấy từ input



    try {
        const rental = await createRental({
            userId,
            event: eventid,
            totalPrice,
            rentalStartTime,
            rentalEndTime,
            customLocation
        });
        alert("Tạo rental thành công! ID: " + rental.id);
        // Có thể reload trang hoặc cập nhật UI tại đây
    } catch (error) {
        // Đã alert ở trên, có thể xử lý thêm nếu muốn
    }
}

// Gắn hàm này vào nút đăng ký (ví dụ)
document.getElementById("registerButton")?.addEventListener("click", handleCreateRental);