var LocationAPI = 'http://localhost:3000/location'; // Có thể thêm ?user_id=${user.id} nếu API hỗ trợ
var ProvinceAPI = 'http://localhost:3000/provinces';
var DistrictAPI = 'http://localhost:3000/districts';
var WardAPI = 'http://localhost:3000/wards';

// Lấy thông tin user từ localStorage
const token = localStorage.getItem("token");
let user;
try {
    user = JSON.parse(localStorage.getItem("user"));
    console.log("Dữ liệu user từ localStorage:", user);
} catch (e) {
    console.error("Dữ liệu user không hợp lệ:", e);
    user = null;
}
function start() {
    getData((locations, provinces, districts, wards) => {
        renderLocation(locations);
        // Populate danh sách tỉnh/thành
        if (document.querySelector("#selectCity")) {
            populateCities(provinces);
        }
        // Lưu dữ liệu quận/huyện, phường/xã vào biến toàn cục để sử dụng sau
        window.districts = districts;
        window.wards = wards;
    });
    handleCreateForm();
    if (document.querySelector('#selectCity')) {
        setupEventListeners();
    }


}
start();
function getData(callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(LocationAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Location: ${res.status}`);
            return res.json();
        }),
        // Lấy danh sách tỉnh/thành
        fetch(ProvinceAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Provinces: ${res.status}`);
            return res.json();
        }),
        // Lấy danh sách quận/huyện
        fetch(DistrictAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Districts: ${res.status}`);
            return res.json();
        }),
        // Lấy danh sách phường/xã
        fetch(WardAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Wards: ${res.status}`);
            return res.json();
        })
    ])
        .then(([locations, provinces, districts, wards]) => {
            callback(locations, provinces, districts, wards);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

function renderLocation(locations) {
    var listLocationBlock = document.querySelector('#list-place tbody');
    if (!listLocationBlock) return;

    if (!locations || locations.length === 0) {
        console.warn("Danh sách locations rỗng!");
        listLocationBlock.innerHTML = '<tr><td colspan="5">Không có địa điểm nào</td></tr>';
        return;
    }

    // Lọc địa điểm của user hiện tại
    const userLocations = locations.filter(location => String(location.user_id) === String(user.id));
    if (userLocations.length === 0) {
        console.warn("Không có địa điểm nào thuộc về user hiện tại!");
        listLocationBlock.innerHTML = '<tr><td colspan="5">Bạn chưa sở hữu địa điểm nào</td></tr>';
        return;
    }

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-place')) {
        $('#list-place').DataTable().destroy();
    }

    var htmls = userLocations.map(function (location) {
        return `
            <tr class="list-place-${location.id}">
                <td>${location.name || "Không có tên"}</td>
                <td style="width: 40%;">${location.description || 'Không có mô tả'}</td>
                <td>${location.hourly_rental_fee ? location.hourly_rental_fee.toLocaleString() + " VND" : '0 VND'}</td>
                <td>${location.created_at || "Không xác định"}</td>
                <td>${location.address}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item update-btn" data-id="${location.id}">Cập nhật</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listLocationBlock.innerHTML = htmls.join('');

    // Khởi tạo lại DataTables
    $('#list-place').DataTable({
        "order": [[3, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ địa điểm",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ địa điểm",
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

    // Gán sự kiện dùng delegate để dropdown hoạt động trên tất cả các trang
    $('#list-place tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xóa
    $('#list-place tbody').off('click', '.update-btn').on('click', '.update-btn', function () {
        let locationId = $(this).data('id');
        handleUpdateLocation(locationId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}
// function handleCreateForm() {
//     const createBtn = document.querySelector('#create');
//     if (!createBtn) return;

//     const editLocationId = localStorage.getItem("editLocationId");

//     if (editLocationId) {
//         loadEditForm(editLocationId); // Gọi hàm cập nhật nếu đang chỉnh sửa
//         return;
//     }

//     createBtn.onclick = function (event) {
//         event.preventDefault();

//         const pictureInput = document.querySelector('input[name="picture"]');
//         const name = document.querySelector('input[name="name"]').value;
//         const description = document.querySelector('input[name="description"]').value;
//         const price = document.querySelector('input[name="price"]').value;
//         const cityElement = document.querySelector('select[name="selectCity"]');
//         const districtElement = document.querySelector('select[name="selectDistrict"]');
//         const wardElement = document.querySelector('select[name="selectWard"]');
//         const street = document.querySelector('input[name="inputStreet"]').value;

//         // Validation
//         if (!name || !price || !cityElement?.value || !districtElement?.value || !wardElement?.value || !street) {
//             alert("Vui lòng nhập đầy đủ thông tin: tên địa điểm, giá, tỉnh/thành, quận/huyện, phường/xã và số nhà, tên đường!");
//             return;
//         }

//         if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
//             alert("Vui lòng chọn ảnh cho địa điểm!");
//             return;
//         }

//         // Lấy thông tin người dùng từ localStorage
//         const user = JSON.parse(localStorage.getItem("user"));
//         const userId = user ? user.id : null;

//         if (!userId) {
//             alert("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!");
//             return;
//         }

//         // Lấy tên thay vì ID từ dropdown
//         const city = cityElement.options[cityElement.selectedIndex]?.text;
//         const district = districtElement.options[districtElement.selectedIndex]?.text;
//         const ward = wardElement.options[wardElement.selectedIndex]?.text;

//         // Tạo chuỗi address từ street, ward, district, city
//         const address = `${street}, ${ward}, ${district}, ${city}`.trim();

//         // Create object containing location info
//         const locationData = {
//             img: pictureInput.files[0].name, // Lưu tên file ảnh, giống hàm của sự kiện
//             name: name,
//             description: description,
//             hourly_rental_fee: parseFloat(price),
//             address: address,
//             user_id: userId,
//             created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD
//             updated_at: new Date().toISOString().split('T')[0]
//         };

//         // Tạo địa điểm
//         createLocation(locationData, function (locationResponse) {
//             console.log("Location vừa tạo có ID:", locationResponse.id);
//             console.log("Đã tạo địa điểm thành công:", locationResponse);
//             alert("Tạo địa điểm thành công!");
//             window.location.href = "location_table.html"; // Chuyển hướng sau khi tạo thành công
//         });
//     };
// }
// function createLocation(locationData, callback) {
//     const token = localStorage.getItem("token");
//     if (!token) return alert("Vui lòng đăng nhập lại!");

//     fetch(LocationAPI, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json' // Thêm Content-Type cho JSON
//         },
//         body: JSON.stringify(locationData) // Chuyển locationData thành JSON string
//     })
//         .then(response => {
//             if (!response.ok) throw new Error("Lỗi server: " + response.status);
//             return response.json();
//         })
//         .then(data => {
//             callback(data.result || data);
//         })
//         .catch(error => alert(`Lỗi tạo địa điểm: ${error.message}`));
// }
// Thêm địa điểm
function handleCreateForm() {
    const createBtn = document.querySelector('#create');
    if (!createBtn) return;

    const editLocationId = localStorage.getItem("editLocationId");

    if (editLocationId) {
        loadEditForm(editLocationId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        const pictureInput = document.querySelector('input[name="picture"]');
        const name = document.querySelector('input[name="name"]').value;
        const description = document.querySelector('input[name="description"]').value;
        const price = document.querySelector('input[name="price"]').value;
        const cityElement = document.querySelector('select[name="selectCity"]');
        const districtElement = document.querySelector('select[name="selectDistrict"]');
        const wardElement = document.querySelector('select[name="selectWard"]');
        const street = document.querySelector('input[name="inputStreet"]').value;

        // Validation
        if (!name || !price || !cityElement?.value || !districtElement?.value || !wardElement?.value || !street) {
            alert("Vui lòng nhập đầy đủ thông tin: tên địa điểm, giá, tỉnh/thành, quận/huyện, phường/xã và số nhà, tên đường!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho địa điểm!");
            return;
        }

        // Lấy thông tin người dùng từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.id : null;

        if (!userId) {
            alert("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!");
            return;
        }

        // Lấy tên thay vì ID từ dropdown
        const city = cityElement.options[cityElement.selectedIndex]?.text;
        const district = districtElement.options[districtElement.selectedIndex]?.text;
        const ward = wardElement.options[wardElement.selectedIndex]?.text;

        // Tạo chuỗi address từ street, ward, district, city
        const address = `${street}, ${ward}, ${district}, ${city}`.trim();

        // Create object containing location info
        const locationData = {
            name: name,
            description: description,
            hourly_rental_fee: parseFloat(price), // Đổi tên để khớp với schema backend
            address: address, // Chuỗi địa chỉ nối từ street, ward, district, city
            user_id: userId, // Thêm trường user_id
            created_at: new Date().toISOString().split('T')[0], // Thêm ngày tạo
            updated_at: new Date().toISOString().split('T')[0] // Thêm ngày cập nhật
        };

        // Create FormData
        const formData = new FormData();
        formData.append('file', pictureInput.files[0]);
        formData.append('location', new Blob([JSON.stringify(locationData)], {
            type: 'application/json'
        }));

        createLocation(formData, function (locationResponse) {
            console.log("Location vừa tạo có ID:", locationResponse.id);
            console.log("Đã tạo địa điểm thành công:", locationResponse);
            alert("Tạo địa điểm thành công!");
            window.location.href = "location_table.html"; // Chuyển hướng sau khi tạo thành công
        });
    };
}
function createLocation(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");

    fetch(LocationAPI, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi server");
            return response.json();
        })
        .then(data => {
            callback(data.result || data);
        })
        .catch(error => alert(`Lỗi tạo địa điểm: ${error.message}`));
}

// Populate dropdown tỉnh/thành
function populateCities(provinces) {
    const select = document.querySelector('#selectCity');
    if (!select) return; // Tránh lỗi nếu không tìm thấy phần tử
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province.id;
        option.textContent = province.name;
        select.appendChild(option);
    });
}

// Populate dropdown quận/huyện
function populateDistricts(districts) {
    const select = document.querySelector('#selectDistrict');
    if (!select) return; // Tránh lỗi nếu không tìm thấy phần tử
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.id;
        option.textContent = district.name;
        select.appendChild(option);
    });
}

// Populate dropdown phường/xã
function populateWards(wards) {
    const select = document.querySelector('#selectWard');
    if (!select) return; // Tránh lỗi nếu không tìm thấy phần tử
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;
    wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward.id;
        option.textContent = ward.name;
        select.appendChild(option);
    });
}

// Xử lý sự kiện khi người dùng chọn tỉnh/thành, quận/huyện
function setupEventListeners() {
    const selectCity = document.getElementById("selectCity");
    const selectDistrict = document.getElementById("selectDistrict");

    if (!selectCity || !selectDistrict) return; // Tránh lỗi nếu không tìm thấy phần tử

    selectCity.addEventListener("change", function () {
        const provinceId = this.value;
        if (provinceId) {
            const filteredDistricts = window.districts.filter(d => d.province_id === provinceId);
            populateDistricts(filteredDistricts);
            document.getElementById("selectDistrict").dispatchEvent(new Event("change"));
        } else {
            populateDistricts([]);
            populateWards([]);
        }
    });

    selectDistrict.addEventListener("change", function () {
        const districtId = this.value;
        if (districtId) {
            const filteredWards = window.wards.filter(w => w.district_id === districtId);
            populateWards(filteredWards);
        } else {
            populateWards([]);
        }
    });
}
function handleUpdateLocation(locationId) {
    localStorage.setItem("editLocationId", locationId); // Lưu ID vào localStorage
    window.location.href = "location_manage.html"; // Chuyển đến trang form
}
//Cập nhât địa điểm
function loadEditForm(editLocationId) {
    if (!editLocationId) return;

    console.log("Chỉnh sửa địa điểm ID:", editLocationId);
    const inputPicture = document.querySelector('input[name="picture"]');
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/location/place.jpg"; // Ảnh mặc định mới

    // Lấy token từ localStorage
    let token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return;
    }

    // Hàm fetch với timeout
    const fetchWithTimeout = (url, options, timeout = 10000) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Yêu cầu API timeout")), timeout)
            )
        ]);
    };

    // Hàm để lấy dữ liệu tỉnh/thành, quận/huyện, phường/xã
    const fetchAddressData = () => {
        return Promise.all([
            fetchWithTimeout(ProvinceAPI, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json()),
            fetchWithTimeout(DistrictAPI, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json()),
            fetchWithTimeout(WardAPI, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
        ]).catch(error => {
            console.error("Lỗi khi lấy dữ liệu địa chỉ:", error);
            throw error; // Ném lỗi để xử lý ở cấp cao hơn
        });
    };

    // Lấy danh sách tỉnh/thành, quận/huyện, phường/xã
    fetchAddressData()
        .then(([cities, districts, wards]) => {
            console.log('Dữ liệu địa chỉ:', { cities, districts, wards });

            const selectCity = document.querySelector('select[name="selectCity"]');
            const selectDistrict = document.querySelector('select[name="selectDistrict"]');
            const selectWard = document.querySelector('select[name="selectWard"]');

            // Điền danh sách tỉnh/thành
            selectCity.innerHTML = '<option value="">Chọn tỉnh/thành</option>';
            if (Array.isArray(cities)) {
                cities.forEach(city => {
                    const option = document.createElement("option");
                    option.value = city.id;
                    option.textContent = city.name;
                    selectCity.appendChild(option);
                });
            }

            // Điền danh sách quận/huyện
            selectDistrict.innerHTML = '<option value="">Chọn quận/huyện</option>';
            if (Array.isArray(districts)) {
                districts.forEach(district => {
                    const option = document.createElement("option");
                    option.value = district.id;
                    option.textContent = district.name;
                    selectDistrict.appendChild(option);
                });
            }

            // Điền danh sách phường/xã
            selectWard.innerHTML = '<option value="">Chọn phường/xã</option>';
            if (Array.isArray(wards)) {
                wards.forEach(ward => {
                    const option = document.createElement("option");
                    option.value = ward.id;
                    option.textContent = ward.name;
                    selectWard.appendChild(option);
                });
            }

            // Lấy thông tin địa điểm
            return fetchWithTimeout(`${LocationAPI}/${editLocationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (!response.ok) throw new Error("Lỗi khi lấy thông tin địa điểm");
                return response.json();
            });
        })
        .then(location => {
            console.log('Dữ liệu địa điểm:', location);

            // Điền dữ liệu vào form
            document.querySelector('input[name="name"]').value = location.name || "";
            document.querySelector('input[name="description"]').value = location.description || "";
            document.querySelector('input[name="price"]').value = location.hourly_rental_fee || "";

            // Tách chuỗi address
            const addressParts = location.address ? location.address.split(', ') : [];
            const street = addressParts.length >= 4 ? addressParts[0] : "";
            const ward = addressParts.length >= 3 ? addressParts[1] : "";
            const district = addressParts.length >= 2 ? addressParts[2] : "";
            const city = addressParts.length >= 1 ? addressParts[3] : "";

            // Điền giá trị vào các select và input
            document.querySelector('input[name="inputStreet"]').value = street || "";

            const selectCity = document.querySelector('select[name="selectCity"]');
            const selectDistrict = document.querySelector('select[name="selectDistrict"]');
            const selectWard = document.querySelector('select[name="selectWard"]');

            const cityOption = Array.from(selectCity.options).find(option => option.textContent === city);
            if (cityOption) selectCity.value = cityOption.value;

            const districtOption = Array.from(selectDistrict.options).find(option => option.textContent === district);
            if (districtOption) selectDistrict.value = districtOption.value;

            const wardOption = Array.from(selectWard.options).find(option => option.textContent === ward);
            if (wardOption) selectWard.value = wardOption.value;

            // Xử lý hiển thị ảnh
            if (location.img && imagePreview) {
                try {
                    const baseApiUrl = 'http://localhost:8080/location-management/api/v1/FileUpload/files/';
                    const fileName = location.img.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    console.log('URL ảnh:', imageUrl);

                    imagePreview.src = imageUrl;
                    imagePreview.style.maxWidth = '500px';
                    imagePreview.style.height = '400px';
                    imagePreview.alt = 'Xem trước địa điểm';

                    imagePreview.onerror = () => {
                        console.error('Lỗi tải ảnh:', imageUrl);
                        imagePreview.src = defaultImagePath;
                    };
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    imagePreview.src = defaultImagePath;
                }
            } else {
                if (imagePreview) imagePreview.src = defaultImagePath;
            }

            // Đổi nút "Lưu" thành "Cập nhật"
            const createButton = document.querySelector("#create");
            if (createButton) {
                createButton.textContent = "Cập nhật";
                createButton.onclick = function (event) {
                    event.preventDefault();

                    const inputPicture = document.querySelector('input[name="picture"]');
                    const inputName = document.querySelector('input[name="name"]').value;
                    const inputDescription = document.querySelector('input[name="description"]').value;
                    const inputPrice = document.querySelector('input[name="price"]').value;
                    const cityElement = document.querySelector('select[name="selectCity"]');
                    const districtElement = document.querySelector('select[name="selectDistrict"]');
                    const wardElement = document.querySelector('select[name="selectWard"]');
                    const street = document.querySelector('input[name="inputStreet"]').value;

                    // Validation
                    if (!inputName || !inputPrice || !cityElement?.value || !districtElement?.value || !wardElement?.value || !street) {
                        alert("Vui lòng nhập đầy đủ thông tin: tên địa điểm, giá, tỉnh/thành, quận/huyện, phường/xã và số nhà, tên đường!");
                        return;
                    }

                    // Lấy tên thay vì ID từ dropdown
                    const city = cityElement.options[cityElement.selectedIndex]?.text;
                    const district = districtElement.options[districtElement.selectedIndex]?.text;
                    const ward = wardElement.options[wardElement.selectedIndex]?.text;

                    // Tạo chuỗi address
                    const address = `${street}, ${ward}, ${district}, ${city}`.trim();

                    const updatedLocation = {
                        name: inputName,
                        description: inputDescription,
                        hourly_rental_fee: parseFloat(inputPrice) || 0,
                        address: address,
                        user_id: location.user_id,
                        created_at: location.created_at,
                        updated_at: new Date().toISOString().split('T')[0]
                    };

                    // Tạo FormData
                    const formData = new FormData();
                    if (inputPicture.files[0]) {
                        formData.append('file', inputPicture.files[0]);
                    }
                    formData.append('location', new Blob([JSON.stringify(updatedLocation)], {
                        type: 'application/json'
                    }));

                    // Gửi yêu cầu cập nhật
                    fetchWithTimeout(`${LocationAPI}/${editLocationId}`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    })
                        .then(response => {
                            if (!response.ok) throw new Error("Lỗi server");
                            return response.json();
                        })
                        .then(data => {
                            const locationResponse = data.result || data;
                            console.log("Đã cập nhật địa điểm thành công:", locationResponse);
                            alert("Cập nhật địa điểm thành công!");
                            window.location.href = "location_table.html";
                        })
                        .catch(error => {
                            console.error('Lỗi cập nhật địa điểm:', error);
                            alert(`Lỗi cập nhật địa điểm: ${error.message}`);
                        });
                };
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
           // alert(`Lỗi khi tải dữ liệu: ${error.message}`);
            if (imagePreview) imagePreview.src = defaultImagePath; // Đảm bảo ảnh mặc định được hiển thị
        });
}
