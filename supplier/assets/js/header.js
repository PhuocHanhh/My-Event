function loadHeader() {
    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    fetch('/supplier/component/header.html')
        .then(response => response.text())
        .then(data => {
            headerContainer.innerHTML = data;
            updateHeader(); // Cập nhật header sau khi chèn

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

    // Lấy các liên kết trong menu
    const homeLink = document.getElementById("home-link");
    const serviceLink = document.getElementById("service-link");
    const aboutLink = document.getElementById("about-link");

    if (!loginBtn || !userMenu || !userAvatar || !userName || !homeLink || !serviceLink || !aboutLink) {
        console.error("Không tìm thấy các phần tử cần thiết trong DOM");
        return;
    }

    // Kiểm tra URL hiện tại để xác định trang đang active
    const currentPath = window.location.pathname;
    console.log("Current path:", currentPath);

    // Xóa lớp active khỏi tất cả các liên kết
    homeLink.classList.remove("active");
    serviceLink.classList.remove("active");
    aboutLink.classList.remove("active");

    // Thêm lớp active cho liên kết tương ứng
    if (currentPath.includes("home.html")) {
        homeLink.classList.add("active");
    } else if (currentPath.includes("service.html")) {
        serviceLink.classList.add("active");
    } else if (currentPath.includes("about.html")) {
        aboutLink.classList.add("active");
    }

    // Cập nhật giao diện đăng nhập/đăng xuất
    const token = localStorage.getItem("token");
    let user;
    try {
        user = JSON.parse(localStorage.getItem("user"));
        console.log("Dữ liệu user từ localStorage:", user);
    } catch (e) {
        console.error("Dữ liệu user không hợp lệ:", e);
        user = null;
    }

    if (token && user) {
        loginBtn.style.display = "none";
        userMenu.style.display = "flex";
        userName.textContent = `${user.last_name || "Unknown"} ${user.first_name || "User"}`;
        userAvatar.src = user.avatar || "/fe-event-management/client/assets/img/avatar/avt.jpg";
        console.log("Đường dẫn ảnh:", userAvatar.src);
    } else {
        loginBtn.style.display = "inline-block";
        userMenu.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadHeader(); // Tải header động
});

window.updateHeader = updateHeader;