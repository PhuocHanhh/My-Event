const API_BASE = 'http://localhost:8080/event-management';
const DeviceAPI = `${API_BASE}/devices`;
const DeviceTypeAPI = `${API_BASE}/deviceType`;
const UsersAPI = `${API_BASE}/users`;
const UserAPI_MRG = `${API_BASE}/users/manager`;

function start() {
    getData((devices, deviceTypes, users) => {
        renderDevices(devices, deviceTypes, users)

    });
    var editDevicetId = localStorage.getItem("editDevicetId");
    if (editDevicetId && window.location.pathname.includes("detail_device.html")) {
        watchDetailDevice(editDevicetId);
    }
}
start();
// function getData(callback) {
//     let token = localStorage.getItem("token"); // Lấy token từ localStorage

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }

//     Promise.all([
//         fetch(`${DeviceAPI}/list`).then(res => res.json()),

//         fetch(`${DeviceTypeAPI}/list`).then(res => res.json()),

//         fetch(UsersAPI, {
//             // method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),
//         fetch(UserAPI_MRG, {
//             // method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),
//     ])
//         .then(([devices, deviceTypes, users, usermrg]) => {
//             devices = devices.data.items;
//             deviceTypes = deviceTypes.data.items;
//             users = Array.isArray(users) ? users : users.data || [];//bỏ cái này dô het lỗi manager
//             usermrg = Array.isArray(usermrg) ? usermrg : usermrg.data || [];//bỏ cái này dô het lỗi manage
//             callback(devices, deviceTypes, users, usermrg);
//         })
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }

// //render table data


// function renderDevices(devices, deviceTypes, users) {
//     var listDevicesBlock = document.querySelector('#list-device tbody');
//     if (!listDevicesBlock) return;

//     console.log("Devices:", devices);
//     console.log("Device Types:", deviceTypes);
//     console.log("Users:", users);

//     if (!devices || devices.length === 0) {
//         console.warn("Danh sách devices rỗng!");
//         return;
//     }

//     // Hủy DataTables nếu đã khởi tạo
//     if ($.fn.DataTable.isDataTable('#list-device')) {
//         $('#list-device').DataTable().destroy();
//     }

//     var htmls = devices.map(function (device) {
//         // Lấy nhà cung cấp
//         var supplier = users.find(user => String(user.id) === String(device.userID));
//         var supplierName = supplier ? `${supplier.last_name} ${supplier.first_name} ` : "Không có nhà cung cấp";

//         return `
//             <tr class="list-device-${device.id}">
//                 <td>${device.name || "Không có tên"}</td>
//                 <td>${device.deviceType_name}</td>
//                 <td>${device.description || "Không có mô tả"}</td>
//                 <td>${device.quantity || 0}</td>
//                 <td>${device.hourlyRentalFee ? device.hourlyRentalFee.toLocaleString() + " VND" : "Không xác định"}</td>
//                 <td>${device.created_at ? new Date(device.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
//                 <td>${device.place || "ko có địa điểm"}</td>
//                 <td>${supplierName}</td>
//                 <td class="text-center">
//                     <div class="action-dropdown">
//                         <button class="btn btn-light action-btn">...</button>
//                         <div class="dropdown-content">
//                             <button class="dropdown-item delete-btn" data-id="${device.id}">Xoá</button>
//                             <button class="dropdown-item detail-btn" data-id="${device.id}">Xem chi tiết</button>
//                         </div>
//                     </div>
//                 </td>
//             </tr>
//         `;
//     });

//     listDevicesBlock.innerHTML = htmls.join('');

//     if (!listDevicesBlock.innerHTML.trim()) {
//         console.warn("Không có dữ liệu để hiển thị.");
//         return;
//     }

//     // Khởi tạo lại DataTables
//     var table = $('#list-device').DataTable({
//         "order": [[5, "desc"]],
//         "language": {
//             "search": "Tìm kiếm:",
//             "lengthMenu": "Hiển thị _MENU_ thiết bị",
//             "info": "Hiển thị _START_ đến _END_ của _TOTAL_ thiết bị",
//             "infoEmpty": "Không có dữ liệu",
//             "zeroRecords": "Không tìm thấy kết quả",
//             "paginate": {
//                 "first": "Đầu",
//                 "last": "Cuối",
//                 "next": "Tiếp",
//                 "previous": "Trước"
//             }
//         }
//     });

//     // 🛠 Gán sự kiện dùng delegate để dropdown hoạt động đúng trên mọi trang
//     $('#list-device tbody').off('click').on('click', '.action-btn', function (event) {
//         let dropdown = $(this).next('.dropdown-content');
//         $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
//         dropdown.toggle();
//         event.stopPropagation();
//     });

//     // Xử lý sự kiện xoá thiết bị
//     $('#list-device tbody').on('click', '.delete-btn', function () {
//         let deviceId = $(this).data('id');
//         handleDeleteDevice(deviceId);
//     });
//     // Xử lý thiết bị xem chi tiết
//     $('#list-device tbody').on('click', '.detail-btn', function () {
//         let eventId = $(this).data('id');
//         handleDetailDevice(eventId);
//     });
//     // Đóng dropdown khi bấm ra ngoài
//     $(document).off('click').on('click', function () {
//         $('.dropdown-content').hide();
//     });
// }


//Tạo Xoá thiết bị
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return;
    }

    // Lấy roleName từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const roleName = user?.roleName?.toUpperCase() || "USER";

    // Chọn API dựa trên roleName
    const userApiToFetch = roleName === "MANAGER" ? UserAPI_MRG : UsersAPI;

    Promise.all([
        // Không gửi token cho DeviceAPI, giữ nguyên như gốc
        fetch(`${DeviceAPI}/list`).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi DeviceAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),

        // Không gửi token cho DeviceTypeAPI, giữ nguyên như gốc
        fetch(`${DeviceTypeAPI}/list`).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi DeviceTypeAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),

        fetch(userApiToFetch, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi User API (${userApiToFetch}): ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),
    ])
        .then(([devices, deviceTypes, users]) => {
            devices = devices.data?.items || [];
            deviceTypes = deviceTypes.data?.items || [];
            users = Array.isArray(users) ? users : users.data || [];

            callback(devices, deviceTypes, users);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy dữ liệu: " + error.message);
        });
}

function renderDevices(devices, deviceTypes, users) {
    var listDevicesBlock = document.querySelector('#list-device tbody');
    if (!listDevicesBlock) return;

    if (!devices || devices.length === 0) {
        console.warn("Danh sách devices rỗng!");
        return;
    }

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-device')) {
        $('#list-device').DataTable().destroy();
    }

    var htmls = devices.map(function (device) {
        // Tìm supplier trực tiếp từ users (không cần kiểm tra roleName)
        const supplier = users.find(user => String(user.id) === String(device.userID));
        const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không có nhà cung cấp";


        return `
            <tr class="list-device-${device.id}">
                <td>${device.name || "Không có tên"}</td>
                <td>${device.deviceType_name || "Không xác định"}</td>
                <td>${device.description || "Không có mô tả"}</td>
                <td>${device.quantity || 0}</td>
                <td>${device.hourlyRentalFee ? device.hourlyRentalFee.toLocaleString() + " VND" : "Không xác định"}</td>
                <td>${device.created_at ? new Date(device.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
                <td>${device.place || "ko có địa điểm"}</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${device.id}">Xoá</button>
                            <button class="dropdown-item detail-btn" data-id="${device.id}">Xem chi tiết</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listDevicesBlock.innerHTML = htmls.join('');

    if (!listDevicesBlock.innerHTML.trim()) {
        console.warn("Không có dữ liệu để hiển thị.");
        return;
    }

    // Khởi tạo lại DataTables
    var table = $('#list-device').DataTable({
        "order": [[5, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ thiết bị",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ thiết bị",
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

    // Gán sự kiện cho dropdown
    $('#list-device tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-device tbody').on('click', '.delete-btn', function () {
        let deviceId = $(this).data('id');
        handleDeleteDevice(deviceId);
    });

    $('#list-device tbody').on('click', '.detail-btn', function () {
        let deviceId = $(this).data('id');
        handleDetailDevice(deviceId);
    });

    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}
function handleDeleteDevice(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`, // Thêm token vào header
            "Content-Type": "application/json",
        },

    };
    fetch(`${DeviceAPI}/${id}`, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listDevice = document.querySelector(`.list-device-${id}`)
            if (listDevice) {
                listDevice.remove();
            }
            alert("Xoá thiết bị thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}
// function handleDeleteDevice(id) {
//     console.log("Xoá sự kiện ID:", id);
//     let token = localStorage.getItem("token"); // Lấy token từ localStorage

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         alert("Vui lòng đăng nhập lại!");
//         return;
//     }

//     var options = {
//         method: 'DELETE',
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json"
//         }
//     };

//     fetch(`${DeviceAPI}/${id}`, options)
//         // .then(response => {
//         //     if (!response.ok) {
//         //         return response.text().then(text => {
//         //             throw new Error(`Lỗi khi xoá thiết bị: ${response.status} - ${text}`);
//         //         });
//         //     }
//         //     // Nếu API trả về 204 No Content, không cần parse JSON
//         //     return response.status === 204 ? {} : response.json();
//         // })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`Lỗi khi xoá dịch vụ: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(() => {
//             var listDevice = document.querySelector(`.list-device-${id}`);
//             if (listDevice) {
//                 listDevice.remove();
//             }
//             alert("Xoá thiết bị thành công!");
//         })
//         .catch(error => {
//             console.error("Lỗi khi xoá thiết bị:", error);
//             alert("Xoá không thành công: " + error.message);
//         });
// }
//Xem thiết bị
// Xem chi tiết thiết bị

function handleDetailDevice(id) {
    localStorage.setItem("editDeviceId", id); // Lưu ID vào localStorage
    window.location.href = "detail_device.html"; // Chuyển đến trang chi tiết
}

function watchDetailDevice(editDevicetId) {
    console.log("ID thiết bị:", editDevicetId);
    if (!editDevicetId) {
        console.warn("Không có ID thiết bị để hiển thị!");
        return;
    }

    const imagePreview = document.getElementById("Image");
    const defaultImagePath = "assets/img/card.jpg";

    // Lấy token từ localStorage
    let token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return;
    }

    // Lấy roleName từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const roleName = user?.roleName?.toUpperCase() || "USER";

    // Chọn API dựa trên roleName
    const userApiToFetch = roleName === "MANAGER" ? UserAPI_MRG : UsersAPI;
    console.log("User API được gọi:", userApiToFetch);

    // Lấy danh sách loại thiết bị, người dùng và thông tin thiết bị
    Promise.all([
        // Không gửi token cho DeviceTypeAPI, giống như trong getData
        fetch(`${DeviceTypeAPI}/list`).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi DeviceTypeAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),

        fetch(userApiToFetch, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi User API (${userApiToFetch}): ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),

        fetch(`${DeviceAPI}/${editDevicetId}`, {
            headers: {
                //"Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi DeviceAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),
    ])
        .then(([deviceTypes, users, device]) => {
            // Kiểm tra và xử lý dữ liệu
            deviceTypes = deviceTypes.data?.items || [];
            users = Array.isArray(users) ? users : users.data || [];
            device = device.data || {};

            console.log("Device Types:", deviceTypes);
            console.log("Users:", users);
            console.log("Device:", device);

            // Tìm nhà cung cấp trực tiếp từ users (không cần kiểm tra roleName)
            const supplier = users.find(user => String(user.id) === String(device.userID));
            const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không có nhà cung cấp";
            console.log("Supplier:", supplierName);

            // Cập nhật giao diện
            document.getElementById("name").textContent = device.name || "Không có tên";
            document.getElementById("devicetype").textContent = device.deviceType_name || "Không xác định";
            document.getElementById("description").textContent = device.description || "Không có mô tả";
            document.getElementById("quantity").textContent = device.quantity || 0;
            document.getElementById("price").textContent = device.hourlyRentalFee ? `${device.hourlyRentalFee.toLocaleString()} VND` : "Không xác định";
            document.getElementById("place").textContent = device.place || "Không có địa điểm";
            document.getElementById("supplier").textContent = supplierName;

            // Xử lý ảnh
            if (device.image && imagePreview) {
                const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                const fileName = device.image.split('/').pop();
                const imageUrl = `${baseApiUrl}${fileName}`;
                imagePreview.src = imageUrl;
                imagePreview.onerror = () => {
                    console.error("Lỗi tải ảnh:", imageUrl);
                    imagePreview.src = defaultImagePath;
                };
            } else if (imagePreview) {
                imagePreview.src = defaultImagePath;
            }
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu thiết bị:", error);
            alert("Không thể tải thông tin thiết bị: " + error.message);
        });
}