var ServiceAPI = 'http://localhost:8080/event-management/services'; // Có thể thêm ?user_id=${user.id} nếu API hỗ trợ
var ProvinceAPI = 'https://provinces.open-api.vn/api/p';
// Lấy thông tin user từ localStorage
const token = localStorage.getItem("token");
let user;
try {
    user = JSON.parse(localStorage.getItem("user"));
    console.log("Dữ liệu user từ localStorage:", user);
} catch (e) {
    console.error("Dữ liệu user không hợp lệ:", e);
    user = null;
}

function start() {
    getData((services, provinces) => {
        renderServices(services);
        if (document.querySelector("#inputLocation")) {
            populateCities(provinces);
        }
    });
    handleCreateForm();
}
start();
function getData(callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(`${ServiceAPI}/list`).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi DeviceAPI: ${res.status} - ${text}`);
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
        .then(([services, provinces]) => {
            services = services.data?.items || [];
            provinces = provinces || [];
            window.provinces = provinces;
            console.log("Dữ liệu Provinces:", provinces);
            callback(services, provinces);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

function renderServices(services) {
    var listServicesBlock = document.querySelector('#list-service tbody');
    if (!listServicesBlock) return;

    // Lọc dịch vụ của user hiện tại
    const userServices = services.filter(service => String(service.userID) === String(user.id));
    if (userServices.length === 0) {
        console.warn("Không có dịch vụ nào thuộc về user hiện tại!");
        listServicesBlock.innerHTML = '<tr><td colspan="7">Bạn chưa sở hữu dịch vụ nào</td></tr>';
        return;
    }

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-service')) {
        $('#list-service').DataTable().destroy();
    }

    var htmls = userServices.map(function (service) {
        return `
            <tr class="list-service-${service.id}">
                <td>${service.name || "Không có tên"}</td>
                <td style="width: 40%;">${service.description || 'Không có mô tả'}</td>
                <td>${service.quantity || 0}</td>
                <td>${service.hourly_salary ? service.hourly_salary.toLocaleString() + " VND" : '0 VND'}</td>
                <td>${service.created_at ? new Date(service.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
                <td>${service.place || "Không xác định"}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item update-btn" data-id="${service.id}">Cập nhật</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listServicesBlock.innerHTML = htmls.join('');

    // Khởi tạo lại DataTables
    var table = $('#list-service').DataTable({
        "order": [[4, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ dịch vụ",
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

    // Gán sự kiện dùng delegate để hoạt động trên tất cả các trang
    $('#list-service tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-service tbody').off('click', '.update-btn').on('click', '.update-btn', function () {
        let serviceId = $(this).data('id');
        handleUpdateService(serviceId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}
// Thêm dịch vụ
function handleCreateForm() {
    var createBtn = document.querySelector('#create');
    if (!createBtn) return;

    var editServiceId = localStorage.getItem("editServiceId");

    if (editServiceId) {
        loadEditForm(editServiceId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        var pictureInput = document.querySelector('input[name="picture"]');
        var name = document.querySelector('input[name="name"]').value;
        var description = document.querySelector('input[name="description"]').value;
        var price = document.querySelector('input[name="price"]').value;
        var quantity = document.querySelector('input[name="quantity"]').value;
        var location = document.querySelector('select[name="location"]').value;

        // Validation
        if (!name || !price || !quantity) {
            alert("Vui lòng nhập đầy đủ tên dịch vụ, tiền công và số lượng!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho dịch vụ!");
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
        // Create object containing service info
        const serviceData = {
            name: name,
            description: description,
            hourly_salary: parseFloat(price) || 0, // Đổi tên để khớp với schema backend
            quantity: parseInt(quantity) || 1, // Đảm bảo số nguyên
            place: locationName,
            userID: userId,
        };

        // Create FormData
        const formData = new FormData();

        // Append file with key 'file'
        formData.append('file', pictureInput.files[0]);

        // Append service data as JSON string with key 'service'
        formData.append('service', new Blob([JSON.stringify(serviceData)], {
            type: 'application/json'
        }));

        createService(formData, function (serviceResponse) {
            console.log("Service vừa tạo có ID:", serviceResponse.id);
            console.log("Đã tạo dịch vụ thành công:", serviceResponse);
            alert("Tạo dịch vụ thành công!");
            window.location.href = "service_table.html"; // Chuyển hướng sau khi tạo thành công
        });
    };
}

function createService(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");

    fetch(`${ServiceAPI}/new`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi server");
            return response.json();
        })
        .then(data => {
            callback(data.result || data);
        })
        .catch(error => alert(`Lỗi tạo dịch vụ: ${error.message}`));
}
//Them dung json
// function handleCreateForm() {
//     const createBtn = document.querySelector('#create');
//     if (!createBtn) return;

//     const editServiceId = localStorage.getItem("editServiceId");

//     if (editServiceId) {
//         loadEditForm(editServiceId); // Gọi hàm cập nhật nếu đang chỉnh sửa
//         return;
//     }

//     createBtn.onclick = function (event) {
//         event.preventDefault();

//         const pictureInput = document.querySelector('input[name="picture"]');
//         const name = document.querySelector('input[name="name"]').value;
//         const description = document.querySelector('input[name="description"]').value;
//         const price = document.querySelector('input[name="price"]').value;
//         const quantity = document.querySelector('input[name="quantity"]').value;
//         const location = document.querySelector('input[name="location"]').value;

//         // Validation (giống Device, nhưng bỏ deviceTypeID)
//         if (!name || !price || !quantity) {
//             alert("Vui lòng nhập đầy đủ tên dịch vụ, tiền công và số lượng!");
//             return;
//         }

//         if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
//             alert("Vui lòng chọn ảnh cho dịch vụ!");
//             return;
//         }

//         // Lấy thông tin người dùng từ localStorage
//         const user = JSON.parse(localStorage.getItem("user"));
//         const userId = user ? user.id : null;

//         if (!userId) {
//             alert("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!");
//             return;
//         }

//         // Create object containing service info (giống Device, với img là tên file)
//         const serviceData = {
//             img: pictureInput.files[0].name, // Lưu tên file ảnh, giống Device
//             name: name,
//             description: description,
//             hourly_salary: parseFloat(price) || 0, // Đổi tên để khớp với schema backend
//             quantity: parseInt(quantity) || 1, // Đảm bảo số nguyên
//             place: location,
//             userID: userId,

//         };

//         createService(serviceData, function (serviceResponse) {
//             console.log("Service vừa tạo có ID:", serviceResponse.id);
//             console.log("Đã tạo dịch vụ thành công:", serviceResponse);
//             alert("Tạo dịch vụ thành công!");
//             window.location.href = "service_table.html"; // Chuyển hướng
//         });
//     };
// }

// function createService(serviceData, callback) {
//     const token = localStorage.getItem("token");
//     if (!token) return alert("Vui lòng đăng nhập lại!");

//     fetch(`${ServiceAPI}/new`, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json' // Gửi dữ liệu JSON, giống Device
//         },
//         body: JSON.stringify(serviceData) // Chuyển serviceData thành JSON
//     })
//         .then(response => {
//             if (!response.ok) throw new Error("Lỗi server");
//             return response.json();
//         })
//         .then(data => {
//             callback(data.result || data);
//         })
//         .catch(error => alert(`Lỗi tạo dịch vụ: ${error.message}`));
// }
function handleUpdateService(serviceId) {
    localStorage.setItem("editServiceId", serviceId); // Lưu ID vào localStorage
    window.location.href = "service_manage.html"; // Chuyển đến trang form
}

function loadEditForm(editServiceId) {
    if (!editServiceId) return;

    console.log("Chỉnh sửa dịch vụ ID:", editServiceId);
    const inputPicture = document.querySelector('input[name="picture"]');
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/services/casi.png";

    // Lấy token từ localStorage
    let token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    // Lấy thông tin dịch vụ
    fetch(`${ServiceAPI}/${editServiceId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(service => {
            service = service.data;
            // Điền dữ liệu vào form
            document.querySelector('input[name="name"]').value = service.name || "";
            document.querySelector('input[name="description"]').value = service.description || "";
            document.querySelector('input[name="price"]').value = service.hourly_salary || "";
            document.querySelector('input[name="quantity"]').value = service.quantity || 1;
            document.querySelector('select[name="location"]').value = service.place || "";

            // Xử lý hiển thị ảnh
            if (service.image) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = service.image.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    console.log('URL ảnh:', imageUrl);

                    const newImg = document.createElement('img');
                    newImg.id = 'image';
                    newImg.style.maxWidth = '500px';
                    newImg.style.height = '400px';
                    newImg.alt = 'Xem trước dịch vụ';

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
                const inputPrice = document.querySelector('input[name="price"]').value;
                const inputQuantity = document.querySelector('input[name="quantity"]').value;
                const inputLocation = document.querySelector('select[name="location"]').value;

                // Kiểm tra dữ liệu bắt buộc
                if (!inputName) {
                    alert("Vui lòng nhập đầy đủ tên dịch vụ!");
                    return;
                }

                const updatedService = {
                    image: inputPicture.files[0] ? inputPicture.files[0].name : "",
                    name: inputName,
                    description: inputDescription,
                    hourly_salary: parseFloat(inputPrice) || 0,
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
                // Thêm service data dưới dạng JSON string với key là 'service'
                formData.append('service', new Blob([JSON.stringify(updatedService)], {
                    type: 'application/json'
                }));

                // Gửi yêu cầu cập nhật
                if (!token) {
                    alert("Vui lòng đăng nhập lại!");
                    return;
                }

                fetch(`${ServiceAPI}/${editServiceId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        //'Content-Type': 'application/json'
                    },
                    //body: JSON.stringify(updatedService)
                    body: formData
                })
                    .then(response => {
                        if (!response.ok) throw new Error("Lỗi server");
                        return response.json();
                    })
                    .then(data => {
                        const serviceResponse = data.result || data;
                        console.log("Dịch vụ vừa cập nhật có ID:", serviceResponse.id);
                        console.log("Đã cập nhật dịch vụ thành công:", serviceResponse);
                        alert("Cập nhật dịch vụ thành công!");
                        window.location.href = "service_table.html";
                    })
                    .catch(error => {
                        console.error('Lỗi cập nhật dịch vụ:', error);
                        alert(`Lỗi cập nhật dịch vụ: ${error.message}`);
                    });
            };
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
        });
}
function populateCities(provinces) {
    const citySelect = document.querySelector('select[name="location"]');
    const currentValue = citySelect.value; // Lưu giá trị hiện tại của dropdown

    // Xóa các tùy chọn cũ
    citySelect.innerHTML = '<option value="">Chọn tỉnh thành</option>';

    // Kiểm tra nếu provinces là mảng và có độ dài
    if (Array.isArray(provinces) && provinces.length > 0) {
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name; // Sử dụng name làm value
            option.text = province.name;
            citySelect.appendChild(option);
        });
    } else {
        console.warn("Dữ liệu provinces không hợp lệ hoặc rỗng:", provinces);
    }

    // Khôi phục giá trị đã chọn nếu có
    if (currentValue) {
        citySelect.value = currentValue;
    }
}