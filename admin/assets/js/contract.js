var ContractAPI = 'http://localhost:8080/event-management/api/contracts';
var RentalAPI = 'http://localhost:8080/event-management/rentals';
const BASE_URL = "http://localhost:8080/event-management";
const CUSTOMER_API_URL = `${BASE_URL}/customers`;
const EVENT_API_URL = `${BASE_URL}/event`;
const DEVICE_API_URL = `${BASE_URL}/devices`;
const SERVICE_API_URL = `${BASE_URL}/services`;
const LOCATION_API_URL = `${BASE_URL}/locations`;
const USER_API_URL = `${BASE_URL}/users`;
const DEVICE_RENTAL_API_URL = `${BASE_URL}/api/device-rentals`;
const SERVICE_RENTAL_API_URL = `${BASE_URL}/api/service-rentals`;
const LOCATION_RENTAL_API_URL = `${BASE_URL}/api/location-rentals`;
const TIMELINE_API_URL = `${BASE_URL}/timelines`;
const baseApiUrl = `${BASE_URL}/api/v1/FileUpload/files/`;

const ContractStatus = {
    Draft: "Draft",
    DepositPaid: "DepositPaid",
    InProgress: "InProgress",
    WaitingPaid: "WaitingPaid",
    Completed: "Completed",
    Cancel: "Cancel",
    AdminCancel: "AdminCancel"
};

function getStatusInfo(status) {
    switch (status) {
        case ContractStatus.Draft:
            return { text: "Nháp", color: "black" };
        case ContractStatus.DepositPaid:
            return { text: "Đã Đặt cọc", color: "green" };
        case ContractStatus.InProgress:
            return { text: "Đang thực hiện", color: "blue" };
        case ContractStatus.WaitingPaid:
            return { text: "Chờ thanh toán", color: "orange" };
        case ContractStatus.Completed:
            return { text: "Hoàn thành", color: "orange" };
        case ContractStatus.Cancel:
            return { text: "Hủy", color: "red" };
        case ContractStatus.AdminCancel:
            return { text: "Bị hủy bởi admin", color: "red" };
        default:
            return { text: "Không xác định", color: "gray" };
    }
}
function getLighterColor(color) {
    const colorMap = {
        black: "rgba(0, 0, 0, 0.1)",
        green: "rgba(68, 158, 68, 0.1)",
        blue: "rgba(94, 163, 206, 0.1)",
        orange: "rgba(206, 159, 73, 0.1)",
        red: "rgba(212, 81, 81, 0.1)",
        gray: "rgba(128, 128, 128, 0.1)"
    };
    return colorMap[color] || "rgba(128, 128, 128, 0.1)"; // Mặc định là màu xám nhạt nếu không xác định
}

function start() {
    getData((contract, rental) => {
        renderContracts(contract, rental);
    });

    // // Khởi tạo modal
    // initializeModal();
}

start();

// function getData(callback) {
//     let token = localStorage.getItem("token"); // Lấy token từ localStorage

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }

//     Promise.all([
//         fetch(ContractAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),

//         // fetch(CustomerAPI, {
//         //     headers: {
//         //         "Authorization": `Bearer ${token}`,
//         //         "Content-Type": "application/json"
//         //     }
//         // }).then(res => res.json()),

//         fetch(RentalAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),
//     ])
//         .then(([contract, rental]) => {
//             callback(contract, rental);
//         })
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }

// Status contract
function getData(callback) {
    let token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(ContractAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Lỗi ContractAPI: ${res.status}`);
                return res.json();
            }),
        fetch(RentalAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Lỗi RentalAPI: ${res.status}`);
                return res.json();
            }),
    ])
        .then(([contractData, rentalData]) => {
            // Chuẩn hóa dữ liệu hợp đồng
            let contracts = contractData.result || contractData.data?.items || contractData.data || contractData || [];
            if (!Array.isArray(contracts)) {
                contracts = [];
            }

            // Chuẩn hóa dữ liệu rental
            let rentals = Array.isArray(rentalData) ? rentalData : rentalData.data || rentalData.result || [];
            if (!Array.isArray(rentals)) {
                rentals = [];
            }
            callback(contracts, rentals);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy dữ liệu: " + error.message);
            callback([], []); // Fallback về mảng rỗng
        });
}
function renderContracts(contracts, rentals) {
    var listContractsBlock = document.querySelector('#list-contact tbody');
    if (!listContractsBlock) {
        console.warn("Không tìm thấy #list-contact tbody trong DOM");
        return;
    }

    if ($.fn.DataTable.isDataTable('#list-contact')) {
        $('#list-contact').DataTable().destroy();
    }

    if (!Array.isArray(contracts)) {
        console.error("contracts không phải mảng:", contracts);
        listContractsBlock.innerHTML = `<tr><td colspan="8">Không có dữ liệu hợp đồng</td></tr>`;
        return;
    }

    var htmls = contracts.map(function (contract) {
        var rental = rentals.find(r => r.id === contract.rentalId);
        var totalPrice = rental ? rental.totalPrice.toLocaleString() + " VND" : "0 VND";
        var rentalStartTime = rental ? new Date(rental.rentalStartTime).toLocaleDateString() : "N/A";
        var rentalEndTime = rental ? new Date(rental.rentalEndTime).toLocaleDateString() : "N/A";
        const statusInfo = getStatusInfo(contract.status) || { text: "Không xác định", color: "gray" };

        // Tùy chỉnh nội dung dropdown dựa trên trạng thái
        let dropdownContent = '';
        if (contract.status === ContractStatus.InProgress) {
            dropdownContent = `
                <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
                <button class="dropdown-item waitingpaid-btn" data-id="${contract.id}">Chờ thanh toán</button>
                <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
            `;
        } else if (contract.status === ContractStatus.WaitingPaid) {
            dropdownContent = `
                <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
                <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
            `;
        } else {
            dropdownContent = `
                <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
                <button class="dropdown-item inprogress-btn" data-id="${contract.id}">Đang thực hiện</button>
                <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
               
            `;
        }

        return `
            <tr class="list-contract-${contract.id}">
                <td>${contract.name}</td>
                <td>${contract.customerName}</td>
                <td>${totalPrice}</td>
                <td>
                    <span class="status-label" style="color: ${statusInfo.color}; background-color: ${getLighterColor(statusInfo.color)};">
                        ${statusInfo.text}
                    </span>
                </td>
                <td>${rentalStartTime}</td>
                <td>${rentalEndTime}</td>
                <td>${new Date(contract.created_at || contract.createdAt).toLocaleDateString()}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content" style="display: none;">
                            ${dropdownContent}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listContractsBlock.innerHTML = htmls.join('');

    $('#list-contact').DataTable({
        "order": [[6, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ hợp đồng",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ hợp đồng",
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

    // Gắn sự kiện cho nút action-btn
    $('#list-contact tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        console.log("Nội dung dropdown:", dropdown.html()); // Debug nội dung
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-contact tbody').on('click', '.cancel-btn', function () {
        let contractId = $(this).data('id');
        handleCancelContract(contractId);
    });
    $('#list-contact tbody').on('click', '.inprogress-btn', function () {
        let contractId = $(this).data('id');
        handleInProgressContract(contractId);
    });
    $('#list-contact tbody').on('click', '.waitingpaid-btn', function () {
        let contractId = $(this).data('id');
        handleWaitingPaidContract(contractId);
    });

    // $('#list-contact tbody').on('click', '.update-btn', function () {
    //     let contractId = $(this).data('id');
    //     handleUpdateContract(contractId);
    // });

    $('#list-contact tbody').on('click', '.detail-btn', function () {
        let contractId = $(this).data('id');
        handleDetailContract(contractId);
    });

    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}
// Khởi tạo modal

// Cập nhật trạng thái hợp đồng qua API
function updateContractStatus(contractId, status, callback) {
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        callback(false);
        return;
    }

    // Log dữ liệu gửi đi để debug
    console.log("Cập nhật trạng thái hợp đồng:", { contractId, status });

    fetch(`${ContractAPI}/${contractId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status }) // Status là chuỗi, không cần parseInt
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Lỗi HTTP: ${res.status}`);
            }
            return res.json();

        })
        .then(data => {
            console.log("Phản hồi từ API:", data); // Log phản hồi để debug
            callback(true);
            updateContractRow(contractId, status);
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật trạng thái hợp đồng:", error);
            // alert("Lỗi khi cập nhật trạng thái hợp đồng: " + error.message);
            console.log("Cập nhật trạng thái hợp đồng 2:", { contractId, status });
            callback(false);
        });
}
function updateContractRow(contractId, newStatus) {
    let row = document.querySelector(`.list-contract-${contractId}`);
    if (row) {
        // Cập nhật cột trạng thái
        let statusCell = row.querySelector('td:nth-child(4) .status-label');
        let statusInfo = getStatusInfo(newStatus) || { text: "Không xác định", color: "gray" };
        statusCell.style.color = statusInfo.color;
        statusCell.style.backgroundColor = getLighterColor(statusInfo.color);
        statusCell.textContent = statusInfo.text;

        // Tùy chỉnh nội dung dropdown dựa trên trạng thái mới
        let dropdownContent = '';
        if (contract.status === ContractStatus.InProgress) {
            dropdownContent = `
                <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
                <button class="dropdown-item waitingpaid-btn" data-id="${contract.id}">Chờ thanh toán</button>
                <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
            `;
        } else if (contract.status === ContractStatus.WaitingPaid) {
            dropdownContent = `
                <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
                <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
            `;
        } else {
            dropdownContent = `
                <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
                <button class="dropdown-item inprogress-btn" data-id="${contract.id}">Đang thực hiện</button>
                <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
               
            `;
        }

        let dropdown = row.querySelector('.dropdown-content');
        dropdown.innerHTML = dropdownContent;
        console.log("Cập nhật dropdown:", dropdown.innerHTML); // Debug nội dung dropdown
    } else {
        console.warn(`Không tìm thấy hàng với contractId: ${contractId}`);
        // Fallback: Làm mới toàn bộ bảng nếu không tìm thấy hàng
        getData((contract, rental) => {
            renderContracts(contract, rental);
        });
    }
}

// Xử lý hủy hợp đồng (chuyển trạng thái sang AdminCancel)
function handleCancelContract(contractId) {
    updateContractStatus(contractId, ContractStatus.AdminCancel, (success) => {
        if (success) {
            alert("Hợp đồng đã bị hủy bởi hệ thống. Trong trường hợp khách hàng đã đặt cọc, tiền đặt cọc sẽ được hoàn trả lại cho khách hàng.");
            // Làm mới bảng
            updateContractRow(contractId, ContractStatus.AdminCancel);
        }
    });
}

function handleInProgressContract(contractId) {
    updateContractStatus(contractId, ContractStatus.InProgress, (success) => {
        if (success) {
            alert("Hợp đồng đã được duyệt và sẽ được tiến hành thực hiện.");
            // Làm mới bảng
            updateContractRow(contractId, ContractStatus.InProgress);
        }
    });
}

function handleWaitingPaidContract(contractId) {
    updateContractStatus(contractId, ContractStatus.WaitingPaid, (success) => {
        if (success) {
            alert("Hợp đồng đã được duyệt và đang chờ thanh toán.");
            // Làm mới bảng
            updateContractRow(contractId, ContractStatus.WaitingPaid);
        }
    });
}
//Xem hợp đồng
function handleDetailContract(contractId) {
    localStorage.setItem("editContractId", contractId);
    window.location.href = "detail_contract.html";
}

// function watchDetailContract(editContractId) {
//     if (!editContractId) {
//         console.error("Không có ID hợp đồng để xem chi tiết!");
//         return;
//     }

//     console.log("Xem chi tiết hợp đồng ID:", editContractId);

//     const token = localStorage.getItem("token");
//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }

//     fetch(`http://localhost:8080/event-management/api/contracts/${editContractId}`, { // Đổi endpoint
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         }
//     })
//         .then(response => {
//             if (!response.ok) throw new Error(`Lỗi khi lấy dữ liệu hợp đồng: ${response.status}`);
//             return response.json();
//         })
//         .then(data => {
//             // Chuẩn hóa dữ liệu hợp đồng giống getData
//             const contract = data.result || data.data || data || {};
//             console.log("Dữ liệu hợp đồng:", contract);
//             if (!contract.id) {
//                 throw new Error("Dữ liệu hợp đồng không hợp lệ!");
//             }
//             return { contract };
//         })
//         .then(({ contract }) => {
//             return fetch(RentalAPI, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             })
//                 .then(response => {
//                     if (!response.ok) throw new Error(`Lỗi RentalAPI: ${response.status}`);
//                     return response.json();
//                 })
//                 .then(rentals => {
//                     // Chuẩn hóa rentals giống getData
//                     rentals = Array.isArray(rentals) ? rentals : rentals.data || rentals.result || [];
//                     return { contract, rentals };
//                 });
//         })
//         .then(({ contract, rentals }) => {
//             // const customer = customers.find(c => c.id === contract.customer_id);
//             // const customerName = customer ? customer.name : "Không xác định";
//             // const customerPhone = customer ? customer.phone_number : "N/A";
//             // const customerAddress = customer ? customer.address : "N/A";
//             console.log("tên hợp đồng:", contract.n);
//             const rental = rentals.find(r => r.id === contract.rentalId);
//             const totalPrice = rental ? rental.totalPrice.toLocaleString() + " ₫" : "0 ₫";
//             const rentalStartTime = rental ? new Date(rental.rentalStartTime).toLocaleDateString() : "N/A";
//             const rentalEndTime = rental ? new Date(rental.rentalEndTime).toLocaleDateString() : "N/A";

//             // Dùng status dạng chuỗi, thêm fallback
//             const statusInfo = getStatusInfo(contract.status) || { text: "Không xác định", color: "gray" };

//             // Cập nhật giao diện, giữ nguyên các trường mi đã comment
//             document.getElementById("status").textContent = statusInfo.text;
//             document.getElementById("name").textContent = contract.name || "Hợp đồng không xác định";
//             document.getElementById("RentalStart").textContent = rentalStartTime;
//             document.getElementById("RentalEnd").textContent = rentalEndTime;
//             document.getElementById("price").textContent = totalPrice;
//             document.getElementById("customerName").textContent = contract.customerName || "Khách hàng không xác định";
//             document.getElementById("phone").textContent = contract.customerPhone;
//             document.getElementById("address").textContent = contract.address || "Địa chỉ không xác định";

//             const statusElement = document.getElementById("status");
//             statusElement.style.color = statusInfo.color;
//             statusElement.style.backgroundColor = getLighterColor(statusInfo.color);
//         })
//         .catch(error => {
//             console.error("Lỗi khi lấy dữ liệu chi tiết hợp đồng:", error);
//             alert("Không thể tải thông tin hợp đồng!");
//         });
// }
///////////////////////////___________________________________________________________________________________
// Định dạng tiền và ngày (đã có sẵn trong code của bạn)
// Biến toàn cục
let currentContract = null;

// Hàm định dạng tiền và ngày
function dinhDangTien(giaTri) {
    return (giaTri || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDate(dateStr) {
    if (!dateStr) return 'Chưa xác định';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Chưa xác định';
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'Chưa xác định';
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return 'Chưa xác định';
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Hàm watchDetailContract (giữ nguyên như bạn cung cấp)
function watchDetailContract(editContractId) {
    if (!editContractId) {
        console.error("Không có ID hợp đồng để xem chi tiết!");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(`http://localhost:8080/event-management/api/contracts/${editContractId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`Lỗi khi lấy dữ liệu hợp đồng: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const contract = data.result || data.data || data || {};
            if (!contract.id) {
                throw new Error("Dữ liệu hợp đồng không hợp lệ!");
            }
            return { contract };
        })
        .then(({ contract }) => {
            return fetch(RentalAPI, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error(`Lỗi RentalAPI: ${response.status}`);
                    return response.json();
                })
                .then(rentals => {
                    rentals = Array.isArray(rentals) ? rentals : rentals.data || rentals.result || [];
                    return { contract, rentals };
                });
        })
        .then(async ({ contract, rentals }) => {
            const rental = rentals.find(r => r.id === contract.rentalId);
            if (!rental) throw new Error("Không tìm thấy rental tương ứng với hợp đồng!");

            // Lấy dữ liệu thiết bị, dịch vụ, địa điểm, lịch trình
            const deviceRentals = await fetch(`${DEVICE_RENTAL_API_URL}/rental/${rental.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json());
            const devicesData = deviceRentals.result?.map(rental => ({
                quantity: rental.quantity,
                name: rental.deviceName || 'Không xác định',
                hourly_salary: rental.pricePerDay || 0,
                supplierName: rental.supplierName || 'Không xác định'
            })) || [];

            const serviceRentals = await fetch(`${SERVICE_RENTAL_API_URL}/rental/${rental.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json());
            const servicesData = serviceRentals.result?.map(rental => ({
                quantity: rental.quantity,
                name: rental.serviceName || 'Không xác định',
                hourly_salary: rental.pricePerDay || 0,
                supplierName: rental.supplierName || 'Không xác định'
            })) || [];

            const locationRentals = await fetch(`${LOCATION_RENTAL_API_URL}/rental/${rental.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json());
            const locationsData = locationRentals.result?.map(rental => ({
                quantity: rental.quantity,
                name: rental.name || 'Không xác định',
                hourly_rental_fee: rental.hourly_rental_fee || 0,
                supplierName: rental.supplierName || 'Không xác định'
            })) || [];

            const timelines = await fetch(`${TIMELINE_API_URL}/rental/${rental.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json());
            const timelinesData = timelines.data?.map(timeline => ({
                time_start: timeline.time_start,
                description: timeline.description || 'Không có mô tả'
            })) || [];

            // Lưu dữ liệu hợp đồng vào currentContract
            currentContract = {
                id: contract.id,
                name: contract.name,
                status: getStatusInfo(contract.status).text,
                total_price: rental.totalPrice || 0,
                rental_start_time: rental.rentalStartTime,
                rental_end_time: rental.rentalEndTime,
                customerName: contract.customerName || 'Không có thông tin',
                customerPhone: contract.customerPhone || 'Không có thông tin',
                customerAddress: contract.address || 'Không có thông tin',
                devices: devicesData,
                services: servicesData,
                locations: locationsData,
                timelines: timelinesData
            };

            // Hiển thị thông tin cơ bản
            const totalPrice = rental ? rental.totalPrice.toLocaleString() + " ₫" : "0 ₫";
            const rentalStartTime = rental ? new Date(rental.rentalStartTime).toLocaleDateString() : "N/A";
            const rentalEndTime = rental ? new Date(rental.rentalEndTime).toLocaleDateString() : "N/A";
            const statusInfo = getStatusInfo(contract.status) || { text: "Không xác định", color: "gray" };

            document.getElementById("status").textContent = statusInfo.text;
            document.getElementById("name").textContent = contract.name || "Hợp đồng không xác định";
            document.getElementById("RentalStart").textContent = rentalStartTime;
            document.getElementById("RentalEnd").textContent = rentalEndTime;
            document.getElementById("price").textContent = totalPrice;
            document.getElementById("customerName").textContent = contract.customerName || "Khách hàng không xác định";
            document.getElementById("phone").textContent = contract.customerPhone || "N/A";
            document.getElementById("address").textContent = contract.address || "Địa chỉ không xác định";

            const statusElement = document.getElementById("status");
            statusElement.style.color = statusInfo.color;
            statusElement.style.backgroundColor = getLighterColor(statusInfo.color);

            // Hiển thị thông tin bản thảo hợp đồng
            document.getElementById("draftDate").textContent = new Date().toLocaleDateString("vi-VN");
            document.getElementById("draftCustomerName").textContent = contract.customerName || 'Không xác định';
            document.getElementById("draftCustomerAddress").textContent = contract.address || 'Không xác định';
            document.getElementById("draftCustomerPhone").textContent = contract.customerPhone || 'Không xác định';
            document.getElementById("draftContractName").textContent = contract.name || 'Không xác định';
            document.getElementById("draftStartDate").textContent = formatDate(rental.rentalStartTime);
            document.getElementById("draftEndDate").textContent = formatDate(rental.rentalEndTime);
            document.getElementById("draftLocation").textContent = locationsData.length ? locationsData[0].name : contract.address || 'Không xác định';
            document.getElementById("draftTotalPrice").textContent = dinhDangTien(rental.totalPrice);

            // Điền bảng thiết bị
            const draftDeviceTableBody = document.getElementById("draftDeviceTableBody");
            draftDeviceTableBody.innerHTML = "";
            if (devicesData.length === 0) {
                draftDeviceTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Không có thiết bị</td></tr>`;
            } else {
                devicesData.forEach((device, index) => {
                    const total = device.hourly_salary * device.quantity;
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${device.name}</td>
                        <td>${device.quantity}</td>
                        <td>${dinhDangTien(device.hourly_salary)}</td>
                        <td>${dinhDangTien(total)}</td>
                    `;
                    draftDeviceTableBody.appendChild(row);
                });
            }

            // Điền bảng dịch vụ
            const draftServiceTableBody = document.getElementById("draftServiceTableBody");
            draftServiceTableBody.innerHTML = "";
            if (servicesData.length === 0) {
                draftServiceTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Không có dịch vụ</td></tr>`;
            } else {
                servicesData.forEach((service, index) => {
                    const total = service.hourly_salary * service.quantity;
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${service.name}</td>
                        <td>${service.quantity}</td>
                        <td>${dinhDangTien(service.hourly_salary)}</td>
                        <td>${dinhDangTien(total)}</td>
                    `;
                    draftServiceTableBody.appendChild(row);
                });
            }

            // Điền bảng địa điểm
            const draftLocationTableBody = document.getElementById("draftLocationTableBody");
            draftLocationTableBody.innerHTML = "";
            if (locationsData.length === 0) {
                draftLocationTableBody.innerHTML = `<tr><td colspan="8" class="text-center">Không có địa điểm</td></tr>`;
            } else {
                locationsData.forEach((location, index) => {
                    const startDate = new Date(rental.rentalStartTime);
                    const endDate = new Date(rental.rentalEndTime);
                    const diffTime = Math.abs(endDate - startDate);
                    const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    const total = location.hourly_rental_fee * rentalDays;
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${location.name}</td>
                        <td>${location.supplierName}</td>
                        <td>${formatDate(rental.rentalStartTime)}</td>
                        <td>${formatDate(rental.rentalEndTime)}</td>
                        <td>${rentalDays}</td>
                        <td>${dinhDangTien(location.hourly_rental_fee)}</td>
                        <td>${dinhDangTien(total)}</td>
                    `;
                    draftLocationTableBody.appendChild(row);
                });
            }

            // Điền bảng lịch trình
            const draftTimelineTableBody = document.getElementById("draftTimelineTableBody");
            draftTimelineTableBody.innerHTML = "";
            if (timelinesData.length === 0) {
                draftTimelineTableBody.innerHTML = `<tr><td colspan="3" class="text-center">Không có lịch trình</td></tr>`;
            } else {
                timelinesData.forEach((timeline, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${formatDateTime(timeline.time_start)}</td>
                        <td>${timeline.description}</td>
                    `;
                    draftTimelineTableBody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu chi tiết hợp đồng:", error);
            // alert("Không thể tải thông tin hợp đồng!");
        });
}

// Hàm generateWordDocument (đã sửa đổi ở trên)
function generateWordDocument() {
    // Kiểm tra thư viện docx
    if (typeof docx === 'undefined') {
        alert('Thư viện docx không được tải. Vui lòng kiểm tra CDN.');
        return;
    }

    // Kiểm tra currentContract
    if (!currentContract) {
        alert('Không có dữ liệu hợp đồng để xuất!');
        return;
    }

    // Kiểm tra các phần tử HTML cần thiết
    const requiredElements = [
        'draftDate',
        'draftCustomerName',
        'draftCustomerAddress',
        'draftCustomerPhone',
        'draftContractName',
        'draftStartDate',
        'draftEndDate',
        'draftLocation',
        'draftTotalPrice',
        'draftDeviceTableBody',
        'draftServiceTableBody',
        'draftLocationTableBody',
        'draftTimelineTableBody'
    ];
    for (const id of requiredElements) {
        if (!document.getElementById(id)) {
            alert(`Không tìm thấy phần tử HTML với ID: ${id}`);
            return;
        }
    }

    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 28 })],
                        alignment: "center",
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, underline: true, size: 24 })],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "HỢP ĐỒNG DỊCH VỤ", bold: true, size: 32 })],
                        alignment: "center",
                        spacing: { after: 300 },
                    }),
                    new Paragraph({ children: [new TextRun({ text: `- Căn cứ Bộ luật dân sự 2015;`, italics: true })] }),
                    new Paragraph({ children: [new TextRun({ text: `- Căn cứ sự thỏa thuận của 2 bên;`, italics: true })] }),
                    new Paragraph({
                        children: [new TextRun({ text: `Hôm nay, ngày ${document.getElementById("draftDate").textContent}, chúng tôi gồm:` })],
                        spacing: { after: 200 },
                    }),
                    new Paragraph({ children: [new TextRun({ text: "BÊN THUÊ DỊCH VỤ (sau đây gọi là Bên A)", bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: `TÊN: ${document.getElementById("draftCustomerName").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `ĐỊA CHỈ: ${document.getElementById("draftCustomerAddress").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `SỐ ĐIỆN THOẠI: ${document.getElementById("draftCustomerPhone").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: "BÊN CHO THUÊ DỊCH VỤ (sau đây gọi là Bên B)", bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "TÊN CÔNG TY: CÔNG TY TNHH DỊCH VỤ MYEVENT" })] }),
                    new Paragraph({ children: [new TextRun({ text: "ĐẠI DIỆN: Ông/Bà Huyền Hạnh Minh Trinh Long" })] }),
                    new Paragraph({ children: [new TextRun({ text: "CHỨC DANH: GIÁM ĐỐC" })] }),
                    new Paragraph({ children: [new TextRun({ text: "ĐỊA CHỈ: K384 Điện Biên Phủ, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng" })] }),
                    new Paragraph({ children: [new TextRun({ text: "SỐ ĐIỆN THOẠI: 0819901400" })] }),
                    new Paragraph({ children: [new TextRun({ text: "Hai bên thỏa thuận ký kết hợp đồng này với các điều khoản sau:" })] }),
                    new Paragraph({ children: [new TextRun({ text: "Điều 1: Nội dung dịch vụ thực hiện", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "Bên B cam kết lên kế hoạch và tổ chức sự kiện cho Bên A theo bảng danh mục bên dưới." })] }),
                    new Paragraph({ children: [new TextRun({ text: `Tên sự kiện: ${document.getElementById("draftContractName").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Thời gian thực hiện: Từ ngày ${document.getElementById("draftStartDate").textContent} đến ngày ${document.getElementById("draftEndDate").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Địa điểm: ${document.getElementById("draftLocation").textContent}` })] }),
                    // Bảng danh mục thiết bị
                    new Paragraph({ children: [new TextRun({ text: "Bảng danh mục thiết bị", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Tên thiết bị")] }),
                                    new TableCell({ children: [new Paragraph("Số lượng")] }),
                                    new TableCell({ children: [new Paragraph("Đơn giá")] }),
                                    new TableCell({ children: [new Paragraph("Thành tiền")] }),
                                ],
                            }),
                            ...(() => {
                                const deviceTableBody = document.getElementById("draftDeviceTableBody");
                                const rows = Array.from(deviceTableBody.children);
                                if (rows.length === 1 && rows[0].textContent.includes("Không có thiết bị")) {
                                    return [new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Không có thiết bị")], columnSpan: 5 }),
                                        ],
                                    })];
                                }
                                return rows.map((row, index) => {
                                    const cells = row.children;
                                    return new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                            new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[3].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[4].textContent)] }),
                                        ],
                                    });
                                });
                            })(),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    // Bảng danh mục dịch vụ
                    new Paragraph({ children: [new TextRun({ text: "Bảng danh mục dịch vụ", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Tên dịch vụ")] }),
                                    new TableCell({ children: [new Paragraph("Số lượng")] }),
                                    new TableCell({ children: [new Paragraph("Đơn giá")] }),
                                    new TableCell({ children: [new Paragraph("Thành tiền")] }),
                                ],
                            }),
                            ...(() => {
                                const serviceTableBody = document.getElementById("draftServiceTableBody");
                                const rows = Array.from(serviceTableBody.children);
                                if (rows.length === 1 && rows[0].textContent.includes("Không có dịch vụ")) {
                                    return [new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Không có dịch vụ")], columnSpan: 5 }),
                                        ],
                                    })];
                                }
                                return rows.map((row, index) => {
                                    const cells = row.children;
                                    return new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                            new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[3].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[4].textContent)] }),
                                        ],
                                    });
                                });
                            })(),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    // Bảng danh mục địa điểm
                    new Paragraph({ children: [new TextRun({ text: "Bảng danh mục địa điểm", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Tên địa điểm")] }),
                                    new TableCell({ children: [new Paragraph("Nhà cung cấp")] }),
                                    new TableCell({ children: [new Paragraph("Từ ngày")] }),
                                    new TableCell({ children: [new Paragraph("Đến ngày")] }),
                                    new TableCell({ children: [new Paragraph("Số ngày thuê")] }),
                                    new TableCell({ children: [new Paragraph("Đơn giá/Ngày")] }),
                                    new TableCell({ children: [new Paragraph("Thành tiền")] }),
                                ],
                            }),
                            ...(() => {
                                const locationTableBody = document.getElementById("draftLocationTableBody");
                                const rows = Array.from(locationTableBody.children);
                                if (rows.length === 1 && rows[0].textContent.includes("Không có địa điểm")) {
                                    return [new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Không có địa điểm")], columnSpan: 8 }),
                                        ],
                                    })];
                                }
                                return rows.map((row, index) => {
                                    const cells = row.children;
                                    return new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                            new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[3].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[4].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[5].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[6].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[7].textContent)] }),
                                        ],
                                    });
                                });
                            })(),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    // Bảng lịch trình dự kiến
                    new Paragraph({ children: [new TextRun({ text: "Bảng lịch trình dự kiến sự kiện", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Thời gian")] }),
                                    new TableCell({ children: [new Paragraph("Mô tả")] }),
                                ],
                            }),
                            ...(() => {
                                const timelineTableBody = document.getElementById("draftTimelineTableBody");
                                const rows = Array.from(timelineTableBody.children);
                                if (rows.length === 1 && rows[0].textContent.includes("Không có lịch trình")) {
                                    return [new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Không có lịch trình")], columnSpan: 3 }),
                                        ],
                                    })];
                                }
                                return rows.map((row, index) => {
                                    const cells = row.children;
                                    return new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                            new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                            new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                        ],
                                    });
                                });
                            })(),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    new Paragraph({ children: [new TextRun({ text: "Điều 2: GIÁ TRỊ DỊCH VỤ – PHƯƠNG THỨC THANH TOÁN", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: `2.1 Giá trị dịch vụ: ${document.getElementById("draftTotalPrice").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: "2.2 Ngay khi bên B thực hiện cung cấp dịch vụ theo quy định của Điều 1, hai bên sẽ thống nhất và ký kết biên bản thanh lý hợp đồng trong đó có ghi rõ những hạng mục còn thiếu hoặc phát sinh (nếu có). Việc bỏ bớt hoặc bổ sung hạng mục (nếu có) phải được Bên A chấp thuận trước bằng văn bản, giá trị dịch vụ ghi trong biên bản thanh lý hợp đồng sẽ là giá trị thanh toán cuối cùng." })] }),
                    new Paragraph({ children: [new TextRun({ text: "2.3 Phương thức thanh toán: (Thanh toán bằng tiền mặt hoặc chuyển khoản)" })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Bên A thực hiện đặt cọc 10% giá trị hợp đồng." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Bên A thanh toán 100% giá trị dịch vụ trong 5 ngày làm việc." })] }),

                    new Paragraph({ children: [new TextRun({ text: "Điều 3: Thời hạn thỏa thuận", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "3.1 Thời gian hiệu lực hợp đồng: Bắt đầu từ khi bản hợp đồng này được ký kết đến khi thanh toán hợp đồng kèm theo biên bản thanh lý hợp đồng này." })] }),
                    new Paragraph({ children: [new TextRun({ text: "3.2 Trong trường hợp hết thời gian hiệu lực ghi trong hợp đồng mà bên A chưa thanh toán dứt điểm các khoản tiền liên quan đến hợp đồng này thì thời gian hiệu lực của hợp đồng sẽ mặc nhiên được gia hạn cho đến khi các khoản tiền được thanh toán dứt điểm cho bên B và hợp đồng này mặc nhiên được cả hai bên A và B coi như đã được thanh lý." })] }),
                    new Paragraph({ children: [new TextRun({ text: "3.3 Trường hợp một trong hai bên vi phạm bất kỳ điều khoản nào trong bản hợp đồng này hoặc các phụ lục hoặc văn bản bổ sung đính kèm có liên quan đến hợp đồng này thì bên bị vi phạm được quyền chấm dứt trước thời hạn. Bên vi phạm phải bồi thường cho bên bị vi phạm những thiệt hại do việc vi phạm này của mình gây ra." })] }),

                    new Paragraph({ children: [new TextRun({ text: "Điều 4: Quyền lợi và nghĩa vụ của Bên A", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "4.1 Quyền lợi của bên A:" })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Nhận được dịch vụ tốt nhất và đầy đủ nhất do bên B cung cấp." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Quản lý và giám sát các hoạt động do bên B cung cấp và thực hiện." })] }),
                    new Paragraph({ children: [new TextRun({ text: "4.2 Nghĩa vụ của bên A:" })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Thanh toán cho bên B theo như thỏa thuận tại điều 2." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Phối hợp với bên B giải quyết các vấn đề phát sinh xảy ra trong chương trình thuộc về trách nhiệm của bên A." })] }),

                    new Paragraph({ children: [new TextRun({ text: "Điều 5: Quyền lợi và nghĩa vụ của Bên B", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "5.1 Quyền lợi của bên B:" })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Nhận được đầy đủ thanh toán của bên A như điều 2." })] }),
                    new Paragraph({ children: [new TextRun({ text: "5.2 Nghĩa vụ của bên B:" })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Bảo đảm tuyển dụng, cung cấp cho bên A các hạng mục đã nêu với số lượng, chất lượng như yêu cầu." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Trong quá trình diễn ra chương trình, Bên B cam kết sẽ trực tiếp theo dõi, giám sát, ghi chép và chụp hình lại trong biên bản nghiệm thu bàn giao cho Bên A." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Cung cấp hóa đơn tài chính hợp pháp đối với dịch vụ cung cấp theo hợp đồng này và các hạng mục phát sinh được bên A chấp thuận (nếu có)." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Phối hợp với bên A giải quyết các vấn đề phát sinh xảy ra trong chương trình thuộc về trách nhiệm của bên B." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Bên B sẽ không chịu trách nhiệm về những dịch vụ nào khác ngoài nội dung và Bảng danh mục dịch vụ." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Bên B cam kết không cung cấp và tiết lộ bất kỳ thông tin nào liên quan trực tiếp hay gián tiếp đến sản phẩm của Bên A cũng như các nội dung khác cho bất kỳ bên thứ ba nào mà không có sự đồng ý trước của Bên A bằng văn bản." })] }),

                    new Paragraph({ children: [new TextRun({ text: "Điều 6: Giải quyết tranh chấp", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "Mọi tranh chấp liên quan đến Hợp đồng này trước hết sẽ được giải quyết thông qua thương lượng và hòa giải giữa các bên. Nếu tranh chấp không giải quyết được thông qua hòa giải thì các bên nhất trí rằng một trong các bên có quyền đưa ra giải quyết tại Tòa án có thẩm quyền." })] }),

                    new Paragraph({
                        children: [
                            new TextRun({ text: "ĐẠI DIỆN BÊN A", bold: true, allCaps: true }),
                            new TextRun({ text: "                          " }),
                            new TextRun({ text: "ĐẠI DIỆN BÊN B", bold: true, allCaps: true }),
                        ],
                        spacing: { before: 600 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "(Ký tên, đóng dấu)", italics: true }),
                            new TextRun({ text: "                          " }),
                            new TextRun({ text: "(Ký tên, đóng dấu)", italics: true }),
                        ],
                    }),
                ],
            },
        ],
    });

    Packer.toBlob(doc)
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `HopDongDichVu_${currentContract.id}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
            console.error('Lỗi khi tạo file Word:', error);
            alert(`Lỗi khi tạo file Word: ${error.message}`);
        });
}
// window.onload (giữ nguyên như bạn cung cấp)
window.onload = async function () {
    const contractId = localStorage.getItem("editContractId");

    if (!contractId) {
        alert("Không tìm thấy ID hợp đồng trong URL. Vui lòng kiểm tra lại!");
        return;
    }

    // Gọi watchDetailContract để hiển thị toàn bộ thông tin hợp đồng
    watchDetailContract(contractId);

    // Gắn các event listener
    const contractDraft = document.querySelector(".contract-draft");
    const showDraftButton = document.getElementById("showDraftButton");
    const exportDraftButton = document.getElementById("exportDraftButton");
    const uploadSignedDocument = document.getElementById("uploadSignedDocument");

    showDraftButton.addEventListener("click", () => {
        contractDraft.classList.toggle("show");
        contractDraft.style.display = contractDraft.classList.contains("show") ? "block" : "none";
        showDraftButton.textContent = contractDraft.classList.contains("show")
            ? "Ẩn Bản Thảo Hợp Đồng"
            : "Xem Bản Thảo Hợp Đồng";
        exportDraftButton.style.display = contractDraft.classList.contains("show")
            ? "inline-block"
            : "none";
    });

    exportDraftButton.addEventListener("click", () => {
        if (currentContract) {
            generateWordDocument();
        } else {
            alert("Không có dữ liệu hợp đồng để xuất!");
        }
    });

    uploadSignedDocument.addEventListener("click", async () => {
        const fileInput = document.getElementById("signedDocument");
        const file = fileInput.files[0];
        if (!file) {
            alert("Vui lòng chọn file để tải lên!");
            return;
        }
        if (!currentContract) {
            alert("Không có hợp đồng để liên kết với file!");
            return;
        }
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
            alert("Chỉ hỗ trợ file PDF hoặc Word!");
            return;
        }
        try {
            await uploadFile(file, currentContract.id);
            alert("Tải lên hợp đồng đã ký thành công!");
            fileInput.value = "";
        } catch (error) {
            alert(`Lỗi khi tải lên: ${error.message}`);
        }
    });
};