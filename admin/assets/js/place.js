const API_BASE = 'http://localhost:8080/event-management';
const LocationsAPI = `${API_BASE}/locations`;
const UsersAPI = `${API_BASE}/users`;
const UserAPI_MRG = `${API_BASE}/users/manager`;

function start() {
    getData((locations, users) => {
        renderLocation(locations, users);
    });

    var editLocationId = localStorage.getItem("editLocationId");
    if (editLocationId && window.location.pathname.includes("detail_location.html")) {
        watchDetailLocation(editLocationId);
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
    console.log("User API được gọi:", userApiToFetch);

    Promise.all([
        // Không gửi token cho LocationsAPI, giống như ServiceAPI trong service.js
        fetch(`${LocationsAPI}/list`).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi LocationsAPI: ${res.status} - ${text}`);
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
        .then(([locations, users]) => {
            locations = Array.isArray(locations) ? locations : locations.data?.items || [];
            users = Array.isArray(users) ? users : users.data || [];

            callback(locations, users);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy dữ liệu: " + error.message);
        });
}

function renderLocation(locations, users) {
    var listLocationBlock = document.querySelector('#list-place tbody');
    if (!listLocationBlock) return;

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-place')) {
        $('#list-place').DataTable().destroy();
    }

    var htmls = locations.map(function (location) {
        // Tìm supplier trực tiếp từ users (không cần kiểm tra roleName)
        const supplier = users.find(user => user.id === location.userID);
        const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không có nhà cung cấp";

        return `
            <tr class="list-place-${location.id}">
                <td>${location.name || "Không có tên"}</td>
                <td style="width: 40%;">${location.description || "Không có mô tả"}</td>
                <td>${location.hourly_rental_fee ? location.hourly_rental_fee.toLocaleString() + " VND" : "0 VND"}</td>
                <td>${location.created_at ? new Date(location.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
                <td>${location.address || "Ko tìm thấy địa chỉ"}</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${location.id}">Xoá</button>
                            <button class="dropdown-item detail-btn" data-id="${location.id}">Xem chi tiết</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listLocationBlock.innerHTML = htmls.join('');

    if (!listLocationBlock.innerHTML.trim()) {
        console.warn("Không có dữ liệu để hiển thị.");
        return;
    }

    // Khởi tạo lại DataTables
    $('#list-place').DataTable({
        "order": [[3, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "", // Hiển thị _MENU_ địa điểm
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ địa điểm",
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

    // Gán sự kiện dùng delegate để dropdown hoạt động trên tất cả các trang
    $('#list-place tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xoá
    $('#list-place tbody').on('click', '.delete-btn', function () {
        let locationId = $(this).data('id');
        handleDeleteLocation(locationId);
    });

    // Xử lý sự kiện xem chi tiết
    $('#list-place tbody').on('click', '.detail-btn', function () {
        let locationId = $(this).data('id');
        handleDetailLocation(locationId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).on('click', function () {
        $('.dropdown-content').hide();
    });
}

function handleDeleteLocation(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`, // Thêm token vào header
            "Content-Type": "application/json"
        }
    };

    fetch(`${LocationsAPI}/${id}`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi khi xoá địa điểm: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            var listLocation = document.querySelector(`.list-place-${id}`);
            if (listLocation) {
                listLocation.remove();
            }
            alert("Xoá địa điểm thành công!");
        })
        .catch(error => {
            console.error("Lỗi khi xoá địa điểm:", error);
            alert("Xoá không thành công: " + error.message);
        });
}

function handleDetailLocation(locationId) {
    localStorage.setItem("editLocationId", locationId); // Lưu ID vào localStorage
    window.location.href = "detail_location.html"; // Chuyển đến trang chi tiết
}

function watchDetailLocation(editLocationId) {
    if (!editLocationId) {
        console.warn("Không có ID địa điểm để hiển thị!");
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

        fetch(`${LocationsAPI}/${editLocationId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi LocationsAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),
    ])
        .then(([users, location]) => {
            users = Array.isArray(users) ? users : users.data || [];
            location = Array.isArray(location) ? location : location.data || {};

            console.log("Dữ liệu Users từ API:", users);
            console.log("Dữ liệu Location:", location);

            // Tìm nhà cung cấp trực tiếp từ users (không cần kiểm tra roleName)
            const supplier = users.find(user => user.id === location.userID);
            const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không có nhà cung cấp";
            console.log("Supplier:", supplierName);

            // Cập nhật giao diện
            document.getElementById("name").textContent = location.name || "Không có tên";
            document.getElementById("description").textContent = location.description || "Không có mô tả";
            document.getElementById("address").textContent = location.address || "Không có địa điểm";
            document.getElementById("price").textContent = location.hourly_rental_fee ? `${location.hourly_rental_fee.toLocaleString()} VND` : "Không xác định";
            document.getElementById("supplier").textContent = supplierName;

            // Xử lý ảnh
            if (location.image && imagePreview) {
                const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                const fileName = location.image.split('/').pop();
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
            console.error("Lỗi khi lấy dữ liệu địa điểm:", error);
            alert("Không thể tải thông tin địa điểm: " + error.message);
        });
}