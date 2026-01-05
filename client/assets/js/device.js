const API_BASE = 'http://localhost:8080/event-management';
const DeviceAPI = `${API_BASE}/devices`;
const DeviceTypeAPI = `${API_BASE}/deviceType`;
const ProvinceAPI = 'https://provinces.open-api.vn/api/p';

const token = localStorage.getItem("token");
let user;
try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (e) {
    console.error("Dữ liệu user không hợp lệ:", e);
    user = null;
}
function start() {
    getData((devices, deviceTypes, provinces) => {
        renderDevices(devices, deviceTypes);
        if (document.querySelector("#selectDeviceTypes")) {
            populateDeviceTypes(deviceTypes);
        }
        if (document.querySelector("#inputLocation")) {
            populateCities(provinces);
        }
    });
    handleCreateForm();
    if (document.querySelector("#saveDeviceType")) {
        handleCreateDeviceType();
    }
    handleAddDeviceType(); // Thêm xử lý cho nút "+"
}
start();
function getData(callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
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
        // Lấy danh sách tỉnh/thành phố
        fetch(ProvinceAPI).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi ProvinceAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),
    ])
        .then(([devices, deviceTypes, provinces]) => {
            devices = devices.data?.items || [];
            deviceTypes = deviceTypes.data?.items || [];
            provinces = provinces || [];
            window.provinces = provinces; // Lưu provinces vào biến toàn cục để sử dụng sau này
            console.log("Dữ liệu Devices:", devices);
            console.log("Dữ liệu DeviceTypes:", deviceTypes);
            console.log("Dữ liệu Provinces:", provinces);
            callback(devices, deviceTypes, provinces);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

function renderDevices(devices, deviceTypes) {
    const listDevicesBlock = document.querySelector('#list-device tbody');
    if (!listDevicesBlock) return;

    const userDevices = devices.filter(device => String(device.userID) === String(user.id));
    if (userDevices.length === 0) {
        console.warn("Không có thiết bị nào thuộc về user hiện tại!");
        listDevicesBlock.innerHTML = '<tr><td colspan="8">Bạn chưa sở hữu thiết bị nào</td></tr>';
        return;
    }

    if ($.fn.DataTable.isDataTable('#list-device')) {
        $('#list-device').DataTable().destroy();
    }

    const htmls = userDevices.map(function (device) {
        // var deviceType = deviceTypes.find(dt => String(dt.id) === String(device.device_types_id));
        // var deviceTypeName = deviceType ? deviceType.name : "Không xác định";

        return `
            <tr class="list-device-${device.id}">
                <td>${device.name || "Không có tên"}</td>
                <td>${device.deviceType_name || "Không xác định"}</td>
                <td>${device.description || "Không có mô tả"}</td>
                <td>${device.quantity || 0}</td>
                <td>${device.hourlyRentalFee ? device.hourlyRentalFee.toLocaleString() + " VND" : "Không xác định"}</td>
                <td>${device.created_at ? new Date(device.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
                <td>${device.place || "Không xác định"}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item update-btn" data-id="${device.id}">Cập nhật</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listDevicesBlock.innerHTML = htmls.join('');

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

    $('#list-device tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-device tbody').on('click', '.update-btn', function () {
        let deviceId = $(this).data('id');
        handleUpdateDevice(deviceId);
    });

    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}
//Sự kiện thêm loại thiết bị
function createDeviceType(data, callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
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
    fetch(`${DeviceTypeAPI}/`, options)
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(error => console.error("Lỗi khi tạo device type:", error));
}

function populateDeviceTypes(deviceTypes) {
    var select = document.querySelector('#selectDeviceTypes');
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;

    var deviceList = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
    deviceList.forEach(type => {
        var option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        select.appendChild(option);
    });
}
function populateCities(provinces) {
    const citySelect = document.querySelector('select[name="location"]');
    const currentValue = citySelect.value; // Lưu giá trị hiện tại của dropdown

    // Xóa các tùy chọn cũ
    citySelect.innerHTML = '<option value="">Chọn tỉnh thành</option>';

    // Thêm các tùy chọn mới
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province.name; // Giả sử province có code
        option.text = province.name;
        citySelect.appendChild(option);
    });

    // Khôi phục giá trị đã chọn nếu có
    if (currentValue) {
        citySelect.value = currentValue;
    }
}

function handleCreateDeviceType() {
    var createBtn = document.querySelector("#saveDeviceType");

    if (!createBtn) {
        console.warn("Cảnh báo: #saveDeviceType không tồn tại trong DOM.");
        return;
    }

    createBtn.onclick = function () {
        var deviceTypeName = document.querySelector("#newDeviceTypeInput").value;

        if (!deviceTypeName.trim()) {
            alert("Vui lòng nhập loại thiết bị!");
            return;
        }

        var Data = {
            name: deviceTypeName
        };

        createDeviceType(Data, function (newDeviceType) {
            getData((devices, deviceTypes) => {
                populateDeviceTypes(deviceTypes);
            });

            var modalElement = document.getElementById("deviceTypeModal");
            if (modalElement) {
                var modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
            }
        });
    };
}

function handleAddDeviceType() {
    document.addEventListener("DOMContentLoaded", function () {
        var modalElement = document.getElementById("deviceTypeModal");
        var modal = new bootstrap.Modal(modalElement);

        document.querySelector("#addDeviceType").addEventListener("click", function () {
            modal.show();
        });

        document.querySelector("#saveDeviceType").addEventListener("click", function () {
            var newDeviceType = document.querySelector("#newDeviceTypeInput").value;
            if (newDeviceType) {
                var select = document.querySelector('select[name="devicetype"]');
                var option = document.createElement("option");
                option.value = newDeviceType.toLowerCase().replace(/\s+/g, "-");
                option.textContent = newDeviceType;
                select.appendChild(option);
                select.value = option.value;

                modal.hide();
            }
        });

        modalElement.addEventListener("hidden.bs.modal", function () {
            document.getElementById("newDeviceTypeInput").value = "";
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            document.body.classList.remove("modal-open");
            document.body.style.overflow = "";
        });
    });
}
// // Thêm thiết bị
function handleCreateForm() {
    var createBtn = document.querySelector('#create');
    if (!createBtn) return;

    var editDeviceId = localStorage.getItem("editDeviceId");

    if (editDeviceId) {
        loadEditForm(editDeviceId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        var pictureInput = document.querySelector('input[name="picture"]');
        var name = document.querySelector('input[name="name"]').value;
        var description = document.querySelector('input[name="description"]').value;
        var deviceTypeID = document.querySelector('select[name="devicetype"]').value;
        var price = document.querySelector('input[name="price"]').value;
        var quantity = document.querySelector('input[name="quantity"]').value;
        var location = document.querySelector('select[name="location"]').value;

        // Validation
        if (!name || !deviceTypeID || !price || !quantity) {
            alert("Vui lòng nhập đầy đủ tên thiết bị, loại thiết bị, đơn giá và số lượng!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho thiết bị!");
            return;
        }

        // Lấy thông tin người dùng từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.id : null;

        if (!userId) {
            alert("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!");
            return;
        }
        const selectedProvince = window.provinces.find(province => province.code === location);
        const locationName = selectedProvince ? selectedProvince.name : location;
        // Create object containing device info
        const deviceData = {
            name: name,
            description: description,
            deviceType_id: deviceTypeID, // Đổi tên để khớp với schema backend
            hourlyRentalFee: parseFloat(price), // Đổi tên để khớp với schema backend
            quantity: parseInt(quantity),
            place: locationName, // Đổi tên để khớp với schema backend
            userID: userId, // Thêm trường user_id
        };

        // Create FormData
        const formData = new FormData();

        // Append file with key 'file'
        formData.append('file', pictureInput.files[0]);

        // Append device data as JSON string with key 'device'
        formData.append('device', new Blob([JSON.stringify(deviceData)], {
            type: 'application/json'
        }));

        createDevice(formData, function (deviceResponse) {
            console.log("Device vừa tạo có ID:", deviceResponse.id);
            console.log("Đã tạo thiết bị thành công:", deviceResponse);
            alert("Tạo thiết bị thành công!");
            window.location.href = "device_table.html"; // Chuyển hướng sau khi tạo thành công
        });
    };
}

function createDevice(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");

    fetch(`${DeviceAPI}/new`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi server");
            return response.json();
        })
        .then(data => {
            data = data.data || data; // Lấy dữ liệu thiết bị từ phản hồi
            console.log('Dữ liệu thiết bị:', data);
            callback(data.result || data);
        })
        .catch(error => alert(`Lỗi tạo thiết bị: ${error.message}`));
}

//Cập nhật thiết bị
function handleUpdateDevice(deviceId) {
    localStorage.setItem("editDeviceId", deviceId); // Lưu ID vào localStorage
    window.location.href = "device_manage.html"; // Chuyển đến trang form
}

// Tải form chỉnh sửa thiết bị
function loadEditForm(editDeviceId) {
    if (!editDeviceId) return;

    console.log("Chỉnh sửa thiết bị ID:", editDeviceId);
    const inputPicture = document.querySelector('input[name="picture"]');
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/device/densk.png";

    // Lấy token từ localStorage
    let token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    // Lấy danh sách loại thiết bị
    fetch(`${DeviceTypeAPI}/list`, {
        method: 'GET',
        headers: {
            // 'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(deviceTypes => {
            deviceTypes = deviceTypes.data?.items || []; // Lấy danh sách loại thiết bị
            const selectDeviceType = document.querySelector('select[name="devicetype"]');
            selectDeviceType.innerHTML = '<option value="">Chọn loại thiết bị</option>';

            if (Array.isArray(deviceTypes)) {
                deviceTypes.forEach(type => {
                    const option = document.createElement("option");
                    option.value = type.name;
                    option.textContent = type.name;
                    selectDeviceType.appendChild(option);
                });
            }

            // Lấy thông tin thiết bị
            return fetch(`${DeviceAPI}/${editDeviceId}`, {
                method: 'GET',
                headers: {
                    // 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json());
        })
        .then(device => {
            device = device.data; // Lấy dữ liệu thiết bị từ phản hồi
            console.log('Dữ liệu thiết bị:', device);

            // Điền dữ liệu vào form
            document.querySelector('input[name="name"]').value = device.name || "";
            document.querySelector('input[name="description"]').value = device.description || "";
            document.querySelector('select[name="devicetype"]').value = device.deviceType_name || "";
            document.querySelector('input[name="price"]').value = device.hourlyRentalFee || "";
            document.querySelector('input[name="quantity"]').value = device.quantity || 1;
            document.querySelector('select[name="location"]').value = device.place || "";

            // Xử lý hiển thị ảnh
            if (device.image) {
                console.log('Giá trị device.image:', device.image);
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = device.image.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    console.log('URL ảnh:', imageUrl);

                    const newImg = document.createElement('img');
                    newImg.id = 'image';
                    newImg.style.maxWidth = '500px';
                    newImg.style.height = '400px';
                    newImg.alt = 'Xem trước thiết bị';

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

            // Đổi nút "Lưu" thành "Cập nhật"
            document.querySelector("#create").textContent = "Cập nhật";
            document.querySelector("#create").onclick = function (event) {
                event.preventDefault();

                const inputPicture = document.querySelector('input[name="picture"]');
                const inputName = document.querySelector('input[name="name"]').value;
                const inputDescription = document.querySelector('input[name="description"]').value;
                const inputDeviceType = document.querySelector('select[name="devicetype"]').value;
                const inputPrice = document.querySelector('input[name="price"]').value;
                const inputQuantity = document.querySelector('input[name="quantity"]').value;
                const inputLocation = document.querySelector('select[name="location"]').value;

                // Kiểm tra dữ liệu bắt buộc
                if (!inputName || !inputDeviceType) {
                    alert("Vui lòng nhập đầy đủ tên thiết bị và loại thiết bị!");
                    return;
                }

                const updatedDevice = {
                    image: inputPicture.files[0] ? inputPicture.files[0].name : "",
                    name: inputName,
                    description: inputDescription,
                    deviceType_name: inputDeviceType,
                    hourlyRentalFee: parseFloat(inputPrice) || 0,
                    quantity: parseInt(inputQuantity) || 1,
                    place: inputLocation
                };

                // Tạo FormData
                const formData = new FormData();
                formData.append('file', inputPicture.files[0]);
                formData.append('type', 'device'); // Thêm type
                // Thêm file nếu có
                if (inputPicture.files[0]) {
                    formData.append('file', inputPicture.files[0]);
                }
                // Thêm device data dưới dạng JSON string với key là 'device'
                formData.append('device', new Blob([JSON.stringify(updatedDevice)], {
                    type: 'application/json'
                }));

                // Gửi yêu cầu cập nhật
                if (!token) {
                    alert("Vui lòng đăng nhập lại!");
                    return;
                }

                console.log("Cập nhật thiết bị:", `${editDeviceId}`);

                fetch(`${DeviceAPI}/${editDeviceId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // 'Content-Type': 'application/json'
                    },
                    body: formData
                    // body: JSON.stringify(updatedDevice)
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => {
                                throw new Error(`Lỗi server: ${text}`);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        const deviceResponse = data.result || data;
                        console.log("Thiết bị vừa cập nhật có ID:", deviceResponse.id);
                        console.log("Đã cập nhật thiết bị thành công:", deviceResponse);
                        alert("Cập nhật thiết bị thành công!");
                        window.location.href = "device_table.html";
                    })
                    .catch(error => {
                        console.error('Lỗi cập nhật thiết bị:', error);
                        alert(`Lỗi cập nhật thiết bị: ${error.message}`);
                    });
            };
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
        });
}
// function setupEventListeners() {
//     const selectCity = document.getElementById("selectCity");

//     if (!selectCity) return;

//     selectCity.addEventListener("change", function () {
//         const provinceId = this.value;
//         if (provinceId) {
//             fetch(`${DistrictAPI}${provinceId}?depth=2`)
//                 .then(res => res.json())
//                 .then(data => {
//                     const districts = data.districts || [];
//                     populateDistricts(districts);
//                 })
//                 .catch(error => {
//                     console.error("Lỗi lấy quận/huyện:", error);
//                     populateDistricts([]);
//                 });
//         } else {
//             populateDistricts([]);
//         }
//     });
// }