let allItems = [];
let allTypes = [];
let allCities = [];
let suppliers = [];
let currentTypeId = null;
let currentCategory = null;
let provinces = [];
let currentPage = 1;
const itemsPerPage = 6;
const PROVINCE_API_URL = 'https://provinces.open-api.vn/api/p';

document.addEventListener("DOMContentLoaded", async function () {
    const preloader = document.getElementById("preloader");
    const floatingBtn = document.querySelector(".floating-register-btn");
    const registerEventBtn = document.querySelector(".filter-section .btn-register");

    // Lấy thông tin người dùng từ localStorage
    let user = null;
    try {
        const userData = localStorage.getItem("user");
        if (userData) {
            user = JSON.parse(userData); // Phân tích JSON
        }
    } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", error);
    }

    // Kiểm tra vai trò và điều chỉnh hiển thị nút
    if (user && user.roleName === "SUPPLIER") {
        // Ẩn cả hai nút
        if (registerEventBtn) {
            registerEventBtn.style.display = "none";
        }
        if (floatingBtn) {
            floatingBtn.style.display = "none";
        }
    } else {
        if (registerEventBtn) {
            registerEventBtn.style.display = "block";
        }
        if (floatingBtn) {
            window.addEventListener("scroll", function () {
                if (window.scrollY > 100) {
                    floatingBtn.classList.add("visible");
                } else {
                    floatingBtn.classList.remove("visible");
                }
            });
        }
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        currentCategory = urlParams.get("category") || "event";
        let endpoint;
        if (currentCategory === "device") {
            endpoint = "http://localhost:8080/event-management/devices/list";
        } else if (currentCategory === "service") {
            endpoint = "http://localhost:8080/event-management/services/list";
        } else if (currentCategory === "location") {
            endpoint = "http://localhost:8080/event-management/locations/list";
        } else if (currentCategory === "event") {
            endpoint = "http://localhost:8080/event-management/event";
        } else {
            throw new Error("Danh mục không hợp lệ");
        }

        // Gọi API dữ liệu chính
        const dataResponse = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!dataResponse.ok) {
            throw new Error(`Lỗi khi lấy dữ liệu chính: ${dataResponse.statusText}`);
        }
        var a = await dataResponse.json();

        if (!(currentCategory === "event")) {
            var data = a.data.items;
            a = data;
        }

        console.log("Dữ liệu API:", a);

        allTypes = getTypesByCategory(a);
        allItems = getItemsByCategory(a);
        console.log("allTypes:", allTypes);
        console.log("allItems:", allItems);

        await populateCityFilter();
        populateServicesList(allTypes);
        filterItems();

        if (localStorage.getItem("openContractAfterLogin") === "true") {
            localStorage.removeItem("openContractAfterLogin");
            openContractModal();
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        document.getElementById("item-container").innerHTML = "<p class='text-center'>Lỗi tải dữ liệu! Vui lòng thử lại sau.</p>";
    } finally {
        preloader.style.display = "none";
    }
});

function getTypesByCategory(data) {
    if (currentCategory === "event") {
        const types = Array.isArray(data)
            ? [...new Set(data.map(item => item.eventTypeName))].map((name, index) => ({
                id: index + 1,
                name
            }))
            : [{ id: 1, name: data.eventTypeName }];
        return types;
    } else if (currentCategory === "device") {
        const types = Array.isArray(data)
            ? [...new Set(data.map(item => item.deviceType_name))].map((name, index) => ({
                id: index + 1,
                name
            }))
            : [{ id: 1, name: data.eventTypeName }];
        return types;
    }
    return [];
}

function getItemsByCategory(data) {
    if (!(currentCategory === "")) {
        const items = Array.isArray(data) ? data : [data];
        return items.map(item => {
            // Ánh xạ place sang city_id nếu cần
            const cityId = item.city_id || mapCityNameToCode(item.place || '');
            return {
                ...item,
                img: item.img || item.image || "",
                image: item.image || item.img || "",
                city_id: cityId // Thêm hoặc cập nhật city_id
            };
        });
    }
    return [];
}

function mapCityNameToCode(cityName) {
    if (!cityName || !provinces.length) return null;
    const province = provinces.find(prov =>
        prov.name.toLowerCase() === cityName.toLowerCase() ||
        prov.name.toLowerCase().includes(cityName.toLowerCase())
    );
    return province ? province.code : null;
}

async function populateCityFilter() {
    try {
        const provinceResponse = await fetch(PROVINCE_API_URL);
        if (!provinceResponse.ok) {
            throw new Error(`HTTP error! status: ${provinceResponse.status}`);
        }
        provinces = await provinceResponse.json();
        console.log("Dữ liệu Provinces:", provinces);

        const provinceSelect = document.getElementById('cityFilter');
        if (!provinceSelect) {
            console.error("Không tìm thấy phần tử với ID 'cityFilter'");
            return;
        }
        provinceSelect.innerHTML = '<option value="">Tất cả tỉnh</option>';

        if (Array.isArray(provinces)) {
            provinces.forEach(prov => {
                const option = document.createElement('option');
                option.value = prov.code;
                option.textContent = prov.name;
                provinceSelect.appendChild(option);
            });
            console.log("Số lượng tỉnh/thành phố đã thêm vào dropdown:", provinceSelect.options.length - 1);
        } else {
            console.warn("Dữ liệu provinces không phải là mảng:", provinces);
            provinces = [];
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error);
    }
}

function populateServicesList(types) {
    const servicesList = document.getElementById("services-list");
    const categoryTitle = document.getElementById("category-title");
    servicesList.innerHTML = "";

    if (currentCategory === "event") {
        categoryTitle.textContent = "Danh mục sự kiện";
    }

    if (!types || types.length === 0) {
        servicesList.innerHTML = "<p>Không có danh mục nào!</p>";
        return;
    }

    const allItem = document.createElement("a");
    allItem.className = currentTypeId === null ? "active" : "";
    allItem.innerHTML = `<i class="bi bi-arrow-right-circle"></i><span>Tất cả</span>`;
    allItem.addEventListener("click", (e) => {
        e.preventDefault();
        selectCategory(null);
    });
    servicesList.appendChild(allItem);

    types.forEach(type => {
        const serviceItem = document.createElement("a");
        serviceItem.className = type.id === currentTypeId ? "active" : "";
        serviceItem.innerHTML = `<i class="bi bi-arrow-right-circle"></i><span>${type.name}</span>`;
        serviceItem.addEventListener("click", (e) => {
            e.preventDefault();
            selectCategory(type.id);
        });
        servicesList.appendChild(serviceItem);
    });
}

function selectCategory(typeId) {
    currentTypeId = typeId;
    currentPage = 1;
    const links = document.querySelectorAll("#services-list a");
    links.forEach(link => {
        link.classList.remove("active");
        if ((typeId === null && link.textContent === "Tất cả") ||
            (typeId !== null && link.textContent === allTypes.find(t => t.id === typeId)?.name)) {
            link.classList.add("active");
        }
    });
    filterItems();
}

function displayItems(items) {
    const itemContainer = document.getElementById("item-container");
    itemContainer.innerHTML = "";
    if (!items || items.length === 0) {
        itemContainer.innerHTML = "<p class='text-center'>Không có mục nào!</p>";
        return;
    }

    const baseImageUrl = "http://localhost:8080/event-management/api/v1/FileUpload/files/";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    paginatedItems.forEach((item, index) => {
        let detailPage = currentCategory === "event" ? "./event-detail.html" : "./item-detail.html";
        let buttonText = "Xem Chi Tiết";
        let itemId = item.id;
        let hoverInfo = '';
        if (currentCategory === "event") {
            hoverInfo = `
                    <div class="row"><div class="col">${item.eventTypeName}</div></div>
            `;
        } else {
            hoverInfo = `    
                    <div class="row propery-info"><div class="col">Địa điểm</div></div>
                    <div class="row"><div class="col" style="font-size:12px;">${item.place || item.address}</div></div>
             `;
        }
        const imageFileName = item.img ? item.img.split('/').pop() : item.image.split('/').pop();
        const imageUrl = imageFileName ? `${baseImageUrl}${imageFileName}` : '../client/assets/img/events/sk2.jpg';
        console.log(`Image URL for event ${item.name}:`, imageUrl);

        const itemCard = `
                    <div class="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="card">
                            <img src="${imageUrl}" 
                                 onerror="this.src='../client/assets/img/events/sk2.jpg'" 
                                 alt="${item.name}" 
                                 class="img-fluid">
                            <div class="card-body">
                                <span class="sale-rent"><a href="${detailPage}?id=${itemId}&category=${currentCategory}">${buttonText}</a></span>
                                <h3><a href="${detailPage}?id=${itemId}&category=${currentCategory}" class="stretched-link">${item.name}</a></h3>
                                <div class="card-content">${hoverInfo}</div>
                            </div>
                        </div>
                    </div>
                `;
        itemContainer.innerHTML += itemCard;
    });
}

function filterItems() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const cityId = document.getElementById("cityFilter").value;
    console.log("City ID selected:", cityId);
    let filteredItems = allItems;

    // Lọc các mục có _template là true chỉ khi danh mục là "event"
    if (currentCategory === "event") {
        filteredItems = filteredItems.filter(item => item._template === true);
    }

    console.log("Items after _template filter (if applied):", filteredItems);

    if (currentTypeId !== null) {
        if (currentCategory === "event") {
            filteredItems = filteredItems.filter(item => item.eventTypeName === allTypes.find(t => t.id === currentTypeId)?.name);
        } else if (currentCategory === "device") {
            filteredItems = filteredItems.filter(item => item.deviceType_name === allTypes.find(t => t.id === currentTypeId)?.name);
        }
    }

    if (cityId) {
        filteredItems = filteredItems.filter(item => {
            console.log("Item city_id or place:", item.city_id, item.place);
            const cityCode = item.city_id || mapCityNameToCode(item.place || '');
            return cityCode == cityId;
        });
    }

    filteredItems = filteredItems.filter(item => {
        return item.name.toLowerCase().includes(searchInput);
    });

    console.log("Filtered items:", filteredItems);
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    displayItems(filteredItems);
    renderPagination(totalItems, totalPages);
}

function renderPagination(totalItems, totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            filterItems();
        });
        pagination.appendChild(pageItem);
    }
}

function checkLoginAndOpenContract() {
    console.log("Nút Đăng ký được nhấn");
    let user = null;
    try {
        const userData = localStorage.getItem("user");
        if (userData) {
            user = JSON.parse(userData);
        }
    } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", error);
    }

    if (user && user.roleName === "SUPPLIER") {
        alert("Nhà cung cấp không thể đăng ký tổ chức sự kiện.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("openContractAfterLogin", "true");
        localStorage.setItem("redirectAfterLogin", `service.html?category=${currentCategory}`);
        window.location.href = "login.html";
    } else {
        openContractModal();
    }
}

function openContractModal() {
    console.log("Mở modal hợp đồng");
    const iframe = document.getElementById("contractIframe");
    if (!iframe) {
        console.error("Không tìm thấy iframe!");
        return;
    }
    iframe.src = "contract.html";

    const modalElement = document.getElementById("iframeModal");
    if (!modalElement) {
        console.error("Không tìm thấy modal!");
        return;
    }
    const modal = new bootstrap.Modal(modalElement, {});
    modal.show();

    iframe.onload = function () {
        console.log("Iframe loaded");
    };

    window.addEventListener("message", function closeModal(event) {
        if (event.data === "closeIframe") {
            console.log("Nhận tín hiệu đóng modal");
            modal.hide();
            window.removeEventListener("message", closeModal);
        }
    }, { once: true });
}