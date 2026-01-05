
var EventAPI = 'http://localhost:8080/event-management/event';
var EventTypeAPI = 'http://localhost:8080/event-management/event-type';
var DeviceAPI = 'http://localhost:8080/event-management/devices/list';
var DeviceTypeAPI = 'http://localhost:8080/event-management/deviceType/list';
var ServiceAPI = 'http://localhost:8080/event-management/services/list';
var RentalAPI = 'http://localhost:8080/event-management/rentals';
// var DeviceRental = 'http://localhost:3000/device_rental';
// var ServiceRental = 'http://localhost:3000/service_rental';
// var Timeline = 'http://localhost:3000/timeline';
var UsersAPI = 'http://localhost:8080/event-management/users';
let rentalId;
function start() {
    getData((events, eventTypes, devices, deviceTypes, services, users) => {
        renderEvents(events, eventTypes);
        setupDeviceTable(deviceTypes);
        window.devices = devices;  // Lưu dữ liệu vào biến toàn cục
        window.deviceTypes = deviceTypes;
        window.users = users;  // Lưu lại đúng danh sách user
        window.events = events;
        window.eventTypes = eventTypes;
        populateDeviceTypes(deviceTypes); // Đảm bảo lấy đúng deviceTypes
        // Setup dịch vụ
        window.services = services; // Lưu vào biến toàn cục
        setupServiceTable(services);
        populateService(services);
        if (document.querySelector("#selectEventTypes")) {
            populateEventTypes(eventTypes);
        }
    });
    handleCreateForm();
    //handleCreateDeviceRentalForm();
    if (document.querySelector("#saveEventType")) {
        handleCreateEventType();
    }
    handleAddEventType(); // Thêm xử lý cho nút "+"
    setupDeviceTable();
    setupTimelineTable();
    var editEventId = localStorage.getItem("editEventId");


}
start();
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(EventAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(EventTypeAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(DeviceAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(DeviceTypeAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(ServiceAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(RentalAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(DeviceRental, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(ServiceRental, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(Timeline, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(UsersAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
    ])
        .then(([events, eventTypes, devices, deviceTypes, services, rental, deviceRental, serviceRental, timeline, users]) => {
            callback(events, eventTypes, devices, deviceTypes, services, rental, deviceRental, serviceRental, timeline, users);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}
//_____________________________Event____________________________________//
//Xoá event
function handleDeleteEvent(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },

    };
    fetch(EventAPI + '/' + id, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listEvent = document.querySelector('.list-event-' + id)
            if (listEvent) {
                listEvent.remove();
            }
            alert("Xoá sự kiện thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}
//Tạo  sự kiện
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
//Tạo mới form event
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
//Render cho table-event
function renderEvents(events, eventTypes) {
    var listEvenstBlock = document.querySelector('#list-event tbody');
    if (!listEvenstBlock) return;

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-event')) {
        $('#list-event').DataTable().destroy();
    }

    var htmls = events.map(function (event) {
        var eventType = eventTypes.find(type => type.id === event.event_type_id);
        var eventTypeName = eventType ? eventType.name : "Không xác định";
        return `
            <tr class="list-event-${event.id}">
                <td>${event.name}</td>
                <td>${eventTypeName}</td>
                <td style="width: 40%;">${event.description}</td>
                <td>${event.created_at}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${event.id}">Xoá</button>
                            <button class="dropdown-item update-btn" data-id="${event.id}">Cập nhật</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listEvenstBlock.innerHTML = htmls.join('');

    // Khởi tạo lại DataTables
    var table = $('#list-event').DataTable({
        "order": [[3, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ sự kiện",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ dịch vụ",
            "infoEmpty": "Không có dữ liệu",
            "zeroRecords": "Không tìm thấy kết quả",
            "paginate": {
                "first": "Đầu",
                "last": "Cuối",
                "next": "Tiếp",
                "previous": "Trước"
            }
        }
    });

    // 🛠 Gán sự kiện dùng delegate để hoạt động trên tất cả các trang
    $('#list-event tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn các dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện cập nhật
    $('#list-event tbody').on('click', '.update-btn', function () {
        let eventId = $(this).data('id');
        handleUpdateEvent(eventId);
    });

    // Xử lý sự kiện xoá
    $('#list-event tbody').on('click', '.delete-btn', function () {
        let eventId = $(this).data('id');
        handleDeleteEvent(eventId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}
//Cập nhật event
function handleUpdateEvent(eventId) {
    localStorage.setItem("editEventId", eventId); // Lưu ID vào localStorage
    window.location.href = "form-event.html"; // Chuyển đến form cập nhật
}

function loadEditForm(editEventId) {
    if (!editEventId) return;

    console.log("Chỉnh sửa sự kiện ID:", editEventId);
    const inputPicture = document.querySelector('input[name="picture"]');
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/card.jpg";
    let rentalId = null;

    // Lấy danh sách loại sự kiện (event types)
    fetch(EventTypeAPI)
        .then(response => response.json())
        .then(eventTypes => {
            console.log('Event Types:', eventTypes);
            var selectEventType = document.querySelector('select[name="eventype"]');
            selectEventType.innerHTML = '<option value="">Chọn loại sự kiện</option>';

            if (Array.isArray(eventTypes)) {
                eventTypes.forEach(type => {
                    var option = document.createElement("option");
                    option.value = type.id; // Sử dụng ID thay vì name
                    option.textContent = type.name;
                    selectEventType.appendChild(option);
                });
            }

            // Lấy thông tin sự kiện và các dữ liệu liên quan
            return Promise.all([
                fetch(`${EventAPI}/${editEventId}`).then(res => res.json()),
                fetch(DeviceTypeAPI).then(res => res.json()),
                fetch(`${RentalAPI}?event_id=${editEventId}`).then(res => res.json()),
                fetch(`${DeviceAPI}`).then(res => res.json()),
                fetch(`${ServiceAPI}`).then(res => res.json()),
                fetch(`${UsersAPI}`).then(res => res.json())
            ]);
        })
        .then(([event, deviceTypes, rentals, devices, services, users]) => {
            console.log('Event Data:', event);
            window.deviceTypes = deviceTypes;
            window.devices = devices;
            window.services = services;
            window.users = users;

            // Hiển thị thông tin sự kiện
            document.querySelector('input[name="name"]').value = event.name || "";
            document.querySelector('input[name="description"]').value = event.description || "";
            document.querySelector('textarea[name="detail"]').value = event.detail || "";
            document.querySelector('select[name="eventype"]').value = event.event_type_id || "";

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

            // Lấy rental ID nếu có
            if (rentals.length > 0) {
                rentalId = rentals[0].id;
                console.log("Rental ID:", rentalId);
            } else {
                console.warn("Không tìm thấy rental cho event_id:", editEventId);
            }

            // Lấy dữ liệu liên quan đến rental
            return Promise.all([
                Promise.resolve(rentals),
                fetch(`${DeviceRental}?rental_id=${rentalId}`).then(res => res.json()),
                fetch(`${ServiceRental}?rental_id=${rentalId}`).then(res => res.json()),
                fetch(`${Timeline}?rental_id=${rentalId}`).then(res => res.json()),
                Promise.resolve(devices),
                Promise.resolve(services),
                Promise.resolve(users)
            ]);
        })
        .then(([rentals, deviceRentals, serviceRentals, timelines, devices, services, users]) => {
            // Hiển thị thiết bị, dịch vụ, timeline
            document.querySelector("#deviceTable tbody").innerHTML = "";
            document.querySelector("#serviceTable tbody").innerHTML = "";
            document.querySelector("#timeTable tbody").innerHTML = "";

            deviceRentals.forEach(deviceRental => {
                const device = devices.find(d => d.id === deviceRental.device_id);
                if (device) {
                    addDeviceRow(deviceRental.device_id, deviceRental.quantity, device.device_types_id, device.hourly_rental_fee, device.user_id);
                }
            });

            serviceRentals.forEach(serviceRental => {
                const service = services.find(s => s.id === serviceRental.service_id);
                if (service) {
                    addServiceRow(serviceRental.service_id, serviceRental.quantity, service.hourly_salary, service.user_id);
                }
            });

            timelines.forEach(timeline => {
                addTimelineRow(timeline.time_start, timeline.description);
            });

            // Xử lý cập nhật
            document.querySelector("#create").textContent = "Cập nhật";
            document.querySelector("#create").onclick = function (event) {
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
                    eventTypeName: inputEventTypeID, // Sử dụng eventTypeName thay vì event_type_id để khớp với API đầu tiên
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

                // Cập nhật sự kiện
                fetch(`${EventAPI}/${editEventId}`, {
                    method: 'PATCH',
                    body: formData
                })
                    .then(response => {
                        if (!response.ok) throw new Error("Lỗi server");
                        return response.json();
                    })
                    .then(data => {
                        const eventResponse = data.result || data;
                        console.log("Event vừa cập nhật có ID:", eventResponse.id);

                        // Cập nhật rental, device rentals, service rentals, timelines
                        updateRental(rentalId, editEventId);
                        updateDeviceRentals(rentalId, deviceRentals);
                        updateServiceRentals(rentalId, serviceRentals);
                        updateTimelines(rentalId, timelines);

                        console.log("Đã cập nhật sự kiện thành công:", eventResponse);
                        alert("Cập nhật sự kiện thành công!");
                        window.location.href = "table-event.html";
                    })
                    .catch(error => {
                        console.error('Lỗi cập nhật sự kiện:', error);
                        alert(`Lỗi cập nhật sự kiện: ${error.message}`);
                    });
            };
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
        });
}
//Tạo loại sự kiện mới
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


//Su kien render ra eventtype
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
//_________________Updated rental ,devicerental, servicerental, timelien_______//
// Hàm cập nhật rental
function updateRental(rentalId, eventId) {
    const totalPrice = calculateTotalPrice();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.user_id : null; // user.id
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token!");
        return;
    }
    if (!rentalId) {
        console.error("Không có rentalId để cập nhật!");
        return;
    }

    const updatedRental = {
        custom_location: "Địa điểm tùy chỉnh",
        rental_start_time: new Date().toISOString(),
        rental_end_time: new Date(Date.now() + 86400000).toISOString(),
        total_price: totalPrice,
        event_id: eventId,
        user_id: userId,
        updated_at: new Date().toISOString()
    };

    fetch(`${RentalAPI}/${rentalId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedRental)
    })
        .then(response => response.json())
        .catch(error => console.error("Lỗi khi cập nhật rental:", error));
}

// Hàm cập nhật device_rental
function updateDeviceRentals(rentalId, oldDeviceRentals) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    const currentRows = document.querySelectorAll("#deviceTable tbody tr");
    const currentDeviceRentals = Array.from(currentRows).map(row => ({
        device_id: row.querySelector('select[name="devicename"]').value,
        quantity: row.querySelector('input[name="quantitydevice"]').value
    }));

    // Xóa các bản ghi không còn trong form
    oldDeviceRentals.forEach(old => {
        if (!currentDeviceRentals.some(current => current.device_id === old.device_id)) {
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
        const oldRecord = oldDeviceRentals.find(old => old.device_id === current.device_id);
        if (oldRecord) {
            if (oldRecord.quantity !== current.quantity) {
                fetch(`${DeviceRental}/${oldRecord.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rental_id: rentalId,
                        device_id: current.device_id,
                        quantity: current.quantity,
                        updated_at: new Date().toISOString()
                    })
                })
                    .catch(error => console.error("Lỗi khi cập nhật device_rental:", error));
            }
        } else {
            createDeviceRental({
                rental_id: rentalId,
                device_id: current.device_id,
                quantity: current.quantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, () => console.log("Thêm device_rental thành công"));
        }
    });
}

// Hàm cập nhật service_rental
function updateServiceRentals(rentalId, oldServiceRentals) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    const currentRows = document.querySelectorAll("#serviceTable tbody tr");
    const currentServiceRentals = Array.from(currentRows).map(row => ({
        service_id: row.querySelector('select[name="servicetype"]').value,
        quantity: row.querySelector('input[name="quantity"]').value
    }));

    // Xóa các bản ghi không còn trong form
    oldServiceRentals.forEach(old => {
        if (!currentServiceRentals.some(current => current.service_id === old.service_id)) {
            fetch(`${ServiceRental}/${old.id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            })
                .catch(error => console.error("Lỗi khi xóa service_rental:", error));
        }
    });

    // Thêm hoặc cập nhật
    currentServiceRentals.forEach(current => {
        const oldRecord = oldServiceRentals.find(old => old.service_id === current.service_id);
        if (oldRecord) {
            if (oldRecord.quantity !== current.quantity) {
                fetch(`${ServiceRental}/${oldRecord.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rental_id: rentalId,
                        service_id: current.service_id,
                        quantity: current.quantity,
                        updated_at: new Date().toISOString()
                    })
                })
                    .catch(error => console.error("Lỗi khi cập nhật service_rental:", error));
            }
        } else {
            createServiceRental({
                rental_id: rentalId,
                service_id: current.service_id,
                quantity: current.quantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, () => console.log("Thêm service_rental thành công"));
        }
    });
}

// Hàm cập nhật timeline
function updateTimelines(rentalId, oldTimelines) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    const currentRows = document.querySelectorAll("#timeTable tbody tr");
    const currentTimelines = Array.from(currentRows).map(row => ({
        time_start: row.querySelector('input[name="timeline"]').value,
        description: row.querySelector('textarea[name="descriptiontime"]').value
    }));

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
        const oldRecord = oldTimelines.find(old => old.time_start === current.time_start && old.description === current.description);
        if (!oldRecord) {
            createTimeline({
                rental_id: rentalId,
                time_start: current.time_start,
                description: current.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, () => console.log("Thêm timeline thành công"));
        }
    });
}
//_________________________________end update device, service, timeline_________________________//
// Hàm thêm dòng thiết bị
function addDeviceRow(deviceId, quantity, deviceTypeId, price, userId) {
    const tbody = document.querySelector("#deviceTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="form-select w-auto" name="devicetype"></select>
        </td>
        <td>
            <select class="form-select" name="devicename"></select>
        </td>
        <td>
            <select class="form-select" name="namesuplier"></select>
        </td>
        <td><input type="number" class="form-control" name="pricedevice" value="${price || 0}" min="0" step="1000" readonly></td>
        <td><input type="number" class="form-control" value="${quantity}" min="1" name="quantitydevice"></td>
        <td><input type="text" class="form-control" readonly name="totalmoneydevice"></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);
    // Cập nhật giá và tổng tiền
    //updateDeviceOptions(newRow.querySelector('select[name="devicetype"]').value, newRow);
    // Populate danh sách loại thiết bị và chọn giá trị hiện tại
    populateDeviceTypes(window.deviceTypes, newRow);
    const deviceTypeSelect = newRow.querySelector('select[name="devicetype"]');
    deviceTypeSelect.value = deviceTypeId; // Đặt giá trị hiện tại

    // Populate danh sách thiết bị theo loại và chọn giá trị hiện tại
    updateDeviceOptions(deviceTypeId, newRow);
    newRow.querySelector('select[name="devicename"]').value = deviceId;

    // Populate danh sách nhà cung cấp và chọn giá trị hiện tại
    const supplierSelect = newRow.querySelector('select[name="namesuplier"]');
    supplierSelect.innerHTML = window.users.map(user =>
        `<option value="${user.id}" ${user.id === userId ? 'selected' : ''}>${user.last_name} ${user.first_name}</option>`
    ).join('');

    // Tính tổng tiền
    updateTotalPrice(newRow);

    // Gán sự kiện thay đổi
    newRow.querySelector('select[name="devicetype"]').addEventListener("change", function () {
        updateDeviceOptions(this.value, newRow);
    });
    newRow.querySelector('select[name="devicename"]').addEventListener("change", handleDeviceChange);
    newRow.querySelector('input[name="quantitydevice"]').addEventListener("input", () => updateTotalPrice(newRow));
}

// Hàm thêm dòng dịch vụ
function addServiceRow(serviceId, quantity, price, userId) {
    const tbody = document.querySelector("#serviceTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="form-select w-auto" name="servicetype"></select>
        </td>
        <td>
            <select class="form-select w-auto" name="namesuplier"></select>
        </td>
        <td><input type="number" class="form-control" name="price" value="${price || 0}" min="0" step="1000" readonly></td>
        <td><input type="number" class="form-control" value="${quantity}" min="1" name="quantity"></td>
        <td><input type="text" class="form-control" readonly name="totalmoney"></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);
    // Cập nhật giá và tổng tiền
    // Populate danh sách dịch vụ và chọn giá trị hiện tại
    populateService(window.services, newRow);
    newRow.querySelector('select[name="servicetype"]').value = serviceId;

    // Populate danh sách nhà cung cấp và chọn giá trị hiện tại
    const supplierSelect = newRow.querySelector('select[name="namesuplier"]');
    supplierSelect.innerHTML = window.users.map(user =>
        `<option value="${user.id}" ${user.id === userId ? 'selected' : ''}>${user.last_name} ${user.first_name}</option>`
    ).join('');

    // Tính tổng tiền
    updateServiceTotal(newRow);

    // Gán sự kiện thay đổi
    newRow.querySelector('select[name="servicetype"]').addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        newRow.querySelector('input[name="price"]').value = selectedOption.dataset.price || "";
        updateServiceTotal(newRow);
        const supplierSelect = newRow.querySelector('select[name="namesuplier"]');
        const user = window.users.find(u => u.id === selectedOption.dataset.userId);
        supplierSelect.innerHTML = user
            ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
            : `<option value="">Không xác định</option>`;
    });
    newRow.querySelector('input[name="quantity"]').addEventListener("input", () => updateServiceTotal(newRow));
}

// Hàm thêm dòng timeline
function addTimelineRow(timeStart, description) {
    const tbody = document.querySelector("#timeTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><input type="datetime-local" class="form-control" name="timeline" value="${timeStart}"></td>
        <td><textarea class="form-control" name="descriptiontime" style="min-width: 500px">${description}</textarea></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);
}
//____________________________________End Event____________//
//___________________________________DEVICE_______________________________________//
//sự kiện thêm dòng tr khi nhân button thêm thiết bị 
function setupDeviceTable(deviceTypes) {
    const addButton = document.querySelector("#buttonAddDevice");
    const tbody = document.querySelector("#deviceTable tbody");

    if (!addButton || !tbody) return;

    addButton.onclick = function () {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>
                <select class="form-select w-auto " name="devicetype">
                    <option value="">Chọn loại thiết bị</option>
                </select>
            </td>
            <td>
                <select class="form-select "style="width: 150px;" name="devicename">
                    <option value="">Chọn thiết bị</option>
                </select>
            </td>
            <td><select class="form-select "  style="width: 170px"; name="namesuplier">
                          <option value="">Chọn tên</option>
            </select></td>
            <td><input type="number" class="form-control" name="pricedevice" min="0" step="1000" readonly></td>
            <td><input type="number" class="form-control"value="1" min="1" name="quantitydevice"></td>
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
    if (!selectElements.length) return;

    const options = deviceTypes.map(type => `<option value="${type.id}">${type.name}</option>`).join("");

    selectElements.forEach(select => {
        select.innerHTML = `<option value="">Chọn loại thiết bị</option>` + options;
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

    const filteredDevices = window.devices.filter(device => device.device_types_id == typeId);

    if (!filteredDevices.length) {
        deviceSelect.innerHTML = `<option value="">Không có thiết bị</option>`;
        return;
    }

    deviceSelect.innerHTML += filteredDevices.map(device =>
        `<option value="${device.id}" data-user-id="${device.user_id}" data-price="${device.hourly_rental_fee}">
            ${device.name}
        </option>`).join("");

    deviceSelect.onchange = function () {
        handleDeviceChange(row, deviceSelect);
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
    const userId = selectedDevice.dataset.userId;
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

// Chạy setup khi trang load
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(DeviceTypeAPI, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`Lỗi khi lấy device types: ${response.status}`);
            return response.json();
        })
        .then(deviceTypes => {
            fetch(DeviceAPI, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error(`Lỗi khi lấy devices: ${response.status}`);
                    return response.json();
                })
                .then(devices => {
                    window.deviceTypes = deviceTypes;
                    window.devices = devices;

                    setupDeviceTable(deviceTypes);
                    populateDeviceTypes(deviceTypes);
                })
                .catch(error => console.error("Lỗi khi lấy devices:", error));
        })
        .catch(error => console.error("Lỗi khi lấy device types:", error));

    fetch(UsersAPI, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`Lỗi khi lấy users: ${response.status}`);
            return response.json();
        })
        .then(users => {
            window.users = users; // Cập nhật danh sách user đúng
            console.log("Updated users:", users);
        })
        .catch(error => console.error("Lỗi khi lấy users:", error));

    // Gắn sự kiện tính tổng tiền cho dòng ban đầu
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
});
//___________________________________End DEVICE_______________________________________//

//___________________________________SERVICE_______________________________________//
function setupServiceTable(services) {
    const addButton = document.querySelector("#buttonAddService");
    const tbody = document.querySelector("#serviceTable tbody");

    if (!addButton || !tbody) return;

    function handleRowEvents(row) {
        const serviceSelect = row.querySelector('select[name="servicetype"]');
        const priceInput = row.querySelector('input[name="price"]');
        const quantityInput = row.querySelector('input[name="quantity"]');

        // Gán danh sách dịch vụ vào select
        populateService(services, row);

        // Xử lý chọn dịch vụ
        serviceSelect.addEventListener("change", function () {
            const selectedOption = this.options[this.selectedIndex];
            priceInput.value = selectedOption.dataset.price || "";
            updateServiceTotal(row);

            // Cập nhật nhà cung cấp
            const supplierSelect = row.querySelector('select[name="namesuplier"]');
            const userId = selectedOption.dataset.userId;
            const user = window.users.find(user => user.id === userId);

            supplierSelect.innerHTML = user
                ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
                : `<option value="">Không xác định</option>`;
        });

        // Gán sự kiện thay đổi số lượng
        quantityInput.addEventListener("input", () => {
            const quantity = parseInt(quantityInput.value);
            const serviceId = serviceSelect.value;
            const availableQuantity = getAvailableServiceQuantity(serviceId); // Lấy số lượng có sẵn

            if (quantity > availableQuantity) {
                alert(`Không đủ số lượng dịch vụ. Số lượng có sẵn: ${availableQuantity}`);
                quantityInput.value = availableQuantity; // Đặt lại số lượng
            } else {
                updateServiceTotal(row);
            }
        });
    }

    function addServiceRow() {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>
                <select class="form-select w-auto" name="servicetype">
                    <option value="">Chọn dịch vụ</option>
                </select>
            </td>
          <td><select class="form-select w-auto" name="namesuplier">
                            <option value="">Chọn tên</option>
            </select></td>
            <td><input type="number" class="form-control" name="price" min="0" step="1000" readonly></td>
            <td><input type="number" class="form-control" value="1" min="1" name="quantity"></td>
            <td><input type="text" class="form-control" readonly name="totalmoney"></td>
            <td class="text-center">
                <button class="btn btn-outline-danger remove-row">🗑</button>
            </td>
        `;

        tbody.appendChild(newRow);
        handleRowEvents(newRow);
    }

    // Xử lý sự kiện khi nhấn nút thêm
    addButton.onclick = addServiceRow;

    // Xóa dòng khi nhấn nút 🗑
    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-row")) {
            event.target.closest("tr").remove();
        }
    });

    // Xử lý dòng đầu tiên (nếu có)
    if (tbody.children.length > 0) {
        handleRowEvents(tbody.children[0]);
    }
}
// Hàm lấy số lượng dịch vụ có sẵn
function getAvailableServiceQuantity(serviceId) {
    const service = window.services.find(service => service.id === serviceId);
    return service ? service.quantity : 0; // Trả về số lượng có sẵn hoặc 0 nếu không tìm thấy
}


// Hàm gán danh sách dịch vụ cho select
function populateService(services, row = document) {
    const selectElements = row.querySelectorAll('select[name="servicetype"]');

    if (!selectElements.length) return;

    const options = services.map(service =>
        `<option value="${service.id}" data-price="${service.hourly_salary}" data-user-id="${service.user_id}">
            ${service.name}
        </option>`
    ).join("");

    selectElements.forEach(select => {
        select.innerHTML = `<option value="">Chọn dịch vụ</option>` + options;
    });
}


// Hàm tính tổng tiền
function updateServiceTotal(row) {
    let priceInput = row.querySelector('input[name="price"]');
    let quantityInput = row.querySelector('input[name="quantity"]');
    let totalInput = row.querySelector('input[name="totalmoney"]');

    let price = parseFloat(priceInput.value) || 0;
    let quantity = parseInt(quantityInput.value) || 0;
    let total = price * quantity;

    totalInput.value = total.toLocaleString("vi-VN") + " VND";
}
//___________________________________End SERVICE_______________________________________//

//___________________________________Timeline_______________________________________//
//Sự kiên thêm dòng tr khi nhấn button thêm timeline
function setupTimelineTable() {
    const addButton = document.querySelector("#buttonAddTime");
    const tbody = document.querySelector("#timeTable tbody");

    if (!addButton || !tbody) return;

    addButton.addEventListener("click", function () {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="datetime-local" class="form-control" name="timeline"></td>
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

//___________________________________End Timeline_______________________________________//
//_______xử lý rental, devicerental, servicerental, timeline_____________//
// Hàm xử lý khi nhấn nút "Lưu"

function createRentalWithEventId(eventId) {
    const totalPrice = calculateTotalPrice();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.user_id : null;

    if (!userId) {
        alert("Bạn cần đăng nhập để thực hiện hành động này!");
        return;
    }

    console.log("ID sự kiện đang sử dụng:", eventId);

    const rentalData = {
        custom_location: "Địa điểm tùy chỉnh",
        rental_start_time: new Date().toISOString(),
        rental_end_time: new Date(Date.now() + 86400000).toISOString(),
        total_price: totalPrice,
        event_id: eventId,
        user_id: userId,
        updated_at: new Date().toISOString()
    };

    createRental(rentalData, function (rentalResponse) {
        const newRentalId = rentalResponse.id;
        console.log("Rental ID vừa tạo:", newRentalId);

        // Kiểm tra xem có dữ liệu để tạo không
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
                window.location.href = "table-event.html";
            });
    }).catch(error => {
        console.error("Không thể tạo rental, dừng luồng thực thi:", error);
        showToast("Không thể tạo rental: " + error.message, "error");
    });
}
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

    // Tính tổng từ bảng thiết bị
    const deviceRows = document.querySelectorAll("#deviceTable tbody tr");
    deviceRows.forEach(row => {
        const totalMoneyInput = row.querySelector('input[name="totalmoneydevice"]');
        const totalMoney = parseFloat(totalMoneyInput.value.replace(/[^0-9.-]+/g, "")) || 0; // Chuyển đổi sang số
        total += totalMoney;
    });

    // Tính tổng từ bảng dịch vụ
    const serviceRows = document.querySelectorAll("#serviceTable tbody tr");
    serviceRows.forEach(row => {
        const totalMoneyInput = row.querySelector('input[name="totalmoney"]');
        const totalMoney = parseFloat(totalMoneyInput.value.replace(/[^0-9.-]+/g, "")) || 0; // Chuyển đổi sang số
        total += totalMoney;
    });

    return total;
}

// Hàm tạo rental
// 
function createRental(data, callback) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        throw new Error("Không tìm thấy token");
    }

    var options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    };
    console.log("Dữ liệu gửi đi để tạo rental:", data); // Log dữ liệu gửi đi
    fetch(RentalAPI, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi khi tạo rental: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Phản hồi từ API rental:", data); // Log phản hồi
            callback(data);
        })
        .catch(error => {
            console.error("Lỗi khi tạo rental:", error);
            throw error; // Ném lỗi để dừng luồng thực thi
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
                rental_id: rentalId,
                device_id: deviceId,
                quantity: quantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
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

// Sửa hàm createDeviceRental để trả về Promise
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
                throw new Error("Lỗi khi tạo device rental: " + response.statusText);
            }
            return response.json();
        });
}
//device
function handleServiceRentals(rentalId) {
    const serviceRows = document.querySelectorAll("#serviceTable tbody tr");
    const promises = [];

    serviceRows.forEach(row => {
        const serviceId = row.querySelector('select[name="servicetype"]').value;
        const quantity = row.querySelector('input[name="quantity"]').value;

        if (serviceId && quantity) {
            const serviceRentalData = {
                rental_id: rentalId,
                service_id: serviceId,
                quantity: quantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

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

// Sửa hàm createServiceRental để trả về Promise
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
                throw new Error("Lỗi khi tạo service rental: " + response.statusText);
            }
            return response.json();
        });
}

//timline
function handleTimelines(rentalId) {
    const timelineRows = document.querySelectorAll("#timeTable tbody tr");
    const promises = [];

    timelineRows.forEach(row => {
        const timeline = row.querySelector('input[name="timeline"]').value;
        const description = row.querySelector('textarea[name="descriptiontime"]').value;

        if (timeline && description) {
            const timelineData = {
                rental_id: rentalId,
                time_start: timeline,
                description: description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            promises.push(
                createTimeline(timelineData)
                    .then(() => console.log(`Timeline với time_start ${timeline} tạo thành công`))
                    .catch(error => console.error(`Lỗi khi tạo timeline với time_start ${timeline}:`, error))
            );
        } else {
            console.warn("Dữ liệu không hợp lệ:", { timeline, description });
        }
    });

    return Promise.all(promises);
}

// Sửa hàm createTimeline để trả về Promise
function createTimeline(data) {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        throw new Error("Không tìm thấy token");
    }

    return fetch(Timeline, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Lỗi khi tạo timeline: " + response.statusText);
            }
            return response.json();
        });
}