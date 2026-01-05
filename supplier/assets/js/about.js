

document.addEventListener("DOMContentLoaded", async function () {
    const eventContainer = document.getElementById("agents-container");

    try {
        const response = await fetch("../client/assets/data/admin.json"); // Gọi API lấy danh sách Admins
        const data = await response.json();

        // Gọi hàm hiển thị danh sách admins
        displayAdmins(data.admins);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        eventContainer.innerHTML = "<p>Không thể tải dữ liệu.</p>";
    }
});

function displayAdmins(admins) {
    const eventContainer = document.getElementById("agents-container");
    eventContainer.innerHTML = ""; // Xóa nội dung cũ

    if (admins.length === 0) {
        eventContainer.innerHTML = "<p class='text-center'>Không có quản lý sự kiện nào!</p>";
        return;
    }

    admins.forEach(admin => {
        const adminCard = `
            <div class="col-lg-3 col-md-6" data-aos="fade-up">
                <div class="member">
                    <div class="pic"><img src="${admin.image}" class="img-fluid" alt="${admin.name}"></div>
                    <div class="member-info">
                        <h4>${admin.name}</h4>
                        <span>Quản lý sự kiện</span>
                        <div class="social">
                            <a href=""><i class="bi bi-facebook"></i></a>
                            <a href=""><i class="bi bi-instagram"></i></a>
                            <a href=""><i class="bi bi-linkedin"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        eventContainer.innerHTML += adminCard;
    });
}
