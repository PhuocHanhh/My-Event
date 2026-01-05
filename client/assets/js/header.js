function loadHeader() {
    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    fetch('/client/component/header.html')
        .then(response => response.text())
        .then(data => {
            headerContainer.innerHTML = data;
            updateHeader();

            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", function (e) {
                    e.preventDefault();
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    updateHeader(); // Cập nhật giao diện header
                    window.location.href = "home.html"; // Chuyển hướng về trang chủ
                });
            }
        })
        .catch(error => console.error("Lỗi khi tải header:", error));
}

function updateHeader() {
    const loginBtn = document.getElementById("login-btn");
    const userMenu = document.getElementById("user-menu");
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");
    const dropdownMenu = document.querySelector(".profile-dropdown");
    const homeLink = document.getElementById("home-link");
    const serviceLink = document.getElementById("service-link");
    const aboutLink = document.getElementById("about-link");

    if (!loginBtn || !userMenu || !userAvatar || !userName || !homeLink || !serviceLink || !aboutLink || !dropdownMenu) {
        console.error("Không tìm thấy các phần tử cần thiết trong DOM");
        return;
    }

    const currentPath = window.location.pathname;


    homeLink.classList.remove("active");
    serviceLink.classList.remove("active");
    aboutLink.classList.remove("active");


    if (currentPath.includes("home.html")) {
        homeLink.classList.add("active");
    } else if (currentPath.includes("service.html")) {
        serviceLink.classList.add("active");
    } else if (currentPath.includes("about.html")) {
        aboutLink.classList.add("active");
    }


    const token = localStorage.getItem("token");
    let user;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
        console.error("Dữ liệu user không hợp lệ:", e);
        user = null;
    }

    if (token && user) {
        loginBtn.style.display = "none";
        userMenu.style.display = "flex";
        userName.textContent = `${user.last_name || "Unknown"} ${user.first_name || "User"}`;
        if (userAvatar) {
            const defaultAvatarPath = "assets/img/default-avatar.png";
            if (user.avatar) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = user.avatar.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    userAvatar.src = imageUrl;
                    userAvatar.onerror = function () {
                        console.error('Lỗi tải ảnh:', imageUrl);
                        this.src = defaultAvatarPath;
                    };
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    userAvatar.src = defaultAvatarPath;
                }
            } else {
                userAvatar.src = defaultAvatarPath;
            }
        }
        if (user.roleName === "SUPPLIER") {
            dropdownMenu.innerHTML = `
                <li><a class="dropdown-item d-flex align-items-center" href="account.html"><i class="bi bi-person-circle"></i><span>Thông tin cá nhân</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="device_table.html"><i class="bi bi-file-earmark-text"></i><span>Quản lý thiết bị</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="service_table.html"><i class="bi bi-file-earmark-text"></i><span>Quản lý dịch vụ</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="location_table.html"><i class="bi bi-file-earmark-text"></i><span>Quản lý địa điểm</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="change_password.html"><i class="bi bi-shield-lock"></i><span>Đổi mật khẩu</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center logout-btn" href="#" id="logout-btn"><i class="bi bi-box-arrow-right"></i><span>Đăng xuất</span></a></li>
            `;
        } else {
            dropdownMenu.innerHTML = `
                <li><a class="dropdown-item d-flex align-items-center" href="account.html"><i class="bi bi-person-circle"></i><span>Thông tin cá nhân</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="ListContract.html"><i class="bi bi-file-earmark-text"></i><span>Quản lý hợp đồng</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="change_password.html"><i class="bi bi-shield-lock"></i><span>Đổi mật khẩu</span></a></li>
                <li><a class="dropdown-item d-flex align-items-center logout-btn" href="#" id="logout-btn"><i class="bi bi-box-arrow-right"></i><span>Đăng xuất</span></a></li>
            `;
        }
        const newLogoutBtn = document.getElementById("logout-btn");
        if (newLogoutBtn) {
            newLogoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                updateHeader();
                window.location.href = "home.html";
            });
        }
    } else {
        loginBtn.style.display = "inline-block";
        userMenu.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadHeader();
});

window.updateHeader = updateHeader;