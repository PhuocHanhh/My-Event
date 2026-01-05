
const CONTRACT_API_URL = "http://localhost:8080/event-management/api/contracts";
const RENTAL_API_URL = "http://localhost:8080/event-management/rentals";

let contractList = [];
let rental = [];
let dataTable; // Biến để lưu đối tượng DataTable

function getToken() {
    return localStorage.getItem("token");
}

function formatCurrency(value) {
    return value.toLocaleString('vi-VN') + " ₫";
}

function formatDate(date) {
    return date || '';
}

function formatStatus(status) {
    switch (status) {
        case "Draft": return '<span class="badge bg-success">Bản Nháp</span>';
        case "DepositPaid": return '<span class="badge bg-info">Đã đặt cọc</span>';
        case "InProgress": return '<span class="badge bg-warning">Đang Thực Hiện</span>';
        case "WaitingPaid": return '<span class="badge bg-primary">Chờ Thanh Toán</span>';
        case "Completed": return '<span class="badge bg-dark">Đã Hoàn Thành</span>';
        case "Cancel": return '<span class="badge bg-danger">Đã hủy</span>';
        case "AdminCancel": return '<span class="badge bg-dark">Đã hủy bởi Admin</span>';
        default: return '<span class="badge bg-secondary">Unknown</span>';
    }
}

async function fetchData(url, method = "GET", data = null) {
    const token = getToken();
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`${method} failed! Status: ${response.status}`);
    }
    return response.json();
}

async function fetchContractList() {
    try {
        const [contractResponse, rentalResponse] = await Promise.all([
            fetchData(CONTRACT_API_URL),
            fetchData(RENTAL_API_URL)
        ]);

        contractList = contractResponse.result || [];
        rental = rentalResponse || [];
        console.log('Dữ liệu contractList:', contractList);
        console.log('Dữ liệu rental:', rental);

        return contractList.map((contract, index) => {
            const rentalMatch = rental.find(r => r.id === contract.rentalId) || {};
            return {
                stt: index + 1,
                id: contract.id,
                contractName: contract.name,
                totalPrice: rentalMatch.totalPrice ? formatCurrency(rentalMatch.totalPrice) : "0 ₫",
                rentalStartTime: rentalMatch.rentalStartTime
                    ? new Date(rentalMatch.rentalStartTime).toLocaleDateString() : "N/A",
                rentalEndTime: rentalMatch.rentalEndTime
                    ? new Date(rentalMatch.rentalEndTime).toLocaleDateString() : "N/A",
                status: contract.status || 'Draft'
            };
        });
    } catch (error) {
        console.error(`Lỗi lấy danh sách hợp đồng: ${error.message}`);
        return [];
    }
}

function initializeDataTable(data) {
    dataTable = $('#contractTable').DataTable({
        data: data,
        columns: [
            { data: 'stt' },
            { data: 'contractName' },
            { data: 'totalPrice' },
            {
                data: null,
                render: function (data) {
                    return `${data.rentalStartTime} - ${data.rentalEndTime}`;
                }
            },
            {
                data: 'status',
                render: function (data) {
                    return formatStatus(data);
                }
            },
            {
                data: null,
                render: function (data) {
                    let actionButtons = `
                        <button class="btn btn-sm" onclick="viewDetails('${data.id}')"><i class="fas fa-eye"></i>Xem Chi Tiết</button>
                    `;
                    if (data.status === "Draft") {
                        actionButtons += `
                            <button class="btn btn-sm" onclick="makeDeposit('${data.id}')"><i class="fas fa-money-bill-wave"></i>Đặt Cọc</button>
                            <button class="btn btn-sm" onclick="cancelContract('${data.id}')"><i class="fas fa-ban"></i> Hủy</button>
                        `;
                    } else if (data.status === "Completed") {
                        actionButtons += `
                            <button class="btn btn-sm" onclick="makeDeposit('${data.id}')"><i class="fas fa-money-bill-wave"></i>Đã Thanh Toán</button>
                        `;
                    } else if (data.status === "DepositPaid") {
                        actionButtons += `
                            <button class="btn btn-sm" onclick="makeDeposit('${data.id}')"><i class="fas fa-money-bill-wave"></i> Thanh Toán Còn Lại</button>
                        `;
                    } else if (data.status === "Cancel") {
                        actionButtons += `
                           <button class="btn btn-sm" disabled><i class="fas fa-ban"></i>Đã Hủy</button>
                        `;
                    } else {
                        actionButtons += `
                            <button class="btn btn-sm" onclick="makeDeposit('${data.id}')"><i class="fas fa-money-bill-wave"></i> Thanh Toán Còn Lại</button>
                        `;
                    }
                    return actionButtons;
                }
            }
        ],
        pageLength: 10,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json' // Ngôn ngữ tiếng Việt
        }
    });
}
async function cancelContract(contractId) {
    try {
        // const confirmCancel = confirm("Bạn có chắc chắn muốn hủy hợp đồng này?");
        // if (!confirmCancel) return;
        const result = await Swal.fire({
            title: 'Xác nhận hủy hợp đồng',
            text: "Bạn có chắc chắn muốn hủy hợp đồng này?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#718355',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Hủy',
            cancelButtonText: 'Quay lại'
        });

        if (!result.isConfirmed) return;

        await fetchData(`${CONTRACT_API_URL}/${contractId}`, "PUT", { status: "Cancel" });
        await Swal.fire({
            title: 'Thành công!',
            text: "Hủy hợp đồng thành công!",
            icon: 'success'
        });
        contractList = await fetchContractList();
        displayContractList(contractList, currentPage);
    } catch (error) {
        console.error("Lỗi khi hủy hợp đồng:", error.message);
    }
}
function searchContracts() {
    const contractName = $('#tenHopDong').val().toLowerCase();
    const status = $('#trangThai').val();

    const filteredData = contractList.filter(contract => {
        const matchesName = contractName === "" || contract.contractName.toLowerCase().includes(contractName);
        const matchesStatus = status === "" || contract.status === status;
        return matchesName && matchesStatus;
    });

    dataTable.clear().rows.add(filteredData).draw();
}

function resetFilters() {
    $('#tenHopDong').val('');
    $('#trangThai').val('');
    fetchContractList().then(data => {
        contractList = data;
        dataTable.clear().rows.add(data).draw();
    });
}

function viewDetails(contractId) {
    window.location.href = `contractDetail.html?id=${contractId}`;
}

function makeDeposit(contractId) {
    window.location.href = `payment.html?id=${contractId}`;
}

$(document).ready(async function () {
    const data = await fetchContractList();
    contractList = data;
    initializeDataTable(data);

    // Listen for messages from the contract creation form
    window.addEventListener('message', function (event) {
        if (event.data.type === 'newContract') {
            const newContract = {
                stt: contractList.length + 1,
                id: event.data.contract.id,
                contractName: event.data.contract.name,
                totalPrice: event.data.contract.total_price ? formatCurrency(event.data.contract.total_price) : "0 ₫",
                rentalStartTime: event.data.contract.rental_start_time
                    ? new Date(event.data.contract.rental_start_time).toLocaleDateString() : "N/A",
                rentalEndTime: event.data.contract.rental_end_time
                    ? new Date(event.data.contract.rental_end_time).toLocaleDateString() : "N/A",
                status: event.data.contract.status || 'Draft'
            };
            contractList.push(newContract);
            dataTable.clear().rows.add(contractList).draw();
        }
    });
});