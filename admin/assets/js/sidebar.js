const RolesAPI = 'http://localhost:8080/event-management/roles';

document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const sidebarContainer = document.getElementById("sidebar-container");

    if (!sidebarContainer) {
        console.error("Không tìm thấy #sidebar-container trong DOM");
        return;
    }

    // Chèn HTML sidebar vào #sidebar-container
    sidebarContainer.innerHTML = `
        <aside id="sidebar" class="sidebar">
            <ul class="sidebar-nav" id="sidebar-nav">
                <li class="nav-item">
                    <a class="nav-link collapsed" href="index.html">
                        <i class="bi bi-grid"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link collapsed" href="charts-chartjs.html">
                        <i class="bi bi-menu-button-wide"></i><span>Thống kê</span>
                    </a>
                </li>
                <li class="nav-item" id="forms-nav-container"></li>
                <li class="nav-item">
                    <a class="nav-link collapsed" data-bs-target="#tables-nav" data-bs-toggle="collapse" href="#">
                        <i class="bi bi-layout-text-window-reverse"></i><span>Quản lý danh mục</span><i class="bi bi-chevron-down ms-auto"></i>
                    </a>
                    <ul id="tables-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li><a href="table-uses.html"><i class="bi bi-circle"></i><span>Quản lý người dùng</span></a></li>
                        <li><a href="table-device.html"><i class="bi bi-circle"></i><span>Quản lý thiết bị</span></a></li>
                        <li><a href="table-place.html"><i class="bi bi-circle"></i><span>Quản lý địa điểm</span></a></li>
                        <li><a href="table-contract.html"><i class="bi bi-circle"></i><span>Quản lý hợp đồng</span></a></li>
                        <li><a href="table-service.html"><i class="bi bi-circle"></i><span>Quản lý dịch vụ</span></a></li>
                        <li><a href="table-event.html"><i class="bi bi-circle"></i><span>Quản lý sự kiện</span></a></li>
                    </ul>
                </li>
                <li class="nav-heading">Pages</li>
                <li class="nav-item">
                    <a class="nav-link collapsed" href="users-profile.html">
                        <i class="bi bi-person"></i>
                        <span>Thông tin cá nhân</span>
                    </a>
                    <a class="nav-link collapsed" href="change_password.html">
                    <i class="bi bi-gear"></i>
                        <span>Đổi mật khẩu</span>
                    </a>
                </li>
            </ul>
        </aside>
    `;

    if (!user || !user.roleName) {
        console.error("Không tìm thấy user hoặc role_id trong localStorage");
        adjustSidebarLinks([]);
        adjustSidebar([]);
        initSidebarToggle();
        return;
    }

    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    fetch(RolesAPI, {
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        cache: 'no-store' // Vô hiệu hóa cache
    })
        .then(response => new Promise(resolve => setTimeout(() => resolve(response), 100))) // Thêm delay 100ms
        .then(response => {
            if (!response.ok) throw new Error("Không thể tải roles: " + response.statusText);
            return response.json();
        })
        .then(roles => {
            adjustSidebarLinks(roles);
            adjustSidebar(roles);
            initSidebarToggle();
        })
        .catch(error => {
            console.error("Lỗi tải roles (sidebar):", error.message);
            // Hiển thị thông báo lỗi cho người dùng
            toastr.error("Không thể tải danh sách vai trò. Vui lòng thử lại!", "Lỗi");
            adjustSidebarLinks([]);
            adjustSidebar([]);
            initSidebarToggle();
        });
});

function adjustSidebarLinks(roles) {
    const user = JSON.parse(localStorage.getItem("user"));
    let basePath = "../admin/";


    if (user && user.role_id) {
        const role = roles.find(r => r.id === user.role_id || r.id.toString() === user.role_id);
        const roleName = user.roleName;

        if (roleName.toUpperCase() === "MANAGER") {
            basePath = "../admin/";
        }
    }

    const sidebarLinks = document.querySelectorAll("#sidebar a");
    sidebarLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#")) {
            link.setAttribute("href", basePath + href);
        }
    });
}

function adjustSidebar(roles) {
    const user = JSON.parse(localStorage.getItem("user"));
    const formsNavContainer = document.getElementById("forms-nav-container");

    if (!formsNavContainer) {
        console.error("Không tìm thấy #forms-nav-container trong DOM");
        return;
    }

    let roleName = "ADMIN";
    if (user && user.role) {
        const role = roles.find(r => r.id === user.role_id || r.id.toString() === user.role_id);
        roleName = user.roleName;
    }

    if (user.roleName === "MANAGER") {
        formsNavContainer.innerHTML = `
            <a class="nav-link collapsed" data-bs-target="#forms-nav" data-bs-toggle="collapse" href="#">
                <i class="bi bi-journal-text"></i><span>Biểu Mẫu</span><i class="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul id="forms-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
                <li>
                    <a href="form-event.html">
                        <i class="bi bi-circle"></i><span>Sự kiện</span>
                    </a>
                </li>
            </ul>
        `;
    } else {
        formsNavContainer.innerHTML = "";
    }
}

function initSidebarToggle() {
    const toggleBtn = document.querySelector(".toggle-sidebar-btn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            document.body.classList.toggle("sidebar-open");
        });
    }
}