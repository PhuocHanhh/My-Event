var ContractAPI = 'http://localhost:8080/event-management/api/v1/statistics/contracts/monthly';
var UserAPI = 'http://localhost:8080/event-management/api/v1/statistics/users/monthly';
var RentalAPI = 'http://localhost:8080/event-management/api/v1/statistics/revenue/monthly';
//Dùng chung
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra Chart.js
    if (typeof Chart === 'undefined') {
        console.error("Chart.js không được tải. Đảm bảo script Chart.js được thêm vào HTML.");
        return;
    }

    // Kiểm tra canvas tồn tại
    const userCanvas = document.querySelector('#useChart');
    if (!userCanvas) {
        console.error("Không tìm thấy canvas #useChart trong DOM");
    }

    const contractCanvas = document.querySelector('#contactChart');
    if (!contractCanvas) {
        console.error("Không tìm thấy canvas #contactChart trong DOM");
    }

    const revenueCanvas = document.querySelector('#revenueChart');
    if (!revenueCanvas) {
        console.error("Không tìm thấy canvas #revenueChart trong DOM");
    }

    fetchContractsAndRenderChart();
    fetchUsersAndRenderChart();
    fetchRentalsAndRenderChart();
});

let contractChartInstance = null;
let userChartInstance = null;
let revenueChartInstance = null;
//Hơp đồng
function fetchContractsAndRenderChart() {
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(ContractAPI, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Lỗi ContractAPI: ${res.status}`);
            }
            return res.json();
        })
        .then(contractData => {
            console.log("Phản hồi thô ContractAPI:", contractData);

            let monthlyData = contractData.result || contractData.data?.items || contractData.data || contractData || [];
            if (!Array.isArray(monthlyData) || monthlyData.length !== 12 || !monthlyData.every(num => typeof num === 'number')) {
                console.error("Dữ liệu không phải mảng 12 số:", monthlyData);
                monthlyData = Array(12).fill(0);
            }

            console.log("Dữ liệu monthlyData sau chuẩn hóa:", monthlyData);
            renderBarChart(monthlyData);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu hợp đồng:", error);
            alert("Không thể tải dữ liệu hợp đồng. Vui lòng thử lại sau.");
        });
}

function renderBarChart(monthlyData) {
    const canvas = document.querySelector('#contactChart');
    if (!canvas) {
        console.error("Không tìm thấy canvas #contactChart");
        return;
    }

    if (contractChartInstance) {
        contractChartInstance.destroy();
    }

    const backgroundColors = [
        'rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)'
    ];

    const borderColors = [
        'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)',
        'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)',
        'rgb(201, 203, 207)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)',
        'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)'
    ];

    contractChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Số hợp đồng',
                data: monthlyData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Số hợp đồng'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tháng'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
    console.log("Biểu đồ hợp đồng đã được vẽ thành công.");
}
//Người dùng
function fetchUsersAndRenderChart() {
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(UserAPI, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi UserAPI: ${response.status}`);
            }
            return response.json();
        })
        .then(userData => {
            console.log("Phản hồi thô UserAPI:", userData);

            let monthlyData = userData.result || userData.data?.items || userData.data || userData || [];
            if (!Array.isArray(monthlyData) || monthlyData.length !== 12 || !monthlyData.every(num => typeof num === 'number')) {
                console.error("Dữ liệu không phải mảng 12 số:", monthlyData);
                monthlyData = Array(12).fill(0);
            }

            console.log("Dữ liệu monthlyData user sau chuẩn hóa:", monthlyData);
            renderUserLineChart(monthlyData);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu người dùng:", error);
            alert("Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.");
        });
}

function renderUserLineChart(monthlyData) {
    const canvas = document.querySelector('#useChart');
    if (!canvas) {
        console.error("Không tìm thấy canvas #useChart");
        return;
    }

    const container = canvas.parentElement;
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        console.warn("Canvas #useChart không có kích thước (width/height = 0). Kiểm tra container và CSS.");
        console.log("Kích thước container:", container.offsetWidth, container.offsetHeight);
    }

    if (userChartInstance) {
        userChartInstance.destroy();
    }

    try {
        userChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Số lượng người dùng',
                    data: monthlyData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgb(75, 192, 192)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng người dùng'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
        console.log("Biểu đồ người dùng đã được vẽ thành công.");
    } catch (error) {
        console.error("Lỗi khi vẽ biểu đồ người dùng:", error);
    }
}
//Doanh thu
function fetchRentalsAndRenderChart() {
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(RentalAPI, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi RentalAPI: ${response.status}`);
            }
            return response.json();
        })
        .then(revenueData => {
            console.log("Phản hồi thô RentalAPI:", revenueData);

            let monthlyRevenueData = revenueData.result || revenueData.data?.items || revenueData.data || revenueData || [];
            if (!Array.isArray(monthlyRevenueData) || monthlyRevenueData.length !== 12 || !monthlyRevenueData.every(num => typeof num === 'number')) {
                console.error("Dữ liệu không phải mảng 12 số:", monthlyRevenueData);
                monthlyRevenueData = Array(12).fill(0);
            }

            console.log("Dữ liệu monthlyRevenueData sau chuẩn hóa:", monthlyRevenueData);
            renderRevenueLineChart(monthlyRevenueData);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
            alert("Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau.");
        });
}

function renderRevenueLineChart(monthlyRevenueData) {
    const canvas = document.querySelector('#revenueChart');
    if (!canvas) {
        console.error("Không tìm thấy canvas #revenueChart");
        return;
    }

    const container = canvas.parentElement;
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        console.warn("Canvas #revenueChart không có kích thước (width/height = 0). Kiểm tra container và CSS.");
        console.log("Kích thước container:", container.offsetWidth, container.offsetHeight);
    }

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    try {
        revenueChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Doanh thu hàng tháng',
                    data: monthlyRevenueData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgb(75, 192, 192)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Doanh thu (VND)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
        console.log("Biểu đồ doanh thu đã được vẽ thành công.");
    } catch (error) {
        console.error("Lỗi khi vẽ biểu đồ doanh thu:", error);
    }
}
