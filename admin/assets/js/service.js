// // var ServiceAPI = 'http://localhost:8080/event-management/services';
// var UsersAPI = 'http://localhost:8080/event-management/users?roleName=SUPPLIER';
// function start() {
//     getData((services, user) => {
//         renderServices(services, user);

//     });
//     var editServicetId = localStorage.getItem("editServicetId");
//     if (editServicetId && window.location.pathname.includes("detail_service.html")) {
//         watchDetailService(editServicetId);
//     }

// }
// start();
// function getData(callback) {
//     let token = localStorage.getItem("token"); // Lấy token từ localStorage

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }

//     Promise.all([
//         fetch(`http://localhost:8080/event-management/services/list`, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),

//         fetch(UsersAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),
//     ])
//         .then(([services, users]) => {
//             callback(services, users);
//         })
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }
// //render table data
// function renderServices(services, users) {
//     var listServicesBlock = document.querySelector('#list-service tbody');
//     if (!listServicesBlock) return;

//     // Hủy DataTables nếu đã khởi tạo
//     if ($.fn.DataTable.isDataTable('#list-service')) {
//         $('#list-service').DataTable().destroy();
//     }

//     var htmls = services.map(function (service) {
//         var supplier = users.find(user => user.id === service.user_id);
//         var supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : 'Không có nhà cung cấp';

//         return `
//             <tr class="list-service-${service.id}">
//                 <td>${service.name}</td>
//                 <td style="width: 40%;">${service.description || 'Không có mô tả'}</td>
//                 <td>${service.quantity}</td>
//                 <td>${service.hourly_salary ? service.hourly_salary.toLocaleString() + " VND" : '0 VND'}</td>
//                 <td>${service.created_at}</td>
//                 <td>${service.place || "ko có địa điểm"}</td>
//                 <td>${supplierName}</td>
//                 <td class="text-center">
//                     <div class="action-dropdown">
//                         <button class="btn btn-light action-btn">...</button>
//                         <div class="dropdown-content">
//                             <button class="dropdown-item delete-btn" data-id="${service.id}">Xoá</button>
//                              <button class="dropdown-item detail-btn" data-id="${service.id}">Xem chi tiết</button>
//                         </div>
//                     </div>
//                 </td>
//             </tr>
//         `;
//     });

//     listServicesBlock.innerHTML = htmls.join('');

//     // Khởi tạo lại DataTables
//     var table = $('#list-service').DataTable({
//         "order": [[4, "desc"]],
//         "language": {
//             "search": "Tìm kiếm:",
//             "lengthMenu": "Hiển thị _MENU_ dịch vụ",
//             "info": "Hiển thị _START_ đến _END_ của _TOTAL_ dịch vụ",
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

//     // 🛠 Gán sự kiện dùng delegate để hoạt động trên tất cả các trang
//     $('#list-service tbody').on('click', '.action-btn', function (event) {
//         let dropdown = $(this).next('.dropdown-content');
//         $('.dropdown-content').not(dropdown).hide(); // Ẩn các dropdown khác
//         dropdown.toggle();
//         event.stopPropagation();
//     });

//     // Xử lý sự kiện xoá
//     $('#list-service tbody').on('click', '.delete-btn', function () {
//         let serviceId = $(this).data('id');
//         handleDeleteService(serviceId);
//     });
//     // Xử lý dịch vụ xem chi tiết
//     $('#list-service tbody').on('click', '.detail-btn', function () {
//         let serviceId = $(this).data('id');
//         handleDetailService(serviceId);
//     });
//     // Đóng dropdown khi bấm ra ngoài
//     $(document).click(function () {
//         $('.dropdown-content').hide();
//     });
// }

// //Tạo Xoá dich vu
// function handleDeleteService(id) {
//     var options = {
//         method: 'DELETE',
//         headers: {
//             "Content-Type": "application/json",
//         },

//     };
//     fetch(`http://localhost:8080/event-management/services` + '/' + id, options)
//         .then(function (respone) {
//             return respone.json();
//         })
//         .then(function () {
//             var listService = document.querySelector('.list-service-' + id)
//             if (listService) {
//                 listService.remove();
//             }
//             alert("Xoá dịch vụ thành công!");
//         })
//         .catch(function () {
//             alert("Xoá không thành công!");
//         });

// }
// //Xem chi tiết dịch vụ
// function handleDetailService(serviceId) {
//     localStorage.setItem("editServicetId", serviceId); // Lưu ID vào localStorage
//     window.location.href = "detail_service.html"; // Chuyển đến trang chi tiết
// }
// function watchDetailService(editServicetId) {
//     if (!editServicetId) return;

//     const imagePreview = document.getElementById("Image"); // Khớp với id trong HTML
//     const defaultImagePath = "assets/img/card.jpg";

//     // Lấy token từ localStorage
//     let token = localStorage.getItem("token");

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         alert("Vui lòng đăng nhập lại!");
//         return;
//     }

//     // Lấy danh sách người dùng
//     fetch(UsersAPI, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         }
//     })
//         .then(response => response.json())
//         .then(users => {
//             // Lấy thông tin dịch vụ
//             return fetch(`${`http://localhost:8080/event-management/services`}/${editServicetId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             })
//                 .then(response => response.json())
//                 .then(service => ({ service, users })); // Trả về cả service và users
//         })
//         .then(({ service, users }) => {
//             // Tìm nhà cung cấp từ users dựa trên service.user_id
//             const supplier = users.find(user => user.id === service.user_id);
//             const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không xác định";

//             // Cập nhật các thẻ <div> với dữ liệu dịch vụ
//             document.getElementById("name").textContent = service.name || "Không có tên";
//             document.getElementById("description").textContent = service.description || "Không có mô tả";
//             document.getElementById("quantity").textContent = service.quantity || "0";
//             document.getElementById("price").textContent = service.hourly_salary ? `${service.hourly_salary.toLocaleString()} VND` : "Không xác định";
//             document.getElementById("place").textContent = service.place || "Không có địa điểm";
//             document.getElementById("supplier").textContent = supplierName;

//             // Hiển thị ảnh dịch vụ
//             if (service.img) {
//                 try {
//                     const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
//                     const fileName = service.img.split('/').pop();
//                     const imageUrl = `${baseApiUrl}${fileName}`;

//                     if (imagePreview) {
//                         imagePreview.src = imageUrl;
//                         imagePreview.onerror = function () {
//                             console.error('Lỗi tải ảnh:', imageUrl);
//                             this.src = defaultImagePath;
//                         };
//                     }
//                 } catch (error) {
//                     console.error('Lỗi xử lý ảnh:', error);
//                     if (imagePreview) imagePreview.src = defaultImagePath;
//                 }
//             } else {
//                 if (imagePreview) imagePreview.src = defaultImagePath;
//             }
//         })
//         .catch(error => {
//             console.error("Lỗi khi lấy dữ liệu dịch vụ:", error);
//             alert("Không thể tải thông tin dịch vụ!");
//         });
// }
///////////////

const API_BASE = 'http://localhost:8080/event-management';
const ServiceAPI = `${API_BASE}/services`;
const UsersAPI = `${API_BASE}/users`;
const UserAPI_MRG = `${API_BASE}/users/manager`;

function start() {
    getData((services, users) => {
        renderServices(services, users);
    });

    var editServicetId = localStorage.getItem("editServicetId");
    if (editServicetId && window.location.pathname.includes("detail_service.html")) {
        watchDetailService(editServicetId);
    }
}
start();

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
        fetch(`${ServiceAPI}/list`, {
            headers: {
                // "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi ServiceAPI: ${res.status} - ${text}`);
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
        .then(([services, users]) => {
            services = services.data?.items || [];
            users = Array.isArray(users) ? users : users.data || [];

            callback(services, users);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy dữ liệu: " + error.message);
        });
}

function renderServices(services, users) {
    var listServicesBlock = document.querySelector('#list-service tbody');
    if (!listServicesBlock) return;

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-service')) {
        $('#list-service').DataTable().destroy();
    }

    var htmls = services.map(function (service) {
        // Tìm supplier trực tiếp từ users (không cần kiểm tra roleName)
        const supplier = users.find(user => user.id === service.userID);
        const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không có nhà cung cấp";

        return `
            <tr class="list-service-${service.id}">
                <td>${service.name || "Không có tên"}</td>
                <td style="width: 40%;">${service.description || "Không có mô tả"}</td>
                <td>${service.quantity || 0}</td>
                <td>${service.hourly_salary ? service.hourly_salary.toLocaleString() + " VND" : "0 VND"}</td>
                <td>${service.created_at ? new Date(service.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
                <td>${service.place || "ko có địa điểm"}</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${service.id}">Xoá</button>
                            <button class="dropdown-item detail-btn" data-id="${service.id}">Xem chi tiết</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listServicesBlock.innerHTML = htmls.join('');

    if (!listServicesBlock.innerHTML.trim()) {
        console.warn("Không có dữ liệu để hiển thị.");
        return;
    }

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
    $('#list-service tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn các dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xoá
    $('#list-service tbody').on('click', '.delete-btn', function () {
        let serviceId = $(this).data('id');
        handleDeleteService(serviceId);
    });

    // Xử lý dịch vụ xem chi tiết
    $('#list-service tbody').on('click', '.detail-btn', function () {
        let serviceId = $(this).data('id');
        handleDetailService(serviceId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).on('click', function () {
        $('.dropdown-content').hide();
    });
}

function handleDeleteService(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`, // Thêm token vào header
            "Content-Type": "application/json"
        }
    };

    fetch(`${ServiceAPI}/${id}`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi khi xoá dịch vụ: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            var listService = document.querySelector(`.list-service-${id}`);
            if (listService) {
                listService.remove();
            }
            alert("Xoá dịch vụ thành công!");
        })
        .catch(error => {
            console.error("Lỗi khi xoá dịch vụ:", error);
            alert("Xoá không thành công: " + error.message);
        });
}

function handleDetailService(serviceId) {
    localStorage.setItem("editServicetId", serviceId); // Lưu ID vào localStorage
    window.location.href = "detail_service.html"; // Chuyển đến trang chi tiết
}

function watchDetailService(editServicetId) {
    if (!editServicetId) {
        console.warn("Không có ID dịch vụ để hiển thị!");
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

    Promise.all([
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

        fetch(`${ServiceAPI}/${editServicetId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi ServiceAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),
    ])
        .then(([users, service]) => {
            users = Array.isArray(users) ? users : users.data || [];
            service = service.data || {};

            console.log("Dữ liệu Users từ API:", users);
            console.log("Dữ liệu Service:", service);

            // Tìm nhà cung cấp trực tiếp từ users (không cần kiểm tra roleName)
            const supplier = users.find(user => user.id === service.userID);
            const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không có nhà cung cấp";
            console.log("Supplier:", supplierName);

            // Cập nhật giao diện
            document.getElementById("name").textContent = service.name || "Không có tên";
            document.getElementById("description").textContent = service.description || "Không có mô tả";
            document.getElementById("quantity").textContent = service.quantity || "0";
            document.getElementById("price").textContent = service.hourly_salary ? `${service.hourly_salary.toLocaleString()} VND` : "Không xác định";
            document.getElementById("place").textContent = service.place || "Không có địa điểm";
            document.getElementById("supplier").textContent = supplierName;

            // Xử lý ảnh
            if (service.image && imagePreview) {
                const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                const fileName = service.image.split('/').pop();
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
            console.error("Lỗi khi lấy dữ liệu dịch vụ:", error);
            alert("Không thể tải thông tin dịch vụ: " + error.message);
        });
}