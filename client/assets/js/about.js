

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
            <div class="col-custom" data-aos="fade-up">
                <div class="member">
                    <div class="pic"><img src="${admin.image}" class="img-fluid" alt="${admin.name}" style="height: 300px; with: 50px;"></div>
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

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true
});

// Initialize Swiper for Video Carousel
new Swiper('.video-carousel', {
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    slidesPerView: 1,
    spaceBetween: 20
});

// Call Now Button
const callBtn = document.getElementById('callBtn');
if (callBtn) {
    document.addEventListener("DOMContentLoaded", function () {
        callBtn.classList.add('shake');
        setTimeout(() => callBtn.classList.remove('shake'), 1000);
    });

    window.addEventListener('scroll', function () {
        if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
            callBtn.style.display = 'block';
        } else {
            callBtn.style.display = 'none';
        }
    });

    callBtn.addEventListener('click', function () {
        window.location.href = 'tel:0123456789';
        callBtn.classList.add('shake');
        setTimeout(() => callBtn.classList.remove('shake'), 1000);
    });
} else {
    console.error('Error: Element with ID "callBtn" not found.');
}