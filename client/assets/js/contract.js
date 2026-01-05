const BASE_URL = "http://localhost:8080/event-management";
const DEVICE_API_URL = `${BASE_URL}/devices`;
const SERVICE_API_URL = `${BASE_URL}/services`;
const LOCATION_API_URL = `${BASE_URL}/locations`;
const PROVINCE_API_URL = 'https://provinces.open-api.vn/api/p'; // API lấy danh sách tỉnh/thành phố
const DISTRICT_API_URL = 'https://provinces.open-api.vn/api/p/'; // API lấy quận/huyện
const WARD_API_URL = 'https://provinces.open-api.vn/api/d/'; // API lấy phường/xã
const RENTAL_API_URL = `${BASE_URL}/rentals`;
const USER_API_URL = `${BASE_URL}/users`;
const EVENT_API_URL = `${BASE_URL}/event`;
const TIMELINE_API_URL = `${BASE_URL}/timelines`;
const DEVICE_RENTAL_API_URL = `${BASE_URL}/api/device-rentals`;
const SERVICE_RENTAL_API_URL = `${BASE_URL}/api/service-rentals`;
const LOCATION_RENTAL_API_URL = `${BASE_URL}/api/location-rentals`;
const CUSTOMER_API_URL = `${BASE_URL}/api/customers`;
const CONTRACT_API_URL = `${BASE_URL}/api/contracts`;
const TYPEEVENT_API_URL = `${BASE_URL}/event-type`;


let devices = [];
let services = [];
let locations = [];
let provinces = [];
let events = [];
let selectedItems = [];
let currentSelectionType = null;

function getToken() {
    return localStorage.getItem("token");
}

// Định dạng ngày tháng
function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    } else {
        return new Date(dateStr);
    }
}

function toISODate(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

function toISODateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;

    let dateParts;
    if (dateStr.includes('/')) {
        dateParts = dateStr.split('/');
        dateParts = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`; // YYYY-MM-DD
    } else {
        dateParts = dateStr;
    }

    const [hours, minutes] = timeStr.split(':').map(part => part.padStart(2, '0'));

    const isoDateTime = `${dateParts}T${hours}:${minutes}:00.000+07:00`;
    return isoDateTime;
}

// Lấy thông tin nhà cung cấp
async function fetchSupplier(userId) {
    try {
        const user = await fetchData(`${USER_API_URL}/${userId}`);
        if (user.roleName === 'SUPPLIER') {
            return user;
        }
        return null;
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin nhà cung cấp: ${error.message}`);
        return null;
    }
}


function initializeContractForm() {
    const modal = new bootstrap.Modal(document.getElementById('contractModal'), {});
    modal.show();

    document.getElementById('contractDate').valueAsDate = new Date();

    setupDatePicker('startDateDisplay', 'startDate');
    setupDatePicker('endDateDisplay', 'endDate');
    setupDatePicker('customStartDateDisplay', 'customStartDate');
    setupDatePicker('customEndDateDisplay', 'customEndDate');
    setupDatePicker('timelineDateDisplay', 'timelineDate');

    toggleLocationForm();
    loadInitialData();
    getEventType();

    window.addEventListener("message", function (event) {
        if (event.data.type === "preloadEvent" && event.data.event) {
            preloadEvent(event.data);
        }
        if (event.data.type === "preloadItem" && event.data.item) {
            preloadItem(event.data.item);
        }
    });
}

function setupDatePicker(displayId, inputId) {
    const displayInput = document.getElementById(displayId);
    const dateInput = document.getElementById(inputId);
    const calendarIcon = displayInput.nextElementSibling;


    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7);
    dateInput.min = minDate.toISOString().split('T')[0];

    dateInput.addEventListener('change', () => {
        displayInput.value = formatDate(dateInput.value);
        if (displayId === 'startDateDisplay' || displayId === 'endDateDisplay') {
            validateAndUpdateDates();
        }
    });

    calendarIcon.addEventListener('click', () => {
        dateInput.showPicker();
    });

    displayInput.addEventListener('change', () => {
        const date = parseDate(displayInput.value);
        if (date) {
            dateInput.value = toISODate(displayInput.value);
            if (displayId === 'startDateDisplay' || displayId === 'endDateDisplay') {
                validateAndUpdateDates();
            }
        }
    });
}

function fetchJSONP(url, callbackName) {
    return new Promise((resolve, reject) => {
        const callbackId = 'jsonp_callback_' + Math.round(100000 * Math.random());

        window[callbackId] = function (data) {
            delete window[callbackId]; // Xóa callback sau khi dùng
            document.body.removeChild(script); // Xóa thẻ script
            resolve(data);
        };

        // Tạo thẻ script để gọi API
        const script = document.createElement('script');
        script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackId}`;
        script.onerror = () => {
            delete window[callbackId];
            document.body.removeChild(script);
            reject(new Error('Lỗi khi tải dữ liệu qua JSONP'));
        };
        document.body.appendChild(script);
    });
}

// Cập nhật hàm loadInitialData để dùng JSONP
async function loadInitialData() {
    try {
        // Lấy danh sách thiết bị
        const deviceResponse = await fetchData(`${DEVICE_API_URL}/list`);
        devices = deviceResponse.data?.items || [];

        if (Array.isArray(devices)) {
            for (const device of devices) {
                const supplier = await fetchSupplier(device.userID);
                device.supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : 'Không xác định';
            }
        } else {
            console.warn("Dữ liệu devices không phải là mảng:", devices);
            devices = [];
        }
    } catch (error) {
        console.error(`Lỗi khi tải danh sách thiết bị: ${error.message}`);
        devices = [];
    }

    try {
        // Lấy danh sách dịch vụ
        const serviceResponse = await fetchData(`${SERVICE_API_URL}/list`);
        services = serviceResponse.data?.items || [];

        if (Array.isArray(services)) {
            for (const service of services) {
                const supplier = await fetchSupplier(service.userID);
                service.supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : 'Không xác định';
            }
        } else {
            console.warn("Dữ liệu services không phải là mảng:", services);
            services = [];
        }
    } catch (error) {
        console.error(`Lỗi khi tải danh sách dịch vụ: ${error.message}`);
        services = [];
    }

    try {
        // Lấy danh sách địa điểm
        const locationResponse = await fetchData(`${LOCATION_API_URL}/list`);
        locations = locationResponse.data?.items || [];
        console.log("Dữ liệu Locations:", locations);

        if (Array.isArray(locations)) {
            for (const location of locations) {
                const supplier = await fetchSupplier(location.userID);
                location.supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : 'Không xác định';
            }
        } else {
            console.warn("Dữ liệu locations không phải là mảng:", locations);
            locations = [];
        }
    } catch (error) {
        console.error(`Lỗi khi tải danh sách địa điểm: ${error.message}`);
        locations = [];
    }

    try {
        // Lấy danh sách tỉnh/thành phố
        const provinceResponse = await fetch(PROVINCE_API_URL);
        if (!provinceResponse.ok) {
            throw new Error(`HTTP error! status: ${provinceResponse.status}`);
        }
        provinces = await provinceResponse.json();
        console.log("Dữ liệu Provinces:", provinces);

        const provinceSelect = document.getElementById('province');
        if (!provinceSelect) {
            console.error("Không tìm thấy phần tử với ID 'province'");
            return;
        }

        // Xóa các option hiện có
        provinceSelect.innerHTML = '<option value="">Tỉnh/Thành phố</option>';

        // Thêm các tỉnh thành vào select
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

        // Lấy danh sách sự kiện
        // const eventResponse = await fetchData(EVENT_API_URL);
        // events = Array.isArray(eventResponse) ? eventResponse : [];
        // console.log("Dữ liệu Events:", events);

        // const contractTypeSelect = document.getElementById('contractType');
        // contractTypeSelect.innerHTML = '<option value="">Chọn loại sự kiện</option>';
        // events.forEach(event => {
        //     const option = document.createElement('option');
        //     option.value = event.id;
        //     option.textContent = event.name;
        //     contractTypeSelect.appendChild(option);
        // });
    } catch (error) {
        console.error(`Lỗi khi tải dữ liệu tỉnh/thành phố hoặc sự kiện: ${error.message}`);
        provinces = [];
        events = [];
    }

    // Thiết lập sự kiện lắng nghe cho dropdown
    setupEventListeners();
}

async function updateDistricts() {
    const provinceId = document.getElementById('province').value;
    const districtSelect = document.getElementById('district');
    districtSelect.innerHTML = '<option value="">Quận/Huyện</option>';

    if (provinceId) {
        try {
            const districtResponse = await fetch(`${DISTRICT_API_URL}${provinceId}?depth=2`);
            if (!districtResponse.ok) {
                throw new Error(`HTTP error! status: ${districtResponse.status}`);
            }
            const districtData = await districtResponse.json();
            const filteredDistricts = districtData.districts || [];
            console.log(`Dữ liệu Quận/Huyện cho provinceId ${provinceId}:`, filteredDistricts);

            filteredDistricts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.code;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
            console.log("Số lượng quận/huyện đã thêm:", districtSelect.options.length - 1);
        } catch (error) {
            console.error(`Lỗi khi lấy quận/huyện: ${error.message}`);
        }
    }

    updateWards();
}

async function updateWards() {
    const districtId = document.getElementById('district').value;
    const wardSelect = document.getElementById('ward');
    wardSelect.innerHTML = '<option value="">Xã/Phường</option>';

    if (districtId) {
        try {
            const wardResponse = await fetch(`${WARD_API_URL}${districtId}?depth=2`);
            if (!wardResponse.ok) {
                throw new Error(`HTTP error! status: ${wardResponse.status}`);
            }
            const wardData = await wardResponse.json();
            const filteredWards = wardData.wards || [];
            console.log(`Dữ liệu Phường/Xã cho districtId ${districtId}:`, filteredWards);

            filteredWards.forEach(ward => {
                const option = document.createElement('option');
                option.value = ward.code;
                option.textContent = ward.name;
                wardSelect.appendChild(option);
            });
            console.log("Số lượng phường/xã đã thêm:", wardSelect.options.length - 1);
        } catch (error) {
            console.error(`Lỗi khi lấy xã/phường: ${error.message}`);
        }
    }
}
async function getEventType() {
    const eventTypeSelect = document.getElementById('eventType');
    eventTypeSelect.innerHTML = '<option value="">Loại sự kiện</option>';

    try {
        const response = await fetch(`${TYPEEVENT_API_URL}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const eventTypes = await response.json();
        console.log("Dữ liệu loại sự kiện:", eventTypes);

        eventTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name || 'Không rõ tên';
            eventTypeSelect.appendChild(option);
        });

        console.log("Số lượng loại sự kiện đã thêm:", eventTypeSelect.options.length - 1);
    } catch (error) {
        console.error(`Lỗi khi lấy loại sự kiện: ${error.message}`);
    }
}
function setupEventListeners() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');

    // Khi chọn tỉnh/thành phố, cập nhật quận/huyện
    provinceSelect.addEventListener('change', updateDistricts);

    // Khi chọn quận/huyện, cập nhật phường/xã
    districtSelect.addEventListener('change', updateWards);

    // Thêm sự kiện cho contractType
    // const contractTypeSelect = document.getElementById('contractType');
    // contractTypeSelect.addEventListener('change', updateContractName);
}
async function openItemSelectionModal(type) {
    currentSelectionType = type;
    selectedItems = [];
    const modalTitle = document.getElementById("itemSelectionTitle");
    const itemContainer = document.getElementById("itemSelectionContainer");
    const selectedCount = document.getElementById("selectedCount");
    itemContainer.innerHTML = "";
    selectedCount.textContent = "Đã chọn: 0 mục";

    let items;
    if (type === "device") {
        modalTitle.textContent = "Chọn thiết bị";
        items = devices;
    } else if (type === "service") {
        modalTitle.textContent = "Chọn dịch vụ";
        items = services;
    } else if (type === "location") {
        modalTitle.textContent = "Chọn địa điểm";
        items = locations;
    }

    try {
        if (!items || items.length === 0) {
            throw new Error(`Không có dữ liệu ${type}`);
        }

        for (const item of items) {
            const supplier = await fetchSupplier(item.userID);

            let priceLabel = "Giá: ";
            let priceValue = "Không xác định";
            if (type === "device") {
                priceValue = item.hourlyRentalFee
                    ? item.hourlyRentalFee.toLocaleString() + " VND"
                    : "Không xác định";
            } else if (type === "service") {
                priceValue = item.hourly_salary
                    ? item.hourly_salary.toLocaleString() + " VND"
                    : "Không xác định";
            } else if (type === "location") {
                priceValue = item.hourly_rental_fee
                    ? item.hourly_rental_fee.toLocaleString() + " VND"
                    : "Không xác định";
            }

            const card = document.createElement("div");
            card.className = "col-md-4 item-card";
            card.innerHTML = `
                <div class="card">
                    <img src="assets/img/default.jpg" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">${priceLabel}${priceValue}</p>
                        <p class="card-text">Nhà cung cấp: ${item.supplierName}</p>
                        <p class="card-text">Địa điểm: ${item.place || "Không xác định"}</p>
                        <input type="number" class="form-control quantity-input" value="1" min="1" style="display: none;">
                    </div>
                </div>
            `;
            card.addEventListener("click", () => toggleItemSelection(item, card));
            itemContainer.appendChild(card);

            // Cập nhật ảnh cho thẻ <img> trong card
            const imgElement = card.querySelector(".card-img-top");
            const defaultImagePath = "";
            if (item.image) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = item.image.includes('/') ? item.image.split('/').pop() : item.image;
                    const imageUrl = `${baseApiUrl}${fileName}`;
                    imgElement.src = imageUrl;
                    imgElement.onerror = function () {
                        console.error('Lỗi tải ảnh:', imageUrl);
                        this.src = defaultImagePath;
                    };
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    imgElement.src = defaultImagePath;
                }
            } else {
                imgElement.src = defaultImagePath;
            }
        }

        const modal = new bootstrap.Modal(document.getElementById("itemSelectionModal"), {});
        modal.show();
    } catch (error) {
        console.error(`Lỗi khi tải danh sách ${type}: ${error.message}`);
        itemContainer.innerHTML = "<p>Lỗi tải dữ liệu! Vui lòng thử lại.</p>";
    }
}

function toggleItemSelection(item, card) {
    const quantityInput = card.querySelector(".quantity-input");
    const index = selectedItems.findIndex(i => i.id === item.id);
    const selectedCount = document.getElementById("selectedCount");

    if (index === -1) {
        card.classList.add("selected");
        quantityInput.style.display = "block";
        selectedItems.push({
            ...item,
            quantity: parseInt(quantityInput.value),
            category: currentSelectionType
        });
    } else {
        card.classList.remove("selected");
        quantityInput.style.display = "none";
        selectedItems.splice(index, 1);
    }

    selectedCount.textContent = `Đã chọn: ${selectedItems.length} mục`;

    quantityInput.addEventListener("change", () => {
        const idx = selectedItems.findIndex(i => i.id === item.id);
        if (idx !== -1) {
            selectedItems[idx].quantity = parseInt(quantityInput.value);
        }
    }, { once: true });
}


function confirmItemSelection() {
    if (selectedItems.length > 0) {
        selectedItems.forEach(item => {
            if (item.category === "device") {
                addDeviceToTable(item, item.quantity);
            } else if (item.category === "service") {
                addServiceToTable(item, item.quantity);
            } else if (item.category === "location") {
                addLocationToTable(item);
            }
        });
        updateTotalCost();
        const modal = bootstrap.Modal.getInstance(document.getElementById("itemSelectionModal"));
        modal.hide();
    } else {
        Swal.fire({
            text: 'Vui lòng chọn ít nhất một mục!',
            icon: 'warning',
            confirmButtonColor: '#718355'
        });
    }
}

async function preloadEvent(eventData) {
    if (!eventData || !eventData.event) {
        console.error("Dữ liệu sự kiện không hợp lệ:", eventData);
        return;
    }

    const event = eventData.event;
    console.log("Dữ liệu sự kiện nhận được:", event);

    document.getElementById("contractName").value = event.name || "";
    //updateContractName();
    document.getElementById("customerName").value = "";
    document.getElementById("phoneNumber").value = "";

    const deviceTableBody = document.getElementById("deviceTableBody");
    deviceTableBody.innerHTML = "";
    if (event.device && event.device.length > 0) {
        console.log("Processing device rentals:", event.device);
        for (const item of event.device) {
            const device = {
                id: item.deviceID || Date.now().toString(),
                deviceName: item.deviceName || item.name || "Không xác định",
                deviceTypeName: item.deviceTypeName || item.description || "Không có mô tả",
                supplierName: item.supplierName || (item.userID ? (await fetchSupplier(item.userID))?.first_name + " " + (await fetchSupplier(item.userID))?.last_name : "Không xác định"),
                pricePerDay: item.pricePerDay || item.hourlyRentalFee || 0,
                quantity: item.quantity || 1,
                totalPrice: item.totalPrice || (item.pricePerDay || item.hourlyRentalFee || 0) * (item.quantity || 1),
                image: item.image || item.img || "assets/img/default-device.jpg",
                rental_id: item.rental_id || event.id
            };
            console.log("Adding device rental:", device);
            addDeviceToTable(device, device.quantity);
        }
    } else {
        console.warn("Không có dữ liệu device rentals trong sự kiện.");
    }

    const serviceTableBody = document.getElementById("serviceTableBody");
    serviceTableBody.innerHTML = "";
    if (event.service && event.service.length > 0) {
        console.log("Processing service rentals:", event.service);
        for (const item of event.service) {
            const supplier = item.userID ? await fetchSupplier(item.userID) : null;
            const service = {
                id: item.serviceID || Date.now().toString(),
                serviceName: item.serviceName || item.name || "Không xác định",
                supplierName: supplier ? `${supplier.first_name} ${supplier.last_name}` : item.supplierName || "Không xác định",
                pricePerDay: item.hourly_salary || item.pricePerDay || 0,
                totalPrice: item.totalPrice || (item.hourly_salary || item.pricePerDay || 0) * (item.quantity || 1),
                quantity: item.quantity || 1,
                image: item.image || item.img || "assets/img/default-service.jpg",
                rental_id: item.rental_id || event.id
            };
            console.log("Adding service rental:", service);
            addServiceToTable(service, service.quantity);
        }
    }

    const timelineBody = document.getElementById("timelineTableBody");
    // mới thêm
    if (!timelineBody) {
        console.error("Không tìm thấy timelineTableBody. Kiểm tra ID hoặc HTML.");
        return;
    }
    timelineBody.innerHTML = "";

    // if (!event?.timeline || event.timeline.length === 0) {
    //     console.warn("event.timeline rỗng hoặc không tồn tại:", event?.timeline);
    //     const row = document.createElement("tr");
    //     row.innerHTML = `<td colspan="2">Chưa có timeline</td>`;
    //     timelineBody.appendChild(row);
    //     return;
    // }
    // console.log("Processing timeline:", event.timeline);
    // event.timeline.forEach((item, index) => {
    //     console.log(`Timeline item ${index}:`, item);
    //     let startTime = "Chưa xác định";
    //     let description = item.description || "Không xác định";
    //     if (typeof item === "string" && item.includes(" - ")) {
    //         const [timeStr, desc] = item.split(" - ");
    //         startTime = timeStr.trim(); // Ví dụ: "14:00"
    //         description = desc.trim();
    //     } else if (item.time_start && item.description) {
    //         const date = new Date(item.time_start);
    //         startTime = isNaN(date.getTime()) ? "Thời gian không hợp lệ" : date.toLocaleString('vi-VN', { timeStyle: 'short' });
    //         description = item.description;
    //     }
    //     // Chỉ thêm hàng nếu startTime hợp lệ
    //     if (startTime !== "Chưa xác định" && startTime !== "Thời gian không hợp lệ") {
    //         const row = document.createElement("tr");
    //         row.innerHTML = `<td>${startTime}</td><td>${description}</td>`;
    //         timelineBody.appendChild(row);
    //     }
    // });
    if (!event?.timeline || event.timeline.length === 0) {
        console.warn("event.timeline rỗng hoặc không tồn tại:", event?.timeline);
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>Chưa xác định</td>
                <td>Chưa có timeline</td>
                <td>Chưa xác định</td>
                <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>`;
        timelineBody.appendChild(row);
        return;
    }

    event.timeline.forEach((item, index) => {
        console.log(`Timeline item ${index}:`, item);

        let startTime = "Chưa xác định";
        let description = item.description || "Không xác định";
        let dateStr = "Chưa xác định";


        if (typeof item === "string" && item.includes(" - ")) {
            const [timeStr, desc] = item.split(" - ");
            startTime = timeStr.trim();
            description = desc.trim();
        } else if (item.time_start && item.description) {
            const date = new Date(item.time_start);
            startTime = isNaN(date.getTime()) ? "Thời gian không hợp lệ" : date.toLocaleString('vi-VN', { timeStyle: 'short' });
            description = item.description;
            dateStr = date.toLocaleDateString('vi-VN');
        }

        if (startTime !== "Thời gian không hợp lệ") {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${startTime}</td><td>${description}</td><td>${dateStr}</td>`;
            timelineBody.appendChild(row);
        }
    });

    updateTotalCost();
}
async function preloadItem(item) {
    const { category, ...itemData } = item;

    let supplierName = 'Không xác định';
    if (itemData.userID) {
        const supplier = await fetchSupplier(itemData.userID);
        supplierName = supplier ? `${supplier.first_name} ${supplier.last_name}` : 'Không xác định';
    }

    const standardizedItem = {
        id: itemData.id || Date.now().toString(),
        name: itemData.name,
        description: itemData.description || "Không có mô tả",
        supplierName: supplierName,
        hourly_salary: itemData.hourly_salary || itemData.hourlyRentalFee || 0,
        hourlyRentalFee: itemData.hourlyRentalFee || 0,
        hourly_rental_fee: itemData.hourly_rental_fee || 0,
        img: itemData.img || itemData.image || "assets/img/default.jpg",
        place: itemData.place || "Không xác định",
        quantity: 1
    };

    if (category === "device") {
        addDeviceToTable(standardizedItem, standardizedItem.quantity);
    } else if (category === "service") {
        addServiceToTable(standardizedItem, standardizedItem.quantity);
    } else if (category === "location") {
        addLocationToTable(standardizedItem);
    }

    updateTotalCost();
}

// Hàm cập nhật quận/huyện
// function updateContractName() {
//     const eventId = document.getElementById('contractType').value;
//     const contractNameInput = document.getElementById('contractName');
//     const event = events.find(e => e.id == eventId);
//     if (event) {
//         contractNameInput.value = `Hợp đồng tổ chức ${event.name}`;
//     } else {
//         contractNameInput.value = '';
//     }
// }


function validateAndUpdateDates() {
    const startDateDisplay = document.getElementById('startDateDisplay');
    const endDateDisplay = document.getElementById('endDateDisplay');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const dateError = document.getElementById('dateError');


    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7);

    const startDate = parseDate(startDateDisplay.value || startDateInput.value);
    const endDate = parseDate(endDateDisplay.value || endDateInput.value);

    if (startDateDisplay.value && endDateDisplay.value) {
        if (startDate < minDate) {
            dateError.textContent = `Ngày bắt đầu phải từ sau 1 tuần từ ngày hiện tại`;
            dateError.style.display = 'block';
            startDateDisplay.value = '';
            startDateInput.value = '';
            return false;
        } else if (endDate < minDate) {
            dateError.style.display = 'block';
            endDateDisplay.value = '';
            endDateInput.value = '';
            return false;
        } else if (startDate > endDate) {
            dateError.textContent = 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc';
            dateError.style.display = 'block';
            startDateDisplay.value = '';
            endDateDisplay.value = '';
            startDateInput.value = '';
            endDateInput.value = '';
            return false;
        } else {
            dateError.style.display = 'none';
            startDateInput.value = toISODate(startDateDisplay.value);
            endDateInput.value = toISODate(endDateDisplay.value);
            updateLocationDates();
            return true;
        }
    }
    return true;
}

// Thêm thiết bị vào bảng
const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
const defaultImagePath = 'assets/img/default.jpg';

// function addDeviceToTable(device, quantity = 1) {
//     const row = document.createElement('tr');
//     const total = (device.hourlyRentalFee || 0) * quantity;
//     row.dataset.deviceId = device.id;
//     // Xử lý URL ảnh
//     let imageUrl = defaultImagePath;
//     if (device.image || device.img) {
//         try {
//             const fileName = (device.image || device.img).split('/').pop();
//             imageUrl = `${baseApiUrl}${fileName}`;
//         } catch (error) {
//             console.error('Lỗi xử lý ảnh dịch vụ:', error);
//             imageUrl = defaultImagePath;
//         }
//     }


//     row.innerHTML = `
//         <td><img src="${imageUrl}" alt="${device.name}" width="50" onerror="this.src='${defaultImagePath}'"></td>
//         <td>${device.name}</td>
//         <td>${device.description || 'Không có mô tả'}</td>
//         <td>${device.supplierName || 'Không xác định'}</td>
//         <td><input type="number" class="form-control" value="${quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
//         <td>${(device.hourlyRentalFee || 0).toLocaleString()} VNĐ</td>
//         <td>${total.toLocaleString()} VNĐ</td>
//         <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
//     `;
//     document.getElementById('deviceTableBody').appendChild(row);
// }


// Thêm dịch vụ vào bảng
function addDeviceToTable(device, quantity = 1) {
    // Chuẩn hóa dữ liệu đầu vào
    const normalizedDevice = {
        id: device.id || device.deviceId || Date.now().toString(),
        deviceName: device.deviceName || device.name || "Không xác định",
        deviceTypeName: device.deviceTypeName || device.description || "Không có mô tả",
        supplierName: device.supplierName || "Không xác định",
        pricePerDay: device.pricePerDay || device.hourlyRentalFee || 0,
        quantity: device.quantity || quantity,
        totalPrice: device.totalPrice || (device.pricePerDay || device.hourlyRentalFee || 0) * (device.quantity || quantity),
        image: device.image || device.img || "assets/img/default-device.jpg"
    };

    const row = document.createElement('tr');
    row.dataset.deviceId = normalizedDevice.id;

    // Xử lý URL ảnh
    let imageUrl = 'assets/img/default-device.jpg';
    if (normalizedDevice.image) {
        try {
            const fileName = normalizedDevice.image.split('/').pop();
            imageUrl = `${baseApiUrl}${fileName}`;
        } catch (error) {
            console.error('Lỗi xử lý ảnh thiết bị:', error);
            imageUrl = 'assets/img/default-device.jpg';
        }
    }

    // Sử dụng formatCurrency nếu có, nếu không dùng toLocaleString
    const formatPrice = typeof formatCurrency === 'function'
        ? formatCurrency
        : (value) => (value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    row.innerHTML = `
        <td><img src="${imageUrl}" onerror="this.src='assets/img/default-device.jpg'" alt="${normalizedDevice.deviceName}" style="max-width: 50px;"></td>
        <td>${normalizedDevice.deviceName}</td>
        <td>${normalizedDevice.deviceTypeName}</td>
        <td>${normalizedDevice.supplierName}</td>
        <td><input type="number" class="form-control" value="${normalizedDevice.quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
        <td>${formatPrice(normalizedDevice.pricePerDay)}</td>
        <td>${formatPrice(normalizedDevice.totalPrice)}</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
    `;
    document.getElementById('deviceTableBody').appendChild(row);
}
// function addServiceToTable(service, quantity = 1) {
//     const row = document.createElement('tr');
//     const total = (service.hourly_salary || 0) * quantity;
//     row.dataset.serviceId = service.id;

//     // Xử lý URL ảnh
//     let imageUrl = defaultImagePath;
//     if (service.image || service.img) {
//         try {
//             const fileName = (service.image || service.img).split('/').pop();
//             imageUrl = `${baseApiUrl}${fileName}`;
//         } catch (error) {
//             console.error('Lỗi xử lý ảnh dịch vụ:', error);
//             imageUrl = defaultImagePath;
//         }
//     }

//     row.innerHTML = `
//         <td><img src="${imageUrl}" alt="${service.name}" width="50" onerror="this.src='${defaultImagePath}'"></td>
//         <td>${service.name}</td>
//         <td>${service.description || 'Không có mô tả'}</td>
//         <td>${service.supplierName || 'Không xác định'}</td>
//         <td><input type="number" class="form-control" value="${quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
//         <td>${(service.hourly_salary || 0).toLocaleString()} VNĐ</td>
//         <td>${total.toLocaleString()} VNĐ</td>
//         <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
//     `;
//     document.getElementById('serviceTableBody').appendChild(row);
// }

// Thêm địa điểm vào bảng

function addServiceToTable(service, quantity = 1) {
    // Chuẩn hóa dữ liệu đầu vào
    const normalizedService = {
        id: service.id || service.serviceId || Date.now().toString(),
        name: service.serviceName || service.name || "Không xác định",
        description: service.description || "Không có mô tả",
        supplierName: service.supplierName || "Không xác định",
        unitPrice: service.pricePerDay || service.hourly_salary || 0,
        quantity: service.quantity || quantity,
        totalPrice: service.totalPrice || (service.pricePerDay || service.hourly_salary || 0) * (service.quantity || quantity),
        image: service.image || service.img || "assets/img/default-service.jpg"
    };

    const row = document.createElement('tr');
    row.dataset.serviceId = normalizedService.id;

    // Xử lý URL ảnh
    let imageUrl = 'assets/img/default-service.jpg';
    if (normalizedService.image) {
        try {
            const fileName = normalizedService.image.split('/').pop();
            imageUrl = `${baseApiUrl}${fileName}`;
        } catch (error) {
            console.error('Lỗi xử lý ảnh dịch vụ:', error);
            imageUrl = 'assets/img/default-service.jpg';
        }
    }

    // Sử dụng formatCurrency nếu có, nếu không dùng toLocaleString
    const formatPrice = typeof formatCurrency === 'function'
        ? formatCurrency
        : (value) => (value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    row.innerHTML = `
        <td><img src="${imageUrl}" onerror="this.src='assets/img/default-service.jpg'" alt="${normalizedService.name}" style="max-width: 50px;"></td>
        <td>${normalizedService.name}</td>
        <td>${normalizedService.description}</td>
        <td>${normalizedService.supplierName}</td>
        <td><input type="number" class="form-control" value="${normalizedService.quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
        <td>${formatPrice(normalizedService.unitPrice)}</td>
        <td>${formatPrice(normalizedService.totalPrice)}</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
    `;
    document.getElementById('serviceTableBody').appendChild(row);
}
function addLocationToTable(location) {
    const startDate = document.getElementById('startDateDisplay').value;
    const endDate = document.getElementById('endDateDisplay').value;
    let diffDays = 0;
    if (startDate && endDate) {
        const startDateObj = parseDate(startDate);
        const endDateObj = parseDate(endDate);
        const diffTime = Math.abs(endDateObj - startDateObj);
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    const row = document.createElement('tr');
    row.dataset.locationId = location.id;

    // Xử lý URL ảnh
    let imageUrl = defaultImagePath;
    if (location.img || location.image) {
        try {
            const fileName = (location.img || location.image).split('/').pop();
            imageUrl = `${baseApiUrl}${fileName}`;
        } catch (error) {
            console.error('Lỗi xử lý ảnh địa điểm:', error);
            imageUrl = defaultImagePath;
        }
    }

    row.innerHTML = `
        <td><img src="${imageUrl}" alt="${location.name}" width="50" onerror="this.src='${defaultImagePath}'"></td>
        <td>${location.name}</td>
        <td>${location.supplierName || 'Không xác định'}</td>
        <td>${startDate || 'Chưa xác định'}</td>
        <td>${endDate || 'Chưa xác định'}</td>
        <td>${diffDays || 'Chưa xác định'}</td>
        <td>${(location.hourly_rental_fee || 0).toLocaleString()} VNĐ</td>
        <td>${diffDays ? ((location.hourly_rental_fee || 0) * diffDays).toLocaleString() : '0'} VNĐ</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
    `;
    document.getElementById('locationTableBody').appendChild(row);
}
// Cập nhật chi phí hàng
function updateRowCost(input) {
    const row = input.closest('tr');
    const quantity = parseInt(input.value);
    const unitPrice = parseInt(row.children[5].textContent.replace(/[^0-9]/g, ''));
    const total = unitPrice * quantity;
    row.children[6].textContent = total.toLocaleString() + ' VNĐ';
    updateTotalCost();
}


function removeRow(btn) {
    btn.parentNode.parentNode.remove();
    updateTotalCost();
}


function updateTotalCost() {
    let total = 0;
    const deviceRows = document.getElementById('deviceTableBody').children;
    const serviceRows = document.getElementById('serviceTableBody').children;
    const locationRows = document.getElementById('locationTableBody').children;
    for (let row of deviceRows) total += parseInt(row.children[6].textContent.replace(/[^0-9]/g, ''));
    for (let row of serviceRows) total += parseInt(row.children[6].textContent.replace(/[^0-9]/g, ''));
    for (let row of locationRows) total += parseInt(row.children[7].textContent.replace(/[^0-9]/g, '')) || 0;
    document.getElementById('totalCost').textContent = `${total.toLocaleString()} VNĐ`;
}

function addTimeline() {
    const dateStr = document.getElementById('timelineDateDisplay').value;
    const timeStr = document.getElementById('timelineTime').value;
    const description = document.getElementById('timelineDescription').value;

    const row = document.createElement('tr');
    row.innerHTML = `
        <th>${timeStr}</th>
        <th>${description}</th>
        <th>${dateStr}</th>
        <th><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></th>
    `;
    document.getElementById('timelineTableBody').appendChild(row);
}
// Kết hợp địa chỉ
function getFullAddress() {
    const provinceId = document.getElementById('province').value;
    const districtId = document.getElementById('district').value;
    const wardId = document.getElementById('ward').value;
    const addressDetail = document.getElementById('addressDetail').value;

    const province = provinces.find(p => p.id == provinceId)?.name || '';
    const district = document.getElementById('district').selectedOptions[0]?.text || '';
    const ward = document.getElementById('ward').selectedOptions[0]?.text || '';

    return [addressDetail, ward, district, province].filter(Boolean).join(', ');
}
async function createEvent(eventdata, file) {
    try {
        const formData = new FormData();

        // Gửi object JSON chỉ có name
        //const eventData = { name: eventdata.name };
        formData.append(
            "event",
            new Blob([JSON.stringify(eventdata)], { type: "application/json" })
        );

        if (file) {
            formData.append("file", file);
        }
        const response = await fetch(`${EVENT_API_URL}/create-event`, {
            method: "POST",
            body: formData
        });
        console.log("Response from create event:", response);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tạo sự kiện thất bại: ${errorText}`);
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        alert("Lỗi khi tạo event: " + error.message);
        throw error;
    }
}

async function saveContract() {
    // Kiểm tra ngày giờ
    if (!validateAndUpdateDates()) {
        alert('Vui lòng kiểm tra lại thời gian tổ chức!');
        console.error('Lỗi: Thời gian tổ chức không hợp lệ');
        return;
    }

    // Lấy dữ liệu từ form
    const customerName = document.getElementById('customerName').value?.trim();
    const phoneNumber = document.getElementById('phoneNumber').value?.trim();
    const dropdown = document.getElementById('eventType');
    const eventId = dropdown ? dropdown.value?.trim() : '';
    const contractName = document.getElementById('contractName').value?.trim();
    const totalCost = document.getElementById('totalCost').textContent.replace(/[^0-9]/g, '');
    let event;
    try {
        if (!eventId) {
            throw new Error("Vui lòng chọn loại sự kiện!");
        }
        event = await createEvent({
            name: contractName,
            eventType_id: eventId
        }, null);
        // alert("Tạo event thành công! ID: " + event.id + " Name: " + event.name);
        localStorage.setItem('eventId', event.id);
    } catch (error) {
        console.log("Lỗi tạo sự kiện :", error);
        alert("Lỗi khi tạo sự kiện: " + error.message);
        return;
    }


    // Kiểm tra dữ liệu bắt buộc
    if (!customerName || !phoneNumber || !eventId || !contractName || !totalCost) {
        Swal.fire({
            icon: 'warning',
            text: 'Vui lòng nhập đầy đủ thông tin: tên khách hàng, số điện thoại, loại sự kiện, tên hợp đồng!',
        });
        console.error('Lỗi: Thiếu dữ liệu bắt buộc', { customerName, phoneNumber, eventId, contractName, totalCost });
        return;
    }
    var user = JSON.parse(localStorage.getItem("user"));
    console.log("user:", user);

    // Tạo payload cho customer
    const customer = {
        // id: user?.id || null, // ID của người dùng nếu có, nếu không thì null
        name: customerName,
        phoneNumber: phoneNumber.replace(/[^0-9]/g, ''), // Đảm bảo chỉ chứa số
        address: getFullAddress() || 'Chưa cung cấp địa chỉ'

    };

    // Tạo payload cho rental
    const rental = {
        customLocation: document.getElementById('providerLocation').checked ? null : document.getElementById('customLocationAddress').value?.trim() || 'Chưa cung cấp',
        rentalStartTime: toISODate(document.getElementById('startDateDisplay').value),
        rentalEndTime: toISODate(document.getElementById('endDateDisplay').value),
        totalPrice: parseInt(totalCost) || 0,
        eventId: event.id,
        userId: user?.id, // Sẽ được gán sau khi kiểm tra khách hàng
    };

    // Lấy danh sách thiết bị, dịch vụ, địa điểm và lịch trình
    const deviceRentals = Array.from(document.getElementById('deviceTableBody')?.children || []).map(row => ({
        deviceId: row.dataset.deviceId,
        quantity: parseInt(row.children[4]?.querySelector('input')?.value) || 1,
        rentalId: row.dataset.rentalId || null // Nếu có, nếu không thì null
        // rentalId: row.dataset.rentalId
    })).filter(item => item.deviceId && item.quantity);
    console.log('Device Rentals lưu xuống:', JSON.stringify(deviceRentals));

    const serviceRentals = Array.from(document.getElementById('serviceTableBody')?.children || []).map(row => ({
        serviceId: row.dataset.serviceId,
        quantity: parseInt(row.children[4]?.querySelector('input')?.value) || 1,
        rentalId: row.dataset.rentalId || null // Nếu có, nếu không thì null
        // rentalId: row.dataset.rentalId
    })).filter(item => item.serviceId && item.quantity > 0);
    console.log('service Rentals lưu xuống:', JSON.stringify(serviceRentals));

    const locationRentals = Array.from(document.getElementById('locationTableBody')?.children || []).map(row => ({
        locationId: row.dataset.locationId,
        quantity: 1,
        rentalId: row.dataset.rentalId || null // Nếu có, nếu không thì null
    })).filter(item => item.locationId);
    console.log('location Rentals lưu xuống:', JSON.stringify(locationRentals));

    const eventStartDate = document.getElementById('timelineTableBody').value?.trim(); // Ví dụ: "11/05/2025"

    // const timelines = Array.from(document.getElementById('timelineTableBody').children).map(row => {
    //     const timeStr = row.children[0].textContent;
    //     const dateStr = row.children[2].textContent; // Lấy từ cột ẩn
    //     const description = row.children[1].textContent;

    //     console.log("Minh2: ", toISODateTime(dateStr, timeStr));
    //     return {
    //         description: description,
    //         time_start: toISODateTime(dateStr, timeStr)
    //     };
    // }).filter(item => item && item.description && item.time_start);
    const timelines = Array.from(document.getElementById('timelineTableBody').children).map(row => {
        if (row.children.length < 3) {
            console.warn("Hàng timeline không đủ cột:", row);
            return null;
        }

        const timeStr = row.children[0].textContent;
        const dateStr = row.children[2].textContent;
        const description = row.children[1].textContent;

        if (description === "Chưa có timeline") {
            return null;
        }

        console.log("Minh2: ", toISODateTime(dateStr, timeStr));
        return {
            description: description,
            time_start: toISODateTime(dateStr, timeStr)
        };
    }).filter(item => item && item.description && item.time_start);



    console.log('timeline lưu xuống:', JSON.stringify(timelines));
    try {
        let customerId;

        try {
            const customerResponse = await fetchData(CUSTOMER_API_URL, 'POST', customer);
            customerId = customerResponse.result.id;
            console.log('Khách hàng mới đã được lưu:', customerResponse);
        } catch (customerError) {
            const errorDetail = customerError.message || 'Không xác định';
            alert(`Lỗi khi lưu khách hàng: ${errorDetail}`);
            throw new Error(`Lưu khách hàng thất bại: ${errorDetail}`);
        }

        console.log('customerId:', customerId);

        // Lưu hợp đồng (rental)
        const rentalResponse = await fetchData(RENTAL_API_URL, 'POST', rental);
        console.log("rental response:", rentalResponse);

        if (!rentalResponse.id) {
            throw new Error('Lưu rental thất bại: Không nhận được ID từ server');
        }
        console.log('rental đã được lưu:', rentalResponse);
        const rentalId = rentalResponse.id;
        deviceRentals.forEach(item => item.rentalId = rentalId);
        serviceRentals.forEach(item => item.rentalId = rentalId);
        locationRentals.forEach(item => item.rentalId = rentalId);
        timelines.forEach(item => item.rental_id = rentalId);

        // Tạo payload cho contract
        const contract = {

            rentalId: rentalResponse.id,
            name: contractName,
            paymentIntentId: null, // Giả định giá trị tạm, thay bằng logic thanh toán thực tế
            address: rental.customLocation?.address || getFullAddress() || 'Chưa cung cấp',
            customerName: customerName,
            customerPhone: phoneNumber,
            status: 'Draft'
        };

        // Lưu contract
        console.log("contract:", contract);
        const contractResponse = await fetchData(CONTRACT_API_URL, 'POST', contract);
        console.log('Hợp đồng đã được lưu vào bảng contract:', contractResponse);

        // Lưu danh sách thiết bị
        for (const deviceRental of deviceRentals) {
            const payload = {
                ...deviceRental,
                rentalId: rentalResponse.id
            };
            console.log("Hạnh : ", payload);
            try {
                const response = await fetchData(DEVICE_RENTAL_API_URL, 'POST', payload);
                console.log('Device rental saved:', response);
            } catch (error) {
                console.error('Lỗi khi lưu device rental:', error);
            }
        }

        for (const serviceRental of serviceRentals) {
            const payload = {
                ...serviceRental,
                rentalId: rentalResponse.id
            };
            try {
                const response = await fetchData(SERVICE_RENTAL_API_URL, 'POST', payload);
                console.log('Service rental saved:', response);
            } catch (error) {
                console.error('Lỗi khi lưu service rental:', error);
            }
        }

        for (const locationRental of locationRentals) {
            const payload = {
                ...locationRental,
                rentalId: rentalResponse.id
            };
            try {
                const response = await fetchData(LOCATION_RENTAL_API_URL, 'POST', payload);
                console.log('Location rental saved:', response);
            } catch (error) {
                console.error('Lỗi khi lưu location rental:', error);
            }
        }


        // Lưu danh sách lịch trình
        for (const timeline of timelines) {
            const payload = {
                ...timeline,
                rental_id: rentalResponse.id
            };
            try {
                const response = await fetchData(`${TIMELINE_API_URL}/new`, 'POST', payload);
                console.log('Timeline saved:', response);
            } catch (error) {
                console.error('Lỗi khi lưu timeline:', error);
            }
        }


        // Gửi thông báo đến parent window (nếu có)
        if (window.parent && typeof window.parent.postMessage === 'function') {
            window.parent.postMessage({
                type: 'newContract',
                contract: {
                    id: contractResponse.id,
                    name: contract.name,  // Sử dụng contract đã khai báo
                    totalPrice: rentalResponse.totalPrice,
                    rentalStartTime: rentalResponse.rentalStartTime,
                    rentalEndTime: rentalResponse.rentalEndTime,
                    status: contract.status  // Sử dụng contract đã khai báo
                }
            }, '*');
        }

        Swal.fire({
            icon: 'success',
            text: 'Hợp đồng đã được lưu thành công!',
        });
        closeModal();
        window.parent.location.href = "ListContract.html";
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
    }
    console.log("Customer payload:", JSON.stringify(customer));
    console.log("Rental payload:", JSON.stringify(rental));
    console.log("Device Rentals payload:", JSON.stringify(deviceRentals));
    console.log("Service Rentals payload:", JSON.stringify(serviceRentals));
    console.log("Location Rentals payload:", JSON.stringify(locationRentals));
    console.log("Timelines payload:", JSON.stringify(timelines));

}


// Cập nhật ngày địa điểm
function updateLocationDates() {
    const startDate = document.getElementById('startDateDisplay').value;
    const endDate = document.getElementById('endDateDisplay').value;
    if (!startDate || !endDate) return;

    const startDateObj = parseDate(startDate);
    const endDateObj = parseDate(endDate);
    const diffTime = Math.abs(endDateObj - startDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const locationRows = document.getElementById('locationTableBody').children;
    for (let row of locationRows) {
        row.children[3].textContent = startDate;
        row.children[4].textContent = endDate;
        row.children[5].textContent = diffDays;
        row.children[7].textContent = (parseInt(row.children[6].textContent.replace(/[^0-9]/g, '')) * diffDays).toLocaleString() + ' VNĐ';
    }
    updateTotalCost();
}

// Hiển thị/ẩn form địa điểm
function toggleLocationForm() {
    const providerForm = document.getElementById('providerLocationForm');
    const customerForm = document.getElementById('customerLocationForm');
    const isProvider = document.getElementById('providerLocation').checked;
    providerForm.classList.toggle('active', isProvider);
    customerForm.classList.toggle('active', !isProvider);
}

// Đóng modal
function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('contractModal'));
    modal.hide();
    if (window.parent) window.parent.postMessage('closeIframe', '*');
}


async function fetchData(url, method = "GET", data = null) {
    const token = getToken();
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${token}`
        }
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`${method} thất bại! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', initializeContractForm);