var EventAPI = 'http://localhost:8080/event-management/event';
var EventTypeAPI = 'http://localhost:8080/event-management/event-type';
var CreateEventAPI = 'http://localhost:8080/event-management/event/create-event';
var DeviceAPI = 'http://localhost:8080/event-management/devices/list';
var DeviceTypeAPI = 'http://localhost:8080/event-management/deviceType/list';
var ServiceAPI = 'http://localhost:8080/event-management/services/list';
var UserAPI_MRG = `http://localhost:8080/event-management/users/manager`;
var UsersAPI = 'http://localhost:8080/event-management/users';
var RentalAPI = 'http://localhost:8080/event-management/rentals';
var DeviceRental = 'http://localhost:8080/event-management/api/device-rentals';
var ServiceRental = 'http://localhost:8080/event-management/api/service-rentals';
var Timeline = 'http://localhost:8080/event-management/timelines';
let rentalId;
function start() {
    document.addEventListener("DOMContentLoaded", () => {
        getData((events, eventTypes, devices, deviceTypes, services, users) => {
            // Lưu dữ liệu vào biến toàn cục
            window.devices = devices;
            window.deviceTypes = deviceTypes;
            window.services = services;
            window.users = users;
            window.events = events;
            window.eventTypes = eventTypes;

            // Render events
            renderEvents(events, eventTypes, devices, deviceTypes, services, users);

            // Setup và populate
            setupDeviceTable(deviceTypes);
            setupServiceTable(services); // Thêm setup cho serviceTable

            if (document.querySelector('select[name="devicetype"]')) {
                populateDeviceTypes(deviceTypes);
            } else {
                console.warn("Không tìm thấy select[name='devicetype'] trong DOM khi gọi populateDeviceTypes");
            }

            if (document.querySelector('select[name="servicename"]')) {
                populateService(services); // Populate cho serviceTable
            } else {
                console.warn("Không tìm thấy select[name='servicename'] trong DOM khi gọi populateService");
            }

            if (document.querySelector("#selectEventTypes")) {
                populateEventTypes(eventTypes);
            }
        });
        setupTimelineTable();
        handleCreateForm();
        if (document.querySelector("#saveEventType")) {
            handleCreateEventType();
        }
        handleAddEventType(); // Thêm xử lý cho nút "+"

        var editEventId = localStorage.getItem("editEventId");
        if (editEventId && window.location.pathname.includes("detail_event.html")) {
            watchDetailEvent(editEventId);
        }

        // Gắn sự kiện tính tổng tiền cho dòng ban đầu của deviceTable
        document.querySelectorAll("#deviceTable tbody tr").forEach(row => {
            row.querySelector('input[name="pricedevice"]').addEventListener("input", () => updateTotalPrice(row));
            row.querySelector('input[name="quantitydevice"]').addEventListener("input", () => {
                const quantity = parseInt(row.querySelector('input[name="quantitydevice"]').value);
                const deviceId = row.querySelector('select[name="devicename"]').value;
                const availableQuantity = getAvailableQuantity(deviceId); // Lấy số lượng có sẵn

                if (quantity > availableQuantity) {
                    alert(`Không đủ số lượng thiết bị. Số lượng có sẵn: ${availableQuantity}`);
                    row.querySelector('input[name="quantitydevice"]').value = availableQuantity; // Đặt lại số lượng
                } else {
                    updateTotalPrice(row);
                }
            });
        });

        // Gắn sự kiện tính tổng tiền cho dòng ban đầu của serviceTable
        document.querySelectorAll("#serviceTable tbody tr").forEach(row => {
            row.querySelector('input[name="price"]').addEventListener("input", () => updateServiceTotal(row));
            row.querySelector('input[name="quantity"]').addEventListener("input", () => {
                const quantity = parseInt(row.querySelector('input[name="quantity"]').value);
                const serviceId = row.querySelector('select[name="servicename"]').value;
                const availableQuantity = getAvailableServiceQuantity(serviceId); // Lấy số lượng có sẵn

                if (quantity > availableQuantity) {
                    alert(`Không đủ số lượng dịch vụ. Số lượng có sẵn: ${availableQuantity}`);
                    row.querySelector('input[name="quantity"]').value = availableQuantity; // Đặt lại số lượng
                } else {
                    updateServiceTotal(row);
                }
            });
        });
    });
}
start();
function renderEvents(events, eventTypes) {
    const listEvenstBlock = document.querySelector('#list-event tbody');
    if (!listEvenstBlock) return;

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch('http://localhost:8080/event-management/roles', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        cache: 'no-store'
    })
        .then(response => response.ok ? response.json() : Promise.reject("Không thể tải roles"))
        .then(roles => {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            const roleName = user.roleName || "";

            if ($.fn.DataTable.isDataTable('#list-event')) {
                $('#list-event').DataTable().destroy();
            }

            const htmls = events.map(event => {
                const updateButton = roleName === "MANAGER"
                    ? `<button class="dropdown-item update-btn" data-id="${event.id}">Cập nhật</button>`
                    : "";

                return `
                    <tr class="list-event-${event.id}">
                        <td>${event.name}</td>
                        <td>${event.eventTypeName}</td>
                        <td style="width: 40%;">${event.description || "Không có mô tả"}</td>
                        <td>${event.created_at ? new Date(event.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
                        <td class="text-center">
                            <div class="action-dropdown">
                                <button class="btn btn-light action-btn">...</button>
                                <div class="dropdown-content">
                                    <button class="dropdown-item delete-btn" data-id="${event.id}">Xoá</button>
                                    ${updateButton}
                                    <button class="dropdown-item detail-btn" data-id="${event.id}">Xem chi tiết</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            listEvenstBlock.innerHTML = htmls.join('');

            $('#list-event').DataTable({
                order: [[3, "desc"]],
                language: {
                    search: "Tìm kiếm:",
                    lengthMenu: "Hiển thị _MENU_ sự kiện",
                    info: "Hiển thị _START_ đến _END_ của _TOTAL_ sự kiện",
                    infoEmpty: "Không có dữ liệu",
                    zeroRecords: "Không tìm thấy kết quả",
                    paginate: { first: "Đầu", last: "Cuối", next: "Tiếp", previous: "Trước" }
                }
            });

            $('#list-event tbody').on('click', '.action-btn', function (event) {
                const dropdown = $(this).next('.dropdown-content');
                $('.dropdown-content').not(dropdown).hide();
                dropdown.toggle();
                event.stopPropagation();
            });

            $('#list-event tbody').on('click', '.update-btn', function () {
                handleUpdateEvent($(this).data('id'));
            });

            $('#list-event tbody').on('click', '.delete-btn', function () {
                handleDeleteEvent($(this).data('id'));
            });

            $('#list-event tbody').on('click', '.detail-btn', function () {
                handleDetailEvent($(this).data('id'));
            });

            $(document).click(() => $('.dropdown-content').hide());
        })
        .catch(error => {
            console.error("Lỗi tải roles:", error);
            // Hiển thị bảng không có nút "Cập nhật"
            if ($.fn.DataTable.isDataTable('#list-event')) {
                $('#list-event').DataTable().destroy();
            }

            const htmls = events.map(event => {
                return `
                    <tr class="list-event-${event.id}">
                        <td>${event.name}</td>
                        <td>${event.eventTypeName}</td>
                        <td style="width: 40%;">${event.description || "Không có mô tả"}</td>
                        <td>${event.created_at}</td>
                        <td class="text-center">
                            <div class="action-dropdown">
                                <button class="btn btn-light action-btn">...</button>
                                <div class="dropdown-content">
                                    <button class="dropdown-item delete-btn" data-id="${event.id}">Xoá</button>
                                    <button class="dropdown-item detail-btn" data-id="${event.id}">Xem chi tiết</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            listEvenstBlock.innerHTML = htmls.join('');

            $('#list-event').DataTable({
                order: [[3, "desc"]],
                language: {
                    search: "Tìm kiếm:",
                    lengthMenu: "Hiển thị _MENU_ sự kiện",
                    info: "Hiển thị _START_ đến _END_ của _TOTAL_ sự kiện",
                    infoEmpty: "Không có dữ liệu",
                    zeroRecords: "Không tìm thấy kết quả",
                    paginate: { first: "Đầu", last: "Cuối", next: "Tiếp", previous: "Trước" }
                }
            });

            $('#list-event tbody').on('click', '.action-btn', function (event) {
                const dropdown = $(this).next('.dropdown-content');
                $('.dropdown-content').not(dropdown).hide();
                dropdown.toggle();
                event.stopPropagation();
            });

            $('#list-event tbody').on('click', '.delete-btn', function () {
                handleDeleteEvent($(this).data('id'));
            });

            $('#list-event tbody').on('click', '.detail-btn', function () {
                handleDetailEvent($(this).data('id'));
            });

            $(document).click(() => $('.dropdown-content').hide());
        });
}

function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    // Lấy roleName từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const roleName = user?.roleName?.toUpperCase() || "USER";

    // Chọn API dựa trên roleName
    const userApiToFetch = roleName === "MANAGER" ? UserAPI_MRG : UsersAPI;
    Promise.all([
        fetch(EventAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi EventAPI: ${res.status}`); return res.json(); }),

        fetch(EventTypeAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi EventTypeAPI: ${res.status}`); return res.json(); }),

        fetch(DeviceAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi DeviceAPI: ${res.status}`); return res.json(); }),

        fetch(DeviceTypeAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi DeviceTypeAPI: ${res.status}`); return res.json(); }),

        fetch(ServiceAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi ServiceAPI: ${res.status}`); return res.json(); }),

        fetch(userApiToFetch, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi UsersAPI: ${res.status}`); return res.json(); }),
    ])
        .then(([events, eventTypes, devices, deviceTypes, services, users]) => {

            // Chuẩn hóa dữ liệu
            events = Array.isArray(events) ? events : events.data?.items || [];
            eventTypes = Array.isArray(eventTypes) ? eventTypes : eventTypes.data?.items || [];
            devices = Array.isArray(devices) ? devices : devices.data?.items || [];
            deviceTypes = Array.isArray(deviceTypes) ? deviceTypes : deviceTypes.data?.items || [];
            services = Array.isArray(services) ? services : services.data?.items || [];
            users = Array.isArray(users) ? users : users.data || [];

            callback(events, eventTypes, devices, deviceTypes, services, users);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy dữ liệu: " + error.message);
        });
}
function handleCreateForm() {
    var createBtn = document.querySelector('#create');
    if (!createBtn) return;

    var editEventId = localStorage.getItem("editEventId");

    if (editEventId) {
        loadEditForm(editEventId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        var pictureInput = document.querySelector('input[name="picture"]');
        var name = document.querySelector('input[name="name"]').value;
        var description = document.querySelector('input[name="description"]').value;
        var eventTypeID = document.querySelector('select[name="eventype"]').value;
        var detail = document.querySelector('textarea[name="detail"]').value;

        if (!name || !eventTypeID) {
            alert("Vui lòng nhập đầy đủ tên sự kiện và loại sự kiện!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho sự kiện!");
            return;
        }

        // Tạo object chứa thông tin event
        const eventData = {
            name: name,
            description: description,
            eventType_id: eventTypeID,
            detail: detail,
            event_format: true,
            is_template: false
        };

        // Tạo FormData
        const formData = new FormData();

        // Thêm file với key là 'file'
        formData.append('file', pictureInput.files[0]);

        // Thêm event data dưới dạng JSON string với key là 'event'
        formData.append('event', new Blob([JSON.stringify(eventData)], {
            type: 'application/json'
        }));

        createEvent(formData, function (eventResponse) {
            var eventId = eventResponse.id;
            console.log("Event vừa tạo có ID:", eventId);
            createRentalWithEventId(eventId);
        });
    };
}

function createEvent(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");

    fetch(CreateEventAPI, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Sửa cú pháp string
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi server");
            return response.json();
        })
        .then(data => {
            callback(data.result || data); // Gọi callback mà không kiểm tra code
        })
        .catch(error => alert(`Lỗi tạo sự kiện: ${error.message}`));
}

function createEventType(data, callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    var options = {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    };
    fetch(EventTypeAPI, options)
        .then(function (response) {
            return response.json(); // Trả về dữ liệu JSON
        })
        .then(callback)
        .catch(error => console.error("Lỗi khi tạo event type:", error));
}
document.addEventListener("DOMContentLoaded", function () {
    handleCreateEventType();
});
function populateEventTypes(eventTypes) {
    var select = document.querySelector('#selectEventTypes');
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`; // Xóa tùy chọn cũ

    // Kiểm tra nếu eventTypes không phải mảng, ta chuyển thành mảng
    var eventList = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    eventList.forEach(type => {
        var option = document.createElement('option');
        option.value = type.id;  // Lưu ID
        option.textContent = type.name; // Hiển thị tên
        select.appendChild(option);
    });
}
function handleCreateEventType() {
    var createBtn = document.querySelector("#saveEventType");

    if (!createBtn) {
        console.warn(" Cảnh báo: #saveEventType không tồn tại trong DOM.");
        return;
    }

    createBtn.onclick = function () {
        var eventTypeName = document.querySelector("#newEventTypeInput").value;

        if (!eventTypeName.trim()) {
            alert("Vui lòng nhập loại sự kiện!");
            return;
        }

        var Data = {
            name: eventTypeName,
            created_at: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString().split("T")[0]
        };

        createEventType(Data, function (newEventType) {
            getData((events, eventTypes) => {
                populateEventTypes(eventTypes);
            });

            var modalElement = document.getElementById("eventTypeModal");
            if (modalElement) {
                var modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
            }
        });
    };
}

//Sự kiện thêm loại sự kiện qua pop up
function handleAddEventType() {
    document.addEventListener("DOMContentLoaded", function () {
        var modalElement = document.getElementById("eventTypeModal");
        var modal = new bootstrap.Modal(modalElement);

        document.querySelector("#addEventType").addEventListener("click", function () {
            modal.show();
        });

        document.querySelector("#saveEventType").addEventListener("click", function () {
            var newEventType = document.querySelector("#newEventTypeInput").value;
            if (newEventType) {
                var select = document.querySelector('select[name="eventype"]');
                var option = document.createElement("option");
                option.value = newEventType.toLowerCase().replace(/\s+/g, "-");
                option.textContent = newEventType;
                select.appendChild(option);
                select.value = option.value;

                modal.hide();
            }
        });

        // Khi modal đóng, đảm bảo xóa backdrop và reset trạng thái
        modalElement.addEventListener("hidden.bs.modal", function () {
            document.getElementById("newEventTypeInput").value = ""; // Reset input
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove()); // Xóa backdrop thừa
            document.body.classList.remove("modal-open"); // Loại bỏ class khóa cuộn trang
            document.body.style.overflow = ""; // Khôi phục cuộn trang
        });
    });
}
document.getElementById("inputImage").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("image").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
//UPDATE
//Cập nhật event
function handleUpdateEvent(eventId) {
    localStorage.setItem("editEventId", eventId); // Lưu ID vào localStorage
    window.location.href = "form-event.html"; // Chuyển đến form cập nhật
}

// function loadEditForm(editEventId) {
//     if (!editEventId) return;
//     console.log("Chỉnh sửa sự kiện ID:", editEventId);
//     const inputPicture = document.querySelector('input[name="picture"]');
//     const imagePreview = document.getElementById("image");
//     const defaultImagePath = "assets/img/card.jpg";
//     let rentalId = null;
//     // Lấy token từ localStorage
//     let token = localStorage.getItem("token");
//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }
//     // Lấy danh sách loại sự kiện (event types)
//     fetch(EventTypeAPI, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         }
//     })
//         .then(response => {
//             if (!response.ok) throw new Error("Lỗi khi lấy loại sự kiện");
//             return response.json();
//         })
//         .then(eventTypes => {
//             console.log('Event Types:', eventTypes);
//             var selectEventType = document.querySelector('select[name="eventype"]');
//             selectEventType.innerHTML = '<option value="">Chọn loại sự kiện</option>';
//             if (Array.isArray(eventTypes)) {
//                 eventTypes.forEach(type => {
//                     var option = document.createElement("option");
//                     option.value = type.name; // Sử dụng type.name như hàm thứ hai
//                     option.textContent = type.name;
//                     selectEventType.appendChild(option);
//                 });
//             }
//             // Lấy thông tin sự kiện
//             return fetch(`${EventAPI}/${editEventId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             }).then(res => {
//                 if (!res.ok) throw new Error("Lỗi khi lấy thông tin sự kiện");
//                 return res.json();
//             });
//         })
//         .then(event => {
//             console.log('Event Data minh minh:', event);
//             // Hiển thị thông tin sự kiện
//             document.querySelector('input[name="name"]').value = event.name || "";
//             document.querySelector('input[name="description"]').value = event.description || "";
//             document.querySelector('textarea[name="detail"]').value = event.detail || "";
//             document.querySelector('select[name="eventype"]').value = event.eventTypeName;
//             // Xử lý hiển thị ảnh
//             if (event.img) {
//                 try {
//                     const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
//                     const fileName = event.img.split('/').pop();
//                     const imageUrl = `${baseApiUrl}${fileName}`;
//                     console.log('Image URL:', imageUrl);
//                     const newImg = document.createElement('img');
//                     newImg.id = 'image';
//                     newImg.style.maxWidth = '500px';
//                     newImg.style.height = '400px';
//                     newImg.alt = 'Event Preview';
//                     if (imagePreview) {
//                         imagePreview.parentNode.replaceChild(newImg, imagePreview);
//                     }
//                     newImg.src = imageUrl;
//                     newImg.onerror = function () {
//                         console.error('Lỗi tải ảnh:', imageUrl);
//                         this.src = defaultImagePath;
//                     };
//                 } catch (error) {
//                     console.error('Lỗi xử lý ảnh:', error);
//                     if (imagePreview) imagePreview.src = defaultImagePath;
//                 }
//             } else {
//                 if (imagePreview) imagePreview.src = defaultImagePath;
//             }
//             // Xử lý preview ảnh khi chọn file mới
//             inputPicture.addEventListener("change", function (event) {
//                 const file = event.target.files[0];
//                 if (file) {
//                     const reader = new FileReader();
//                     reader.onload = function (e) {
//                         imagePreview.src = e.target.result;
//                     };
//                     reader.readAsDataURL(file);
//                 }
//             });
//             // Lấy dữ liệu rental theo eventId
//             return fetch(`${RentalAPI}/event/${editEventId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             }).then(res => {
//                 if (!res.ok) throw new Error("Lỗi khi lấy danh sách thuê");
//                 return res.json();
//             });
//         })
//         .then(rentals => {
//             if (rentals && rentals.length > 0) {
//                 rentalId = rentals[0].id;
//                 console.log("Rental ID:", rentalId);
//             } else {
//                 console.warn("Không tìm thấy rental cho event_id:", editEventId);
//                 rentalId = null;
//             }
//             // Lấy dữ liệu device rentals, service rentals, timelines
//             return Promise.all([
//                 Promise.resolve(rentals),
//                 rentalId ? fetch(`${DeviceRental}/rental/${rentalId}`, {
//                     method: 'GET',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }).then(res => {
//                     if (!res.ok) throw new Error("Lỗi khi lấy thuê thiết bị");
//                     return res.json();
//                 }) : Promise.resolve([]),
//                 rentalId ? fetch(`${ServiceRental}/rental/${rentalId}`, {
//                     method: 'GET',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }).then(res => {
//                     if (!res.ok) throw new Error("Lỗi khi lấy thuê dịch vụ");
//                     return res.json();
//                 }) : Promise.resolve([]),
//                 rentalId ? fetch(`${Timeline}/rental/${rentalId}`, {
//                     method: 'GET',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }).then(res => {
//                     if (!res.ok) throw new Error("Lỗi khi lấy dòng thời gian");
//                     return res.json();
//                 }) : Promise.resolve([])
//             ]);
//         })
//         .then(([rentals, deviceRentalsRes, serviceRentalsRes, timelinesRes]) => {
//             // Xóa bảng cũ
//             document.querySelector("#deviceTable tbody").innerHTML = "";
//             document.querySelector("#serviceTable tbody").innerHTML = "";
//             document.querySelector("#timeTable tbody").innerHTML = "";

//             // Xử lý deviceRentals
//             if (deviceRentalsRes) {
//                 let deviceRentals = [];
//                 if (Array.isArray(deviceRentalsRes.result)) {
//                     deviceRentals = deviceRentalsRes.result;
//                 } else if (deviceRentalsRes.result) {
//                     deviceRentals = [deviceRentalsRes.result];
//                 }
//                 deviceRentals.forEach(addDeviceRow);
//             }

//             // Xử lý serviceRentals
//             if (serviceRentalsRes) {
//                 let serviceRentals = [];
//                 if (Array.isArray(serviceRentalsRes.result)) {
//                     serviceRentals = serviceRentalsRes.result;
//                 } else if (serviceRentalsRes.result) {
//                     serviceRentals = [serviceRentalsRes.result];
//                 }
//                 serviceRentals.forEach(addServiceRow);
//             }

//             // Xử lý timelines
//             if (timelinesRes && Array.isArray(timelinesRes.data)) {
//                 timelinesRes.data.forEach(addTimelineRow);
//             }
//             // Xử lý cập nhật
//             document.querySelector("#create").textContent = "Cập nhật";
//             document.querySelector("#create").onclick = function (event) {
//                 event.preventDefault();

//                 const inputPicture = document.querySelector('input[name="picture"]');
//                 const inputName = document.querySelector('input[name="name"]').value;
//                 const inputDescription = document.querySelector('input[name="description"]').value;
//                 const inputEventTypeID = document.querySelector('select[name="eventype"]').value;
//                 const inputDetail = document.querySelector('textarea[name="detail"]').value;

//                 if (!inputName || !inputEventTypeID) {
//                     alert("Vui lòng nhập đầy đủ tên sự kiện và loại sự kiện!");
//                     return;
//                 }

//                 const updatedEvent = {
//                     name: inputName,
//                     description: inputDescription,
//                     eventTypeName: inputEventTypeID, // Sử dụng eventTypeName thay vì event_type_id để khớp với API đầu tiên
//                     detail: inputDetail,
//                     event_format: true,
//                     is_template: false
//                 };

//                 // Tạo FormData
//                 const formData = new FormData();
//                 if (inputPicture.files[0]) {
//                     formData.append('file', inputPicture.files[0]);
//                 }
//                 formData.append('event', new Blob([JSON.stringify(updatedEvent)], {
//                     type: 'application/json'
//                 }));

//                 // Cập nhật sự kiện
//                 fetch(`${EventAPI}/${editEventId}`, {
//                     method: 'PATCH',
//                     headers: {
//                         "Authorization": `Bearer ${token}`
//                     },
//                     body: formData
//                 })
//                     .then(response => {
//                         if (!response.ok) throw new Error("Lỗi server");
//                         return response.json();
//                     })
//                     .then(data => {
//                         const eventResponse = data.result || data;
//                         console.log("Event vừa cập nhật có ID:", eventResponse.id);

//                         // Cập nhật rental, device rentals, service rentals, timelines
//                         updateRental(rentalId, editEventId);
//                         updateDeviceRentals(rentalId, deviceRentalsRes);
//                         updateServiceRentals(rentalId, serviceRentalsRes);
//                         updateTimelines(rentalId, timelinesRes);

//                         console.log("Đã cập nhật sự kiện thành công:", eventResponse);
//                         alert("Cập nhật sự kiện thành công!");
//                         window.location.href = "table-event.html";
//                     })
//                     .catch(error => {
//                         console.error('Lỗi cập nhật sự kiện:', error);
//                         alert(`Lỗi cập nhật sự kiện: ${error.message}`);
//                     });
//             };
//         })
//         .catch(error => {
//             console.error('Lỗi khi tải dữ liệu:', error);
//         });

// }
function loadEditForm(editEventId) {
    if (!editEventId) return;
    console.log("Chỉnh sửa sự kiện ID:", editEventId);
    const inputPicture = document.querySelector('input[name="picture"]');
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/card.jpg";
    let rentalId = null;

    // Lấy token từ localStorage
    let token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    // Lấy danh sách loại sự kiện (event types)
    fetch(EventTypeAPI, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi khi lấy loại sự kiện");
            return response.json();
        })
        .then(eventTypes => {
            console.log('Event Types:', eventTypes);
            var selectEventType = document.querySelector('select[name="eventype"]');
            selectEventType.innerHTML = '<option value="">Chọn loại sự kiện</option>';
            if (Array.isArray(eventTypes)) {
                eventTypes.forEach(type => {
                    var option = document.createElement("option");
                    option.value = type.name;
                    option.textContent = type.name;
                    selectEventType.appendChild(option);
                });
            }

            // Lấy thông tin sự kiện
            return fetch(`${EventAPI}/${editEventId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (!res.ok) throw new Error("Lỗi khi lấy thông tin sự kiện");
                return res.json();
            });
        })
        .then(event => {
            console.log('Event Data minh minh:', event);
            // Hiển thị thông tin sự kiện
            document.querySelector('input[name="name"]').value = event.name || "";
            document.querySelector('input[name="description"]').value = event.description || "";
            document.querySelector('textarea[name="detail"]').value = event.detail || "";
            document.querySelector('select[name="eventype"]').value = event.eventTypeName;

            // Xử lý hiển thị ảnh
            if (event.img) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = event.img.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;
                    console.log('Image URL:', imageUrl);
                    const newImg = document.createElement('img');
                    newImg.id = 'image';
                    newImg.style.maxWidth = '500px';
                    newImg.style.height = '400px';
                    newImg.alt = 'Event Preview';
                    if (imagePreview) {
                        imagePreview.parentNode.replaceChild(newImg, imagePreview);
                    }
                    newImg.src = imageUrl;
                    newImg.onerror = function () {
                        console.error('Lỗi tải ảnh:', imageUrl);
                        this.src = defaultImagePath;
                    };
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    if (imagePreview) imagePreview.src = defaultImagePath;
                }
            } else {
                if (imagePreview) imagePreview.src = defaultImagePath;
            }

            // Xử lý preview ảnh khi chọn file mới
            inputPicture.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        imagePreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Lấy dữ liệu rental theo eventId
            return fetch(`${RentalAPI}/event/${editEventId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (!res.ok) throw new Error("Lỗi khi lấy danh sách thuê");
                return res.json();
            });
        })
        .then(rentals => {
            if (rentals && rentals.length > 0) {
                rentalId = rentals[0].id;
                console.log("Rental ID:", rentalId);
            } else {
                console.warn("Không tìm thấy rental cho event_id:", editEventId);
                rentalId = null;
            }

            // Lấy dữ liệu device rentals, service rentals, timelines
            return Promise.all([
                Promise.resolve(rentals),
                rentalId ? fetch(`${DeviceRental}/rental/${rentalId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).then(res => {
                    if (!res.ok) throw new Error("Lỗi khi lấy thuê thiết bị");
                    return res.json();
                }) : Promise.resolve({ result: [] }),
                rentalId ? fetch(`${ServiceRental}/rental/${rentalId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).then(res => {
                    if (!res.ok) throw new Error("Lỗi khi lấy thuê dịch vụ");
                    return res.json();
                }) : Promise.resolve({ result: [] }),
                rentalId ? fetch(`${Timeline}/rental/${rentalId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).then(res => {
                    if (!res.ok) throw new Error("Lỗi khi lấy dòng thời gian");
                    return res.json();
                }) : Promise.resolve({ data: [] })
            ]);
        })
        .then(([rentals, deviceRentalsRes, serviceRentalsRes, timelinesRes]) => {
            // Xóa bảng cũ
            document.querySelector("#deviceTable tbody").innerHTML = "";
            document.querySelector("#serviceTable tbody").innerHTML = "";
            document.querySelector("#timeTable tbody").innerHTML = "";

            // Xử lý deviceRentals
            let deviceRentals = [];
            if (deviceRentalsRes && Array.isArray(deviceRentalsRes.result)) {
                deviceRentals = deviceRentalsRes.result;
            } else if (deviceRentalsRes && deviceRentalsRes.result) {
                deviceRentals = [deviceRentalsRes.result];
            }
            deviceRentals.forEach(addDeviceRow);

            // Xử lý serviceRentals
            let serviceRentals = [];
            if (serviceRentalsRes && Array.isArray(serviceRentalsRes.result)) {
                serviceRentals = serviceRentalsRes.result;
            } else if (serviceRentalsRes && serviceRentalsRes.result) {
                serviceRentals = [serviceRentalsRes.result];
            }
            serviceRentals.forEach(addServiceRow);

            // Xử lý timelines
            let timelines = [];
            if (timelinesRes && Array.isArray(timelinesRes.data)) {
                timelines = timelinesRes.data;
            }
            timelines.forEach(addTimelineRow);

            // Xử lý cập nhật
            document.querySelector("#create").textContent = "Cập nhật";
            document.querySelector("#create").onclick = async function (event) {
                event.preventDefault();

                const inputPicture = document.querySelector('input[name="picture"]');
                const inputName = document.querySelector('input[name="name"]').value;
                const inputDescription = document.querySelector('input[name="description"]').value;
                const inputEventTypeID = document.querySelector('select[name="eventype"]').value;
                const inputDetail = document.querySelector('textarea[name="detail"]').value;

                if (!inputName || !inputEventTypeID) {
                    alert("Vui lòng nhập đầy đủ tên sự kiện và loại sự kiện!");
                    return;
                }

                const updatedEvent = {
                    name: inputName,
                    description: inputDescription,
                    eventTypeName: inputEventTypeID,
                    detail: inputDetail,
                    event_format: true,
                    is_template: false
                };

                // Tạo FormData
                const formData = new FormData();
                if (inputPicture.files[0]) {
                    formData.append('file', inputPicture.files[0]);
                }
                formData.append('event', new Blob([JSON.stringify(updatedEvent)], {
                    type: 'application/json'
                }));

                try {
                    // Cập nhật sự kiện
                    const response = await fetch(`${EventAPI}/${editEventId}`, {
                        method: 'PATCH',
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!response.ok) throw new Error("Lỗi server");
                    const data = await response.json();
                    const eventResponse = data.result || data;
                    console.log("Event vừa cập nhật có ID:", eventResponse.id);

                    // Trích xuất dữ liệu đúng để truyền vào các hàm cập nhật
                    const oldDeviceRentals = deviceRentals;
                    const oldServiceRentals = serviceRentals;
                    const oldTimelines = timelines;

                    // Ghi log để kiểm tra dữ liệu trước khi cập nhật
                    console.log("oldDeviceRentals trước khi cập nhật:", deviceRentalsRes);
                    console.log("oldServiceRentals trước khi cập nhật:", serviceRentalsRes);
                    console.log("oldTimelines trước khi cập nhật:", timelinesRes);

                    if (rentals && rentals.length > 0) {
                        rentalId = rentals[0].id;
                        console.log("Rental ID:", rentalId);
                    } else {
                        console.warn("Không tìm thấy rental cho event_id:", editEventId);
                        rentalId = null;
                    }
                    // Cập nhật rental, device rentals, service rentals, timelines
                    await Promise.all([
                        updateRental(rentalId, editEventId), // Nếu hàm này trả về Promise
                        updateDeviceRentals(rentalId, deviceRentals),
                        updateServiceRentals(rentalId, serviceRentals),
                        updateTimelines(rentalId, timelines)
                    ]);

                    console.log("Đã cập nhật sự kiện thành công:", eventResponse);
                    alert("Cập nhật sự kiện thành công!");
                    window.location.href = "table-event.html";
                } catch (error) {
                    console.error('Lỗi cập nhật sự kiện:', error);
                    alert(`Lỗi cập nhật sự kiện: ${error.message}`);
                }
            };
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
        });
}
function handleDeleteEvent(id) {
    console.log("Xoá sự kiện ID:", id);
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    var options = {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },

    };
    fetch(`${EventAPI}/${id}`, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listEvent = document.querySelector(`.list-event-${id}`)
            if (listEvent) {
                listEvent.remove();
            }
            alert("Xoá sự kiện thành công!");
        })

}
//Xem chi tiết
function handleDetailEvent(eventId) {
    localStorage.setItem("editEventId", eventId); // Lưu ID vào localStorage
    window.location.href = "detail_event.html"; // Chuyển đến form cập nhật
}
function watchDetailEvent(editEventId) {
    if (!editEventId) return;

    const imagePreview = document.getElementById("inputImage"); // Khớp với id trong HTML
    const defaultImagePath = "assets/img/card.jpg";

    // Gọi API lấy thông tin sự kiện (không cần token)
    fetch(`${EventAPI}/${editEventId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(event => {
            // Cập nhật các thẻ <div> với dữ liệu sự kiện
            document.getElementById("inputName").textContent = event.name || "";
            document.getElementById("inputDescription").textContent = event.description || "";
            document.getElementById("inputDetail").textContent = event.detail || "";
            document.getElementById("EventTypes").textContent = event.eventTypeName || "";

            // Hiển thị ảnh sự kiện
            if (event.img) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = event.img.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    if (imagePreview) {
                        imagePreview.src = imageUrl;
                        imagePreview.onerror = function () {
                            console.error('Lỗi tải ảnh:', imageUrl);
                            this.src = defaultImagePath;
                        };
                    }
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    if (imagePreview) imagePreview.src = defaultImagePath;
                }
            } else {
                if (imagePreview) imagePreview.src = defaultImagePath;
            }
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
            alert("Không thể tải thông tin sự kiện!");
        });
}
//_______________________________device_________________________//

function addDeviceRow(deviceRental) {
    const tbody = document.querySelector("#deviceTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="form-control" name="devicetype">
                <option value="${deviceRental.id || ""}">${deviceRental.deviceTypeName || "Chọn loại thiết bị"}</option>
            </select>
        </td>
        <td>
            <select class="form-control" name="devicename">
                <option value="${deviceRental.id || ""}">${deviceRental.deviceName || "Chọn thiết bị"}</option>
            </select>
        </td>
        <td><input type="text" class="form-control" name="namesuplier" value="${deviceRental.supplierName || ""}"></td>
        <td><input type="number" class="form-control" name="pricedevice" value="${deviceRental.pricePerDay || 0}" min="0" step="1000" readonly></td>
        <td><input type="number" class="form-control" name="quantitydevice" value="${deviceRental.quantity || 1}" min="1"></td>
        <td><input type="text" class="form-control" name="totalmoneydevice" value="${deviceRental.totalPrice ? deviceRental.totalPrice.toLocaleString("vi-VN") + " VND" : "0 VND"}" readonly></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);

    // Tính tổng tiền
    updateTotalPrice(newRow);

    // Gán sự kiện thay đổi
    newRow.querySelector('select[name="devicetype"]').addEventListener("change", function () {
        updateDeviceOptions(this.value, newRow);
    });
    newRow.querySelector('select[name="devicename"]').addEventListener("change", function () {
        handleDeviceChange(this, newRow);
    });
    newRow.querySelector('input[name="quantitydevice"]').addEventListener("input", () => updateTotalPrice(newRow));

    // Xử lý xóa hàng
    newRow.querySelector(".remove-row").addEventListener("click", function () {
        newRow.remove();
    });
}
//sự kiện thêm dòng tr khi nhân button thêm thiết bị 
function setupDeviceTable(deviceTypes) {
    const addButton = document.querySelector("#buttonAddDevice");
    const tbody = document.querySelector("#deviceTable tbody");

    if (!addButton || !tbody) {
        console.warn("Không tìm thấy #buttonAddDevice hoặc #deviceTable tbody trong DOM");
        return;
    }

    addButton.onclick = function () {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>
                <select class="form-select w-auto" name="devicetype">
                    <option value="">Chọn loại thiết bị</option>
                </select>
            </td>
            <td>
                <select class="form-select" style="width: 150px;" name="devicename">
                    <option value="">Chọn thiết bị</option>
                </select>
            </td>
            <td>
                <select class="form-select" style="width: 170px;" name="namesuplier">
                    <option value="">Chọn tên</option>
                </select>
            </td>
            <td><input type="number" class="form-control" name="pricedevice" min="0" step="1000" readonly></td>
            <td><input type="number" class="form-control" value="1" min="1" name="quantitydevice"></td>
            <td><input type="text" class="form-control" readonly name="totalmoneydevice"></td>
            <td class="text-center">
                <button class="btn btn-outline-danger remove-row">🗑</button>
            </td>
        `;

        tbody.appendChild(newRow);

        // Cập nhật danh sách loại thiết bị
        populateDeviceTypes(deviceTypes, newRow);

        // Gán sự kiện cập nhật tổng tiền cho dòng mới
        newRow.querySelector('input[name="pricedevice"]').addEventListener("input", () => updateTotalPrice(newRow));
        newRow.querySelector('input[name="quantitydevice"]').addEventListener("input", () => {
            const quantity = parseInt(newRow.querySelector('input[name="quantitydevice"]').value);
            const deviceId = newRow.querySelector('select[name="devicename"]').value;
            const availableQuantity = getAvailableQuantity(deviceId); // Lấy số lượng có sẵn

            if (quantity > availableQuantity) {
                alert(`Không đủ số lượng thiết bị. Số lượng có sẵn: ${availableQuantity}`);
                newRow.querySelector('input[name="quantitydevice"]').value = availableQuantity; // Đặt lại số lượng
            } else {
                updateTotalPrice(newRow);
            }
        });

        // Gán sự kiện chọn thiết bị để cập nhật nhà cung cấp
        const deviceSelect = newRow.querySelector('select[name="devicename"]');
        if (deviceSelect) {
            deviceSelect.addEventListener("change", function (event) {
                handleDeviceChange(event); // Gọi hàm cập nhật nhà cung cấp
            });
        }
    };

    // Sự kiện xóa dòng
    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-row")) {
            event.target.closest("tr").remove();
        }
    });
}
// Hàm lấy số lượng thiết bị có sẵn
function getAvailableQuantity(deviceId) {
    const device = window.devices.find(device => device.id === deviceId);                  //lấy từ bẳng device
    return device ? device.quantity : 0; // Trả về số lượng có sẵn hoặc 0 nếu không tìm thấy
}

// Hàm cập nhật danh sách loại thiết bị và gắn sự kiện chọn thiết bị
function populateDeviceTypes(deviceTypes, row = document) {
    const selectElements = row.querySelectorAll('select[name="devicetype"]');
    if (!selectElements.length) {
        console.warn("Không tìm thấy select[name='devicetype'] trong DOM:", row);
        return;
    }

    // Duyệt qua từng <select> element
    selectElements.forEach(select => {
        // Xóa các tùy chọn cũ và thêm tùy chọn mặc định
        select.innerHTML = `<option value="">Chọn loại thiết bị</option>`;

        // Kiểm tra nếu deviceTypes không phải mảng, chuyển thành mảng
        const deviceList = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
        if (!deviceList.length) {
            console.warn("deviceTypes rỗng hoặc không có dữ liệu!");
            return;
        }

        // Duyệt qua danh sách deviceTypes và thêm từng <option>
        deviceList.forEach(type => {
            if (!type.id || !type.name) {
                console.warn("Dữ liệu type không hợp lệ:", type);
                return;
            }
            const option = document.createElement('option');
            option.value = type.id; // Lưu ID
            option.textContent = type.name; // Hiển thị tên
            // console.log("Thêm option:", type.id, type.name);
            select.appendChild(option);
        });

        // Gắn sự kiện change
        select.addEventListener("change", function () {
            const row = this.closest("tr");
            updateDeviceOptions(this.value, row);
        });
    });
}

// Hàm cập nhật danh sách thiết bị theo loại
function updateDeviceOptions(typeId, row) {
    const deviceSelect = row.querySelector('select[name="devicename"]');
    const supplierSelect = row.querySelector('select[name="namesuplier"]');

    deviceSelect.innerHTML = `<option value="">Chọn thiết bị</option>`;
    supplierSelect.innerHTML = `<option value="">Chọn tên</option>`;

    // Log để debug
    console.log("typeId:", typeId);
    console.log("window.devices:", window.devices);
    console.log("window.deviceTypes:", window.deviceTypes);

    // Tìm deviceType tương ứng với typeId để lấy name
    const deviceType = window.deviceTypes.find(type => type.id === typeId);
    if (!deviceType) {
        console.warn("Không tìm thấy deviceType với typeId:", typeId);
        deviceSelect.innerHTML = `<option value="">Không có thiết bị</option>`;
        return;
    }

    const deviceTypeName = deviceType.name;
    console.log("deviceTypeName:", deviceTypeName);

    // Lọc thiết bị theo deviceType_name
    const filteredDevices = window.devices.filter(device => device.deviceType_name === deviceTypeName);

    // Log để kiểm tra kết quả lọc
    console.log("filteredDevices:", filteredDevices);

    if (!filteredDevices.length) {
        deviceSelect.innerHTML = `<option value="">Không có thiết bị</option>`;
        return;
    }

    // Hiển thị tên thiết bị (device.name)
    deviceSelect.innerHTML += filteredDevices.map(device =>
        `<option value="${device.id}" data-user-id="${device.userID}" data-price="${device.hourlyRentalFee}">
            ${device.name}
        </option>`).join("");

    deviceSelect.onchange = function () {
        handleDeviceChange({ target: this }); // Gọi handleDeviceChange với event
    };
}


// Hàm xử lý khi chọn thiết bị
function handleDeviceChange(event) {
    const deviceSelect = event.target;
    if (!deviceSelect) return;

    const row = deviceSelect.closest("tr");
    if (!row) return;

    const selectedDevice = deviceSelect.options[deviceSelect.selectedIndex];
    if (!selectedDevice) return;

    const priceInput = row.querySelector('input[name="pricedevice"]');
    const supplierSelect = row.querySelector('select[name="namesuplier"]');

    if (!priceInput || !supplierSelect) return;

    priceInput.value = selectedDevice.dataset.price || "";
    updateTotalPrice(row);

    // Cập nhật nhà cung cấp
    const userId = selectedDevice.dataset.userId; // Sửa từ user_id thành userId
    const user = window.users.find(user => user.id === userId);

    supplierSelect.innerHTML = user
        ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
        : `<option value="">Không xác định</option>`;
}


// Gán sự kiện một cách an toàn
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('select[name="devicename"]').forEach(select => {
        select.addEventListener("change", handleDeviceChange);
    });
});

// Hàm tính tổng tiền
function updateTotalPrice(row) {
    let priceInput = row.querySelector('input[name="pricedevice"]');
    let quantityInput = row.querySelector('input[name="quantitydevice"]');
    let totalInput = row.querySelector('input[name="totalmoneydevice"]');

    let price = parseFloat(priceInput.value) || 0;
    let quantity = parseInt(quantityInput.value) || 0;
    let total = price * quantity;

    totalInput.value = total.toLocaleString("vi-VN") + " VND"; // Định dạng tiền VND
}
//________________________________service_________________________//
// Hàm thêm dòng dịch vụ
function addServiceRow(serviceRental) {
    const tbody = document.querySelector("#serviceTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="form-control" name="servicename">
                <option value="${serviceRental.id || ""}">${serviceRental.serviceName || "Chọn dịch vụ"}</option>
            </select>
        </td>
        <td><input type="text" class="form-control" name="namesuplier" value="${serviceRental.supplierName || ""}" readonly></td>
        <td><input type="number" class="form-control" name="price" value="${serviceRental.pricePerDay || 0}" readonly></td>
        <td><input type="number" class="form-control" name="quantity" value="${serviceRental.quantity || 1}" min="1"></td>
        <td><input type="text" class="form-control" name="totalmoney" value="${serviceRental.totalPrice ? serviceRental.totalPrice.toLocaleString("vi-VN") + " VND" : "0 VND"}" readonly></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);

    // Tính tổng tiền
    updateServiceTotal(newRow);
    newRow.querySelector('select[name="servicename"]').addEventListener("change", function () {
        handleServiceChange(this, newRow);
    });
    newRow.querySelector('input[name="quantity"]').addEventListener("input", () => updateServiceTotal(newRow));

    // Xử lý xóa hàng
    newRow.querySelector(".remove-row").addEventListener("click", function () {
        newRow.remove();
    });
}
function updateServiceTotal(row) {
    let priceInput = row.querySelector('input[name="price"]');
    let quantityInput = row.querySelector('input[name="quantity"]');
    let totalInput = row.querySelector('input[name="totalmoney"]');

    let price = parseFloat(priceInput.value) || 0;
    let quantity = parseInt(quantityInput.value) || 1;
    if (isNaN(price) || isNaN(quantity)) {
        totalInput.value = "0 VND";
        return;
    }

    let total = price * quantity;
    totalInput.value = total.toLocaleString("vi-VN") + " VND";
}
function setupServiceTable(services) {
    const addButton = document.querySelector("#buttonAddService");
    const tbody = document.querySelector("#serviceTable tbody");

    if (!addButton || !tbody) {
        console.warn("Không tìm thấy #buttonAddService hoặc #serviceTable tbody trong DOM");
        return;
    }

    addButton.onclick = function () {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>
                <select class="form-select w-auto" name="servicename">
                    <option value="">Chọn dịch vụ</option>
                </select>
            </td>
            <td>
                <select class="form-select" style="width: 170px;" name="namesuplier">
                    <option value="">Chọn tên</option>
                </select>
            </td>
            <td><input type="number" class="form-control" name="price" min="0" step="1000" readonly></td>
            <td><input type="number" class="form-control" value="1" min="1" name="quantity"></td>
            <td><input type="text" class="form-control" readonly name="totalmoney"></td>
            <td class="text-center">
                <button class="btn btn-outline-danger remove-row">🗑</button>
            </td>
        `;

        tbody.appendChild(newRow);

        // Cập nhật danh sách dịch vụ
        populateService(services, newRow);

        // Gán sự kiện cập nhật tổng tiền cho dòng mới
        newRow.querySelector('input[name="price"]').addEventListener("input", () => updateServiceTotal(newRow));
        newRow.querySelector('input[name="quantity"]').addEventListener("input", () => {
            const quantity = parseInt(newRow.querySelector('input[name="quantity"]').value);
            const serviceId = newRow.querySelector('select[name="servicename"]').value;
            const availableQuantity = getAvailableServiceQuantity(serviceId); // Lấy số lượng có sẵn

            if (quantity > availableQuantity) {
                alert(`Không đủ số lượng dịch vụ. Số lượng có sẵn: ${availableQuantity}`);
                newRow.querySelector('input[name="quantity"]').value = availableQuantity; // Đặt lại số lượng
            } else {
                updateServiceTotal(newRow);
            }
        });

        // Gán sự kiện chọn dịch vụ để cập nhật nhà cung cấp
        const serviceSelect = newRow.querySelector('select[name="servicename"]');
        if (serviceSelect) {
            serviceSelect.addEventListener("change", function (event) {
                handleServiceChange(event); // Gọi hàm cập nhật nhà cung cấp
            });
        }
    };

    // Sự kiện xóa dòng
    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-row")) {
            event.target.closest("tr").remove();
        }
    });
}
// Hàm lấy số lượng dịch vụ có sẵn
function getAvailableServiceQuantity(serviceId) {
    const service = window.services.find(service => service.id === serviceId);
    return service ? service.quantity : 0; // Trả về số lượng có sẵn hoặc 0 nếu không tìm thấy
}


// Hàm gán danh sách dịch vụ cho select
function populateService(services, row = document) {
    const selectElements = row.querySelectorAll('select[name="servicename"]');
    if (!selectElements.length) {
        console.warn("Không tìm thấy select[name='servicename'] trong DOM:", row);
        return;
    }

    // Duyệt qua từng <select> element
    selectElements.forEach(select => {
        // Xóa các tùy chọn cũ và thêm tùy chọn mặc định
        select.innerHTML = `<option value="">Chọn dịch vụ</option>`;

        // Kiểm tra nếu services không phải mảng, chuyển thành mảng
        const serviceList = Array.isArray(services) ? services : [services];
        if (!serviceList.length) {
            console.warn("services rỗng hoặc không có dữ liệu!");
            return;
        }

        // Duyệt qua danh sách services và thêm từng <option>
        serviceList.forEach(service => {
            if (!service.id || !service.name) {
                console.warn("Dữ liệu service không hợp lệ:", service);
                return;
            }
            const option = document.createElement('option');
            option.value = service.id; // Lưu ID
            option.setAttribute('data-user-id', service.userID); // Sửa từ user_id thành userID
            option.setAttribute('data-price', service.hourly_salary); // Lưu giá
            option.textContent = service.name; // Hiển thị tên
            select.appendChild(option);
        });

        // Gắn sự kiện change
        select.addEventListener("change", function () {
            handleServiceChange({ target: this });
        });
    });
}
function handleServiceChange(event) {
    const serviceSelect = event.target;
    if (!serviceSelect) return;

    const row = serviceSelect.closest("tr");
    if (!row) return;

    const selectedService = serviceSelect.options[serviceSelect.selectedIndex];
    if (!selectedService) return;

    const priceInput = row.querySelector('input[name="price"]');
    const supplierSelect = row.querySelector('select[name="namesuplier"]');

    if (!priceInput || !supplierSelect) return;

    priceInput.value = selectedService.dataset.price || "";
    updateServiceTotal(row);

    // Cập nhật nhà cung cấp
    const userId = selectedService.dataset.userId;
    const user = window.users.find(user => user.id === userId);

    supplierSelect.innerHTML = user
        ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
        : `<option value="">Không xác định</option>`;
}

//__________________________________Timeline_________________________//
//Sự kiên thêm dòng tr khi nhấn button thêm timeline
function setupTimelineTable() {
    const addButton = document.querySelector("#buttonAddTime");
    const tbody = document.querySelector("#timeTable tbody");

    if (!addButton || !tbody) return;

    addButton.addEventListener("click", function () {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
             <td>
            <input type="date" class="form-control" name="timelineDate" >
            <input type="time" class="form-control" name="timelineTime" >
        </td>
            <td><textarea class="form-control" name="descriptiontime" style="min-width: 500px"></textarea></td>
            <td class="text-center">
                <button class="btn btn-outline-danger remove-row">🗑</button>
            </td>
        `;
        tbody.appendChild(newRow);
    });

    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-row")) {
            event.target.closest("tr").remove();
        }
    });
}

// function addTimelineRow(timeline) {
//     const tbody = document.querySelector("#timeTable tbody");
//     const date = timeline.time_start ? new Date(timeline.time_start) : null;
//     const formattedTime = date && !isNaN(date)
//         ? new Date(date.getTime() - (7 * 60 * 60 * 1000)).toISOString().slice(0, 16)  // Trừ 7 tiếng
//         : "";
//     const newRow = document.createElement("tr");
//     newRow.innerHTML = `
//         <td><input type="datetime-local" class="form-control" name="timeline" value="${formattedTime}"></td>
//         <td><textarea class="form-control" name="descriptiontime" style="min-width: 500px">${timeline.description || ""}</textarea></td>
//         <td class="text-center">
//             <button class="btn btn-outline-danger remove-row">🗑</button>
//         </td>
//     `;
//     tbody.appendChild(newRow);
// }
// function toISODateTime(dateStr, timeStr) {
//     if (!dateStr || !timeStr) return '';
//     const [day, month, year] = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
//     const date = new Date(`${year}-${month}-${day}`);
//     if (isNaN(date)) return '';
//     const [hours, minutes] = timeStr.split(':').map(Number);
//     if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
//         return '';
//     }
//     date.setHours(hours, minutes);
//     return date.toISOString();
// }
function toISODateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return '';

    // dateStr expected format: "YYYY-MM-DD"
    // timeStr expected format: "HH:MM"
    const dateTimeStr = `${dateStr}T${timeStr}`;
    const date = new Date(dateTimeStr);

    if (isNaN(date)) return '';

    return date.toISOString();
}

function addTimelineRow(timeline) {
    const tbody = document.querySelector("#timeTable tbody");
    const date = timeline.time_start ? new Date(timeline.time_start) : null;
    const formattedDate = date && !isNaN(date)
        ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
        : "";
    const formattedTime = date && !isNaN(date)
        ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        : "";
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <input type="date" class="form-control" name="timelineDate" value="${formattedDate}" placeholder="DD/MM/YYYY">
            <input type="time" class="form-control" name="timelineTime" value="${formattedTime}">
        </td>
        <td><textarea class="form-control" name="descriptiontime" style="min-width: 500px">${timeline.description || ""}</textarea></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);
}
//_______xử lý rental, devicerental, servicerental, timeline_____________//
// Hàm xử lý khi nhấn nút "Lưu"

function createRentalWithEventId(eventId) {
    if (!eventId) {
        alert("ID sự kiện không hợp lệ!");
        return;
    }

    const totalPrice = calculateTotalPrice();
    if (!totalPrice || totalPrice <= 0) {
        alert("Tổng giá không hợp lệ!");
        return;
    }

    let user;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        console.error("Lỗi khi phân tích user từ localStorage:", error);
        alert("Dữ liệu người dùng không hợp lệ!");
        return;
    }
    const userId = user ? user.id : null;

    if (!userId) {
        alert("Bạn cần đăng nhập để thực hiện hành động này!");
        return;
    }

    console.log("ID sự kiện đang sử dụng:", eventId);

    const rentalData = {
        customLocation: "Địa điểm tùy chỉnh",
        rentalStartTime: new Date().toISOString(),
        rentalEndTime: new Date(Date.now() + 86400000).toISOString(),
        totalPrice: totalPrice,
        eventId: eventId,
        userId: userId
    };
    console.log("RentalRequest gửi lên:", rentalData);

    createRental(rentalData)
        .then(rentalResponse => {
            const newRentalId = rentalResponse.id;
            console.log("Rental ID vừa tạo:", newRentalId);

            const deviceRows = document.querySelectorAll("#deviceTable tbody tr").length;
            const serviceRows = document.querySelectorAll("#serviceTable tbody tr").length;
            const timelineRows = document.querySelectorAll("#timeTable tbody tr").length;

            if (deviceRows === 0 && serviceRows === 0 && timelineRows === 0) {
                alert("Vui lòng thêm ít nhất một thiết bị, dịch vụ hoặc timeline!");
                return;
            }

            // Chờ tất cả device_rental, service_rental, timeline được tạo
            Promise.all([
                handleDeviceRentals(newRentalId),
                handleServiceRentals(newRentalId),
                handleTimelines(newRentalId)
            ])
                .then(() => {
                    console.log("Tất cả device_rental, service_rental, timeline đã được tạo thành công!");
                    showToast("Tạo sự kiện thành công!", "success");
                    window.location.href = "table-event.html";;
                })
                .catch(error => {
                    console.error("Lỗi chi tiết khi tạo các bản ghi:", error);
                    showToast("Đã xảy ra lỗi khi tạo các bản ghi: " + error.message, "error");
                });
        }).catch(error => {
            console.error("Không thể tạo rental, dừng luồng thực thi:", error);
            showToast("Không thể tạo rental: " + error.message, "error");
        });
}
// ... existing code ...

//___________thông báo___________________//
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = type; // success, error, warning
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000); // Ẩn sau 3 giây
}
//_____________________________________________
// Hàm tính tổng giá trị từ thiết bị và dịch vụ
function calculateTotalPrice() {
    let total = 0;

    // Hàm chuyển đổi chuỗi số tiền thành số
    function parseMoneyString(moneyString) {
        // Loại bỏ tất cả dấu phẩy và các ký tự không phải số
        const cleanString = moneyString.replace(/[^0-9]/g, "");
        return parseInt(cleanString) || 0; // Chuyển thành số nguyên, mặc định là 0 nếu lỗi
    }

    // Tính tổng từ bảng thiết bị
    const deviceRows = document.querySelectorAll("#deviceTable tbody tr");
    deviceRows.forEach(row => {
        const totalMoneyInput = row.querySelector('input[name="totalmoneydevice"]');
        const totalMoney = parseMoneyString(totalMoneyInput.value); // Chuyển đổi chuỗi thành số
        total += totalMoney;
    });

    // Tính tổng từ bảng dịch vụ
    const serviceRows = document.querySelectorAll("#serviceTable tbody tr");
    serviceRows.forEach(row => {
        const totalMoneyInput = row.querySelector('input[name="totalmoney"]');
        const totalMoney = parseMoneyString(totalMoneyInput.value); // Chuyển đổi chuỗi thành số
        total += totalMoney;
    });

    return total;
}
// Hàm tạo rental
function createRental(data) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        throw new Error("Không tìm thấy token");
    }
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    };
    console.log("Dữ liệu gửi đi để tạo rental:", data);
    return fetch(RentalAPI, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi khi tạo rental: ${response.status} ${response.statusText}`);
            }
            return response.json().catch(err => {
                throw new Error(`Lỗi khi phân tích JSON: ${err.message}`);
            });
        });
}

function handleDeviceRentals(rentalId) {
    const deviceRows = document.querySelectorAll("#deviceTable tbody tr");
    const promises = [];

    deviceRows.forEach(row => {
        const deviceId = row.querySelector('select[name="devicename"]').value;
        const quantity = row.querySelector('input[name="quantitydevice"]').value;

        if (deviceId && quantity) {
            const deviceRentalData = {
                rentalId: rentalId,
                deviceId: deviceId,
                quantity: quantity,
                // created_at: new Date().toISOString(),
                // updated_at: new Date().toISOString()
            };

            // Thêm promise vào mảng
            promises.push(
                createDeviceRental(deviceRentalData)
                    .then(() => console.log(`Device rental cho device_id ${deviceId} tạo thành công`))
                    .catch(error => console.error(`Lỗi khi tạo device rental cho device_id ${deviceId}:`, error))
            );
        } else {
            console.warn("Dữ liệu không hợp lệ:", { deviceId, quantity });
        }
    });

    return Promise.all(promises); // Trả về promise chờ tất cả hoàn tất
}



function createDeviceRental(data) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        throw new Error("Không tìm thấy token");
    }

    return fetch(DeviceRental, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || "Lỗi khi tạo device rental");
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Device rental created successfully:", data);
            return data;
        })
        .catch(error => {
            console.error("Error creating device rental:", error);
            throw error;
        });
}

// service
function handleServiceRentals(rentalId) {
    const serviceRows = document.querySelectorAll("#serviceTable tbody tr");
    const promises = [];

    serviceRows.forEach(row => {
        const serviceId = row.querySelector('select[name="servicename"]').value;
        const quantity = row.querySelector('input[name="quantity"]').value;

        if (serviceId && quantity) {
            const serviceRentalData = {
                rentalId: rentalId,
                serviceId: serviceId,
                quantity: quantity,
                // created_at: new Date().toISOString(),
                // updated_at: new Date().toISOString()
            };
            console.log("ServiceRentalRequest gửi lên:", serviceRentalData);
            promises.push(
                createServiceRental(serviceRentalData)
                    .then(() => console.log(`Service rental cho service_id ${serviceId} tạo thành công`))
                    .catch(error => console.error(`Lỗi khi tạo service rental cho service_id ${serviceId}:`, error))
            );
        } else {
            console.warn("Dữ liệu không hợp lệ:", { serviceId, quantity });
        }
    });

    return Promise.all(promises);
}

function createServiceRental(data) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        throw new Error("Không tìm thấy token");
    }

    return fetch(ServiceRental, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || "Lỗi khi tạo service rental");
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Service rental created successfully:", data);
            return data;
        })
        .catch(error => {
            console.error("Error creating service rental:", error);
            console.log("Dữ liệu gửi đi để tạo service rental lỗi:", data);
            throw error;
        });
}

//timline
// function handleTimelines(rentalId) {
//     const timelineRows = document.querySelectorAll("#timeTable tbody tr");
//     const promises = [];

//     timelineRows.forEach(row => {
//         const timeline = row.querySelector('input[name="timeline"]').value;
//         const description = row.querySelector('textarea[name="descriptiontime"]').value;

//         if (timeline && description) {
//             // Tạo đối tượng Date từ giá trị nhập vào và trừ 7 tiếng
//             const inputDate = new Date(timeline);
//             const adjustedDate = new Date(inputDate.getTime() - (7 * 60 * 60 * 1000)); // Trừ 7 tiếng

//             const timelineData = {
//                 rental_id: rentalId,
//                 time_start: adjustedDate.toISOString(), // Lưu thời gian đã điều chỉnh
//                 description: description
//             };

//             promises.push(
//                 createTimeline(timelineData)
//                     .then(() => console.log(`Timeline với time_start ${timeline} tạo thành công`))
//                     .catch(error => console.error(`Lỗi khi tạo timeline với time_start ${timeline}:`, error))
//             );
//         } else {
//             console.warn("Dữ liệu không hợp lệ:", { timeline, description });
//         }
//     });

//     return Promise.all(promises);
// }
function handleTimelines(rentalId) {
    const timelineRows = document.querySelectorAll("#timeTable tbody tr");
    const promises = [];
    timelineRows.forEach(row => {
        const date = row.querySelector('input[name="timelineDate"]').value;
        const time = row.querySelector('input[name="timelineTime"]').value;
        const description = row.querySelector('textarea[name="descriptiontime"]').value;
        if (date && time && description) {
            const time_start = toISODateTime(date, time);
            if (!time_start) {
                console.warn("Thời gian không hợp lệ:", { date, time });
                return;
            }
            const timelineData = {
                rental_id: rentalId,
                time_start: time_start,
                description: description
            };
            console.log("Timeline payload:", JSON.stringify(timelineData));
            promises.push(
                createTimeline(timelineData)
                    .then(() => console.log(`Timeline với time_start ${date} ${time} tạo thành công`))
                    .catch(error => console.error(`Lỗi khi tạo timeline với time_start ${date} ${time}:`, error))
            );
        } else {
            console.warn("Dữ liệu không hợp lệ:", { date, time, description });
        }
    });
    return Promise.all(promises);
}
// Sửa hàm createTimeline để trả về Promise
// function createTimeline(data) {
//     const token = localStorage.getItem("token");
//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         throw new Error("Không tìm thấy token");
//     }

//     return fetch(`${Timeline}/new`, {
//         method: 'POST',
//         headers: {
//             "Content-Type": "application/json",
//             'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(data)
//     })
//         .then(response => {
//             if (!response.ok) {
//                 return response.json().then(err => {
//                     throw new Error(err.message || "Lỗi khi tạo timeline");
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Timeline created successfully:", data);
//             return data;
//         })
//         .catch(error => {
//             console.error("Error creating timeline:", error);
//             throw error;
//         });
// }
function createTimeline(data) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        throw new Error("Không tìm thấy token");
    }

    return fetch(`${Timeline}/new`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || "Lỗi khi tạo timeline");
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Timeline created successfully:", data);
            return data;
        })
        .catch(error => {
            console.error("Error creating timeline:", error);
            throw error;
        });
}
//_________________Updated rental ,devicerental, servicerental, timelien_______//
// Hàm cập nhật rental
function updateRental(rentalId, eventId) {
    const totalPrice = calculateTotalPrice();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.id : null;
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token!");
        alert("Vui lòng đăng nhập lại!");
        return;
    }
    if (!rentalId) {
        console.error("Không có rentalId để cập nhật!");
        alert("Không tìm thấy rentalId!");
        return;
    }

    const updatedRental = {
        customLocation: document.querySelector('input[name="customLocation"]')?.value || "Địa điểm tùy chỉnh",
        rentalStartTime: document.querySelector('input[name="rentalStartTime"]')?.value || new Date().toISOString(),
        rentalEndTime: document.querySelector('input[name="rentalEndTime"]')?.value || new Date(Date.now() + 86400000).toISOString(),
        totalPrice: totalPrice,
        eventId: eventId,
        userId: userId
    };

    return fetch(`${RentalAPI}/${rentalId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedRental)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi khi cập nhật rental: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Cập nhật rental thành công:", data);
            return data; // Trả về dữ liệu để xử lý tiếp nếu cần
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật rental:", error);
            alert(`Lỗi khi cập nhật rental: ${error.message}`);
            throw error; // Ném lỗi để dừng các bước tiếp theo nếu cần
        });
}
// Hàm cập nhật device_rental
function updateDeviceRentals(rentalId, oldDeviceRentals) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return Promise.reject("No token");
    }

    // Đảm bảo oldDeviceRentals là một mảng
    if (!Array.isArray(oldDeviceRentals)) {
        console.error("oldDeviceRentals không phải là mảng:", oldDeviceRentals);
        return Promise.reject("Invalid oldDeviceRentals");
    }

    const currentRows = document.querySelectorAll("#deviceTable tbody tr");
    const currentDeviceRentals = Array.from(currentRows).map(row => ({
        deviceId: row.querySelector('select[name="devicename"]').value,
        quantity: parseInt(row.querySelector('input[name="quantitydevice"]').value) || 1
    }));
    console.log("currentRows:", currentDeviceRentals.deviceId);
    console.log("currentDeviceRentals:", currentDeviceRentals);
    console.log("oldDeviceRentals:", oldDeviceRentals);
    // Xóa các bản ghi không còn trong form
    oldDeviceRentals.forEach(old => {
        if (!currentDeviceRentals.some(current => current.deviceId === old.id)) {
            fetch(`${DeviceRental}/${old.id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            })
                .catch(error => console.error("Lỗi khi xóa device_rental:", error));
        }
    });

    // Thêm hoặc cập nhật
    currentDeviceRentals.forEach(current => {
        const oldRecord = oldDeviceRentals.find(old => old.id === current.deviceId);
        if (oldRecord) {
            if (oldRecord.quantity !== current.quantity) {
                fetch(`${DeviceRental}/${oldRecord.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rentalId: rentalId,
                        deviceId: current.deviceId,
                        quantity: current.quantity,
                    })
                })
                    .catch(error => console.error("Lỗi khi cập nhật device_rental:", error));
            }
        } else {
            createDeviceRental({
                rentalId: rentalId,
                deviceId: current.deviceId,
                quantity: current.quantity
            }, () => console.log("Thêm device_rental thành công"));
        }
    });
}
// Hàm cập nhật service_rental
function updateServiceRentals(rentalId, oldServiceRentals) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return Promise.reject("No token");
    }

    // Đảm bảo oldServiceRentals là một mảng
    if (!Array.isArray(oldServiceRentals)) {
        console.error("oldServiceRentals không phải là mảng:", oldServiceRentals);
        return Promise.reject("Invalid oldServiceRentals");
    }

    // // Xóa các bản ghi không còn trong form
    // oldServiceRentals.forEach(old => {
    //     if (!currentServiceRentals.some(current => current.serviceId === old.id)) {
    //         fetch(`${ServiceRental}/${old.id}`, {
    //             method: 'DELETE',
    //             headers: { "Content-Type": "application/json" }
    //         })
    //             .catch(error => console.error("Lỗi khi xóa service_rental:", error));
    //     }
    // });

    const currentRows = document.querySelectorAll("#serviceTable tbody tr");
    const currentServiceRentals = Array.from(currentRows).map(row => ({
        serviceId: row.querySelector('select[name="servicename"]')?.value,
        quantity: parseInt(row.querySelector('input[name="quantity"]').value) || 1
    }));

    currentServiceRentals.forEach(current => {
        const oldRecord = oldServiceRentals.find(old => old.id === current.serviceId);
        if (oldRecord) {
            if (oldRecord.quantity !== current.quantity) {
                fetch(`${ServiceRental}/${oldRecord.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rentalId: rentalId,
                        serviceId: current.serviceId,
                        quantity: current.quantity,

                    })
                })
                    .catch(error => console.error("Lỗi khi cập nhật service_rental:", error));
            }
        } else {
            createServiceRental({
                rentalId: rentalId,
                serviceId: current.serviceId,
                quantity: current.quantity
            }, () => console.log("Thêm service_rental thành công"));
        }
    });
}
function updateTimelines(rentalId, oldTimelines) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return Promise.reject("No token");
    }

    if (!Array.isArray(oldTimelines)) {
        console.error("oldTimelines không phải là mảng:", oldTimelines);
        return Promise.reject("Invalid oldTimelines");
    }

    // const currentRows = document.querySelectorAll("#timeTable tbody tr");
    // const currentTimelines = Array.from(currentRows).map(row => ({
    //     time_start: row.querySelector('input[name="timeline"]').value,
    //     description: row.querySelector('textarea[name="descriptiontime"]').value
    // }));
    const currentRows = document.querySelectorAll("#timeTable tbody tr");
    const currentTimelines = Array.from(currentRows).map(row => {
        const date = row.querySelector('input[name="timelineDate"]').value;
        const time = row.querySelector('input[name="timelineTime"]').value;
        return {
            time_start: toISODateTime(date, time), // Tính time_start cho từng hàng
            description: row.querySelector('textarea[name="descriptiontime"]').value
        };
    });
    console.log("currentTimelines:", currentTimelines);
    // Xóa các bản ghi không còn trong form
    oldTimelines.forEach(old => {
        if (!currentTimelines.some(current => current.time_start === old.time_start && current.description === old.description)) {
            fetch(`${Timeline}/${old.id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            })
                .catch(error => console.error("Lỗi khi xóa timeline:", error));
        }
    });
    // Thêm hoặc cập nhật
    currentTimelines.forEach(current => {
        const oldRecord = oldTimelines.find(old => old.id === current.time_start && old.description === current.description);
        if (oldRecord) {
            if (oldRecord && oldRecord.description !== current.description) {
                fetch(`${Timeline}/${oldRecord.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rental_id: rentalId,
                        time_start: current.time_start,
                        description: current.description

                    })
                })
                    .catch(error => console.error("Lỗi khi cập nhật service_rental:", error));
            }
        }
        else {
            createTimeline({
                rental_id: rentalId,
                time_start: current.time_start,
                description: current.description
            }, () => console.log("Thêm timeline thành công"));
        }
    });
}
//_________________________________end update device, service, timeline_________________________//

document.querySelector("#deviceTable tbody").addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-row")) {
        event.target.closest("tr").remove();
    }
});
document.querySelector("#serviceTable tbody").addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-row")) {
        event.target.closest("tr").remove();
    }
});
document.querySelector("#timeTable tbody").addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-row")) {
        event.target.closest("tr").remove();
    }
});
