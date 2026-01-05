var RentalAPI = 'http://localhost:8080/event-management/api/v1/statistics/revenue/monthly';
var RentalDailyAPI = 'http://localhost:8080/event-management/api/v1/statistics/revenue/daily';
var CustomerAPI = 'http://localhost:8080/event-management/api/v1/statistics/customers/yearly';

function start() {
    getData((rental, rentaldaily, customer) => {
        renderSales(rentaldaily);
        renderTotalRevenue(rental);
        renderCustomer(customer); // Gọi đúng hàm với dữ liệu khách hàng
        updateChart(rental, rentaldaily, customer);
    });
};
start();
// function getData(callback) {
//     let token = localStorage.getItem("token"); // Lấy token từ localStorage

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }

//     Promise.all([
//         fetch(RentalAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),

//         fetch(RentalDailyAPI, {
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
//     ])
//         .then(([rental, rentaldaily]) => {
//             callback(rental, rentaldaily);
//         })
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }


//Sale
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(RentalAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(RentalDailyAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
        fetch(CustomerAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
    ])
        .then(([rental, rentaldaily, customer]) => {
            console.log("Dữ liệu contracts sau chuẩn hóa:", rentaldaily);
            console.log("Dữ liệu ccustomer sau chuẩn hóa:", customer);
            callback(rental, rentaldaily, customer);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}
// function renderSales(rentaldaily) {
//     // Lấy ngày hiện tại
//     const today = new Date();
//     const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

//     // Tính tổng doanh thu hôm nay
//     const todayRevenue = rentaldaily.reduce((total, item) => {
//         // Chuyển rental_start_time thành định dạng YYYY-MM-DD để so sánh
//         const rentalDate = item.rentalStartTime.split('T')[0];

//         // Nếu ngày bắt đầu thuê là hôm nay, cộng vào tổng
//         if (rentalDate === todayString) {
//             return total + item.totalPrice;
//         }
//         return total;
//     }, 0);

//     // Cập nhật giá trị lên HTML
//     const revenueElement = document.querySelector('.sales-card .ps-3 h6');
//     if (revenueElement) {
//         // Format số tiền với dấu phân cách hàng nghìn
//         revenueElement.textContent = todayRevenue.toLocaleString('vi-VN') + ' VNĐ';
//     }
// }



// Doanh thu ngày
function renderSales(rentaldaily) {
    // Kiểm tra xem rentaldaily có phải là mảng không
    if (!Array.isArray(rentaldaily)) {
        console.error("Lỗi: rentaldaily không phải là mảng:", rentaldaily);
        const revenueElement = document.querySelector('.sales-card .ps-3 h6');
        if (revenueElement) {
            revenueElement.textContent = "0 VNĐ"; // Giá trị mặc định nếu lỗi
        }
        return;
    }

    // Lấy ngày hiện tại (1-31)
    const today = new Date();
    const todayDate = today.getDate(); // Ngày 13 (vì 13/05/2025)

    // Lấy doanh thu hôm nay (index = todayDate - 1)
    const todayRevenue = rentaldaily[todayDate - 1] || 0; // Index 12 nếu ngày 13

    console.log(`Doanh thu ngày ${todayDate}:`, todayRevenue); // Debug

    // Cập nhật giá trị lên HTML
    const revenueElement = document.querySelector('.sales-card .ps-3 h6');
    if (revenueElement) {
        revenueElement.textContent = todayRevenue.toLocaleString('vi-VN') + ' VNĐ';
    }
}
// function renderTotalRevenue(rental) {
//     // Lấy tháng và năm hiện tại
//     const today = new Date();
//     const currentMonth = today.getMonth(); // 0-11 (0 là tháng 1)
//     const currentYear = today.getFullYear();

//     // Tính tổng doanh thu trong tháng
//     const monthlyRevenue = rental.reduce((total, item) => {
//         const rentalDate = new Date(item.rentalStartTime);
//         const rentalMonth = rentalDate.getMonth();
//         const rentalYear = rentalDate.getFullYear();

//         // Nếu cùng tháng và năm với hiện tại, cộng vào tổng
//         if (rentalMonth === currentMonth && rentalYear === currentYear) {
//             return total + item.totalPrice;
//         }
//         return total;
//     }, 0);

//     // Cập nhật giá trị lên HTML
//     const revenueElement = document.querySelector('.revenue-card .ps-3 h6');
//     if (revenueElement) {
//         revenueElement.textContent = monthlyRevenue.toLocaleString('vi-VN') + ' VNĐ';
//     }
// }


//Customer
// Tổng doanh thu tháng
//Total revenue
function renderTotalRevenue(rental) {
    // Kiểm tra xem rental có phải là mảng không
    if (!Array.isArray(rental)) {
        console.error("Lỗi: rental không phải là mảng:", rental);
        const revenueElement = document.querySelector('.revenue-card .ps-3 h6');
        if (revenueElement) {
            revenueElement.textContent = "0 VNĐ"; // Giá trị mặc định nếu lỗi
        }
        return;
    }

    // Lấy tháng hiện tại (0-11)
    const today = new Date();
    const currentMonth = today.getMonth(); // Tháng 5 (index 4)

    // Lấy doanh thu của tháng hiện tại
    const monthlyRevenue = rental[currentMonth] || 0; // Index 4 cho tháng 5

    console.log(`Doanh thu tháng ${currentMonth + 1}:`, monthlyRevenue); // Debug

    // Cập nhật giá trị lên HTML
    const revenueElement = document.querySelector('.revenue-card .ps-3 h6');
    if (revenueElement) {
        revenueElement.textContent = monthlyRevenue.toLocaleString('vi-VN') + ' VNĐ';
    }
}
// function renderCustomer(customer) {
//     const currentYear = new Date().getFullYear(); // 2025
//     console.log("Năm hiện tại:", currentYear); // Debug năm

//     const yearlyCustomers = customer.filter(item => {
//         const year = new Date(item.create_at).getFullYear();
//         console.log("Khách hàng:", item.name, "Năm:", year); // Debug từng khách
//         return year === currentYear;
//     }).length;

//     console.log("Số khách hàng:", yearlyCustomers); // Debug kết quả

//     const customerElement = document.querySelector('.customers-card .ps-3 h6');
//     if (customerElement) {
//         customerElement.textContent = yearlyCustomers.toLocaleString('vi-VN');
//     } else {
//         console.log("Không tìm thấy element HTML");
//     }
// }
function renderCustomer(customer) {
    const currentYear = new Date().getFullYear(); // 2025
    console.log("Năm hiện tại:", currentYear); // Debug năm

    // Giả định mảng customer là số khách hàng theo tháng (12 tháng)
    const totalCustomers = customer.reduce((sum, item, index) => {
        // Chỉ tính tổng đến tháng hiện tại (tháng 5, index 4)
        if (index <= 4) { // Tháng 0 là tháng 1, tháng 4 là tháng 5
            console.log(`Tháng ${index + 1}: ${item} khách`);
            return sum + item;
        }
        return sum;
    }, 0);

    console.log("Tổng số khách hàng:", totalCustomers); // Debug kết quả

    const customerElement = document.querySelector('.customers-card .ps-3 h6');
    if (customerElement) {
        customerElement.textContent = totalCustomers.toLocaleString('vi-VN');
    } else {
        console.log("Không tìm thấy element HTML");
    }
}
//Biểu đồ

// function updateChart(rental, customer) {
//     // Sắp xếp dữ liệu rental theo thời gian
//     const rentalData = rental.map(item => ({
//         total_price: item.totalPrice,
//         rental_start_time: new Date(item.rentalStartTime)
//     }));

//     // Sắp xếp dữ liệu rental theo thời gian tăng dần
//     rentalData.sort((a, b) => a.rentalStartTime - b.rentalStartTime);

//     // Tạo mảng salesData và revenueData từ rental
//     const salesData = rentalData.map(item => item.totalPrice);
//     const revenueData = rentalData.map(item => item.totalPrice);

//     // Đảm bảo có đủ dữ liệu cho mỗi điểm thời gian
//     const customersData = rentalData.map((item, index) => {
//         // Giả sử mỗi rental là một khách hàng mới (có thể thay đổi tùy vào cách tính)
//         return customer.filter(c => {
//             const customerYear = new Date(c.createdAt).getFullYear();
//             const rentalYear = item.rentalStartTime.getFullYear();
//             return customerYear === rentalYear; // Lọc khách hàng trong cùng năm
//         }).length;
//     });

//     // Lấy danh sách thời gian từ rentalData
//     const timeCategories = rentalData.map(item => item.rentalStartTime.toISOString());

//     // Cập nhật biểu đồ
//     const chart = new ApexCharts(document.querySelector("#reportsChart"), {
//         series: [{
//             name: 'Sales',
//             data: salesData,
//         }, {
//             name: 'Revenue',
//             data: revenueData
//         }, {
//             name: 'Customers',
//             data: customersData
//         }],
//         chart: {
//             height: 350,
//             type: 'area',
//             toolbar: {
//                 show: false
//             },
//         },
//         markers: {
//             size: 4
//         },
//         colors: ['#4154f1', '#2eca6a', '#ff771d'],
//         fill: {
//             type: "gradient",
//             gradient: {
//                 shadeIntensity: 1,
//                 opacityFrom: 0.3,
//                 opacityTo: 0.4,
//                 stops: [0, 90, 100]
//             }
//         },
//         dataLabels: {
//             enabled: false
//         },
//         stroke: {
//             curve: 'smooth',
//             width: 2
//         },
//         xaxis: {
//             type: 'datetime',
//             categories: timeCategories // Sử dụng thời gian đã sắp xếp cho trục X
//         },
//         tooltip: {
//             x: {
//                 format: 'dd/MM/yy HH:mm'
//             },
//         }
//     });

//     chart.render();
// }
function updateChart(rental, rentaldaily, customer) {
    // Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(rental) || !Array.isArray(rentaldaily) || !Array.isArray(customer)) {
        console.error("Dữ liệu không hợp lệ:", { rental, rentaldaily, customer });
        return;
    }

    // Tạo danh sách tháng cho trục X (12 tháng trong năm 2025)
    const today = new Date();
    const currentYear = today.getFullYear(); // 2025
    const timeCategories = Array.from({ length: 12 }, (_, index) => {
        // Tạo ngày đầu tiên của mỗi tháng (ví dụ: 2025-01-01, 2025-02-01,...)
        return new Date(currentYear, index, 1).toISOString();
    });

    // Dữ liệu doanh thu hàng ngày (Sales) - Chỉ lấy dữ liệu tháng hiện tại (tháng 5)
    const currentMonth = today.getMonth(); // Tháng 5 (index 4)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Số ngày trong tháng 5 (31)
    const dailyTimeCategories = Array.from({ length: daysInMonth }, (_, index) => {
        // Tạo ngày trong tháng hiện tại (2025-05-01, 2025-05-02,...)
        return new Date(currentYear, currentMonth, index + 1).toISOString();
    });
    const salesData = rentaldaily.slice(0, daysInMonth); // Dữ liệu doanh thu hàng ngày (31 ngày)

    // Dữ liệu doanh thu hàng tháng (Revenue) - 12 tháng
    const revenueData = rental;

    // Dữ liệu khách hàng hàng tháng (Customers) - 12 tháng
    const customersData = customer;

    // Cập nhật biểu đồ
    const chart = new ApexCharts(document.querySelector("#reportsChart"), {
        series: [
            {
                name: 'Sales',
                data: salesData, // Doanh thu hàng ngày trong tháng hiện tại
            },
            {
                name: 'Revenue',
                data: revenueData, // Doanh thu hàng tháng
            },
            {
                name: 'Customers',
                data: customersData, // Số khách hàng hàng tháng
            }
        ],
        chart: {
            height: 350,
            type: 'area',
            toolbar: {
                show: false
            },
        },
        markers: {
            size: 4
        },
        colors: ['#4154f1', '#2eca6a', '#ff771d'],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.4,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            type: 'datetime',
            categories: timeCategories, // Trục X là các tháng
        },
        tooltip: {
            x: {
                format: 'MM/yyyy' // Hiển thị tháng/năm trong tooltip
            },
        }
    });

    chart.render();
}