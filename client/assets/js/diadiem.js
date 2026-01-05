// Định nghĩa các API endpoint
var LocationAPI = 'http://localhost:8080/event-management/locations'; // API quản lý địa điểm
var ProvinceAPI = 'https://provinces.open-api.vn/api/p'; // API lấy danh sách tỉnh/thành phố
var DistrictAPI = 'https://provinces.open-api.vn/api/p/'; // API lấy quận/huyện
var WardAPI = 'https://provinces.open-api.vn/api/d/'; // API lấy phường/xã

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

// Hàm khởi động ứng dụng
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

// Hàm lấy dữ liệu từ API
function getData(callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        // Lấy danh sách locations
        fetch(`${LocationAPI}/list`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi LocationAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),
        // Lấy danh sách tỉnh/thành phố
        fetch(ProvinceAPI).then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi ProvinceAPI: ${res.status} - ${text}`);
                });
            }
            return res.json();
        }),
    ])
        .then(([locations, provinces]) => {
            locations = locations.data?.items || [];
            provinces = provinces || [];

            // Lấy tất cả quận/huyện từ các tỉnh/thành phố
            const districtPromises = provinces.map(province =>
                fetch(DistrictAPI.replace('{province_code}', province.code)).then(res => {
                    if (!res.ok) {
                        return res.text().then(text => {
                            throw new Error(`Lỗi DistrictAPI: ${res.status} - ${text}`);
                        });
                    }
                    return res.json();
                })
            );

            return Promise.all(districtPromises)
                .then(districtResponses => {
                    const districts = [];
                    districtResponses.forEach((response, index) => {
                        const province = provinces[index];
                        const districtList = response.districts || [];
                        districtList.forEach(district => {
                            district.province_id = province.code;
                            district.id = district.code;
                            districts.push(district);
                        });
                    });

                    // Lấy tất cả phường/xã từ các quận/huyện
                    const wardPromises = districts.map(district =>
                        fetch(WardAPI.replace('{district_code}', district.code)).then(res => {
                            if (!res.ok) {
                                return res.text().then(text => {
                                    throw new Error(`Lỗi WardAPI: ${res.status} - ${text}`);
                                });
                            }
                            return res.json();
                        })
                    );

                    return Promise.all(wardPromises).then(wardResponses => {
                        const wards = [];
                        wardResponses.forEach((response, index) => {
                            const district = districts[index];
                            const wardList = response.wards || [];
                            wardList.forEach(ward => {
                                ward.district_id = district.code;
                                ward.id = ward.code;
                                wards.push(ward);
                            });
                        });

                        callback(locations, provinces, districts, wards);
                    });
                });
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            callback([], [], [], []);
        });
}

// Hàm hiển thị danh sách địa điểm
function renderLocation(locations) {
    var listLocationBlock = document.querySelector('#list-place tbody');
    if (!listLocationBlock) return;

    if (!locations || locations.length === 0) {
        console.warn("Danh sách locations rỗng!");
        listLocationBlock.innerHTML = '<tr><td colspan="5">Không có địa điểm nào</td></tr>';
        return;
    }

    const userLocations = locations.filter(location => String(location.userID) === String(user.id));
    if (userLocations.length === 0) {
        console.warn("Không có địa điểm nào thuộc về user hiện tại!");
        listLocationBlock.innerHTML = '<tr><td colspan="5">Bạn chưa sở hữu địa điểm nào</td></tr>';
        return;
    }

    if ($.fn.DataTable.isDataTable('#list-place')) {
        $('#list-place').DataTable().destroy();
    }

    var htmls = userLocations.map(function (location) {
        return `
            <tr class="list-place-${location.id}">
                <td>${location.name || "Không có tên"}</td>
                <td style="width: 40%;">${location.description || 'Không có mô tả'}</td>
                <td>${location.hourly_rental_fee ? location.hourly_rental_fee.toLocaleString() + " VND" : '0 VND'}</td>
                <td>${location.created_at ? new Date(location.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
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

    $('#list-place').DataTable({
        "order": [[3, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "",
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

    $('#list-place tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-place tbody').off('click', '.update-btn').on('click', '.update-btn', function () {
        let locationId = $(this).data('id');
        handleUpdateLocation(locationId);
    });

    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}

// Hàm xử lý form tạo hoặc chỉnh sửa địa điểm
function handleCreateForm() {
    const createBtn = document.querySelector('#create');
    if (!createBtn) return;

    const editLocationId = localStorage.getItem("editLocationId");

    if (editLocationId) {
        loadEditForm(editLocationId);
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

        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.id : null;

        if (!userId) {
            alert("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!");
            return;
        }

        const city = cityElement.options[cityElement.selectedIndex]?.text;
        const district = districtElement.options[districtElement.selectedIndex]?.text;
        const ward = wardElement.options[wardElement.selectedIndex]?.text;

        const address = `${street}, ${ward}, ${district}, ${city}`.trim();

        const locationData = {
            // img: pictureInput.files[0].name,
            name: name,
            description: description,
            hourly_rental_fee: parseFloat(price),
            address: address,
            userID: userId
        };

        // Create FormData
        const formData = new FormData();

        // Append file with key 'file'
        formData.append('file', pictureInput.files[0]);

        // Append service data as JSON string with key 'service'
        formData.append('service', new Blob([JSON.stringify(locationData)], {
            type: 'application/json'
        }));

        createLocation(formData, function (locationResponse) {
            console.log("Location vừa tạo có ID:", locationResponse.id);
            console.log("Đã tạo địa điểm thành công:", locationResponse);
            alert("Tạo địa điểm thành công!");
            window.location.href = "location_table.html";
        });
    };
}

// Hàm tạo địa điểm mới
function createLocation(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");

    fetch(`${LocationAPI}/new`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi server: " + response.status);
            return response.json();
        })
        .then(data => {
            callback(data.result || data);
        })
        .catch(error => alert(`Lỗi tạo địa điểm: ${error.message}`));
}

// Hàm điền dữ liệu tỉnh/thành phố vào dropdown
function populateCities(provinces) {
    const citySelect = document.querySelector('select[name="selectCity"]');
    const currentValue = citySelect.value; // Lưu giá trị hiện tại của dropdown

    // Xóa các tùy chọn cũ
    citySelect.innerHTML = '<option value="">Chọn một tùy chọn</option>';

    // Thêm các tùy chọn mới
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province.code; // Giả sử province có code
        option.text = province.name;
        citySelect.appendChild(option);
    });

    // Khôi phục giá trị đã chọn nếu có
    if (currentValue) {
        citySelect.value = currentValue;
    }
}

// Hàm điền dữ liệu quận/huyện vào dropdown
function populateDistricts(districts) {
    const select = document.querySelector('#selectDistrict');
    if (!select) return;
    select.innerHTML = `<option value="">Chọn quận/huyện</option>`;
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.code;
        option.textContent = district.name;
        select.appendChild(option);
    });
}

// Hàm điền dữ liệu phường/xã vào dropdown
function populateWards(wards) {
    const select = document.querySelector('#selectWard');
    if (!select) return;
    select.innerHTML = `<option value="">Chọn phường/xã</option>`;
    wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward.code;
        option.textContent = ward.name;
        select.appendChild(option);
    });
}

// Hàm thiết lập các sự kiện lắng nghe cho dropdown
function setupEventListeners() {
    const selectCity = document.getElementById("selectCity");
    const selectDistrict = document.getElementById("selectDistrict");

    if (!selectCity || !selectDistrict) return;

    selectCity.addEventListener("change", function () {
        const provinceId = this.value;
        if (provinceId) {
            fetch(`${DistrictAPI}${provinceId}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    const districts = data.districts || [];
                    populateDistricts(districts);
                    populateWards([]); // Reset phường/xã khi đổi quận/huyện
                })
                .catch(error => {
                    console.error("Lỗi lấy quận/huyện:", error);
                    populateDistricts([]);
                    populateWards([]);
                });
        } else {
            populateDistricts([]);
            populateWards([]);
        }
    });

    selectDistrict.addEventListener("change", function () {
        const districtId = this.value;
        if (districtId) {
            fetch(`${WardAPI}${districtId}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    const wards = data.wards || [];
                    populateWards(wards);
                })
                .catch(error => {
                    console.error("Lỗi lấy phường/xã:", error);
                    populateWards([]);
                });
        } else {
            populateWards([]);
        }
    });
}

// Hàm xử lý cập nhật địa điểm
function handleUpdateLocation(locationId) {
    localStorage.setItem("editLocationId", locationId);
    window.location.href = "location_manage.html";
}

// Hàm tải form chỉnh sửa địa điểm
function loadEditForm(editLocationId) {
    if (!editLocationId) return;

    console.log("Chỉnh sửa địa điểm ID:", editLocationId);
    const inputPicture = document.querySelector('input[name="picture"]');
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/location/place.jpg";

    let token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return;
    }

    // Fetch provinces first
    fetch(ProvinceAPI)
        .then(res => res.json())
        .then(provinces => {
            populateCities(provinces);

            // Then fetch location data
            return fetch(`${LocationAPI}/${editLocationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        })
        .then(response => response.json())
        .then(async locationData => {
            const location = locationData.data;
            console.log('Dữ liệu địa điểm:', location);

            // Fill basic information
            document.querySelector('input[name="name"]').value = location.name || "";
            document.querySelector('input[name="description"]').value = location.description || "";
            document.querySelector('input[name="price"]').value = location.hourly_rental_fee || "";

            // Process address
            const addressParts = location.address ? location.address.split(', ').map(part => part.trim()) : [];
            console.log('Các phần của địa chỉ:', addressParts);

            const city = addressParts[addressParts.length - 1];
            const district = addressParts[addressParts.length - 2] || "";
            const ward = addressParts[addressParts.length - 3] || "";
            const street = addressParts[0] || "";

            // Fill street
            document.querySelector('input[name="inputStreet"]').value = street;

            // Select city and load related data
            const citySelect = document.querySelector('select[name="selectCity"]');
            const cityOptions = Array.from(citySelect.options);
            console.log('Tùy chọn tỉnh/thành phố trong dropdown:', cityOptions.map(option => option.text)); // Debug
            const cityOption = cityOptions.find(option => option.text === city);

            if (cityOption) {
                cityOption.selected = true;

                // Load districts
                const districtResponse = await fetch(`${DistrictAPI}${cityOption.value}?depth=2`);
                const districtData = await districtResponse.json();
                const districts = districtData.districts || [];
                populateDistricts(districts);

                // Select district and load wards
                const districtSelect = document.querySelector('select[name="selectDistrict"]');
                const districtOptions = Array.from(districtSelect.options);
                const districtOption = districtOptions.find(option => option.text === district);

                if (districtOption) {
                    districtOption.selected = true;

                    // Load wards
                    const wardResponse = await fetch(`${WardAPI}${districtOption.value}?depth=2`);
                    const wardData = await wardResponse.json();
                    const wards = wardData.wards || [];
                    populateWards(wards);

                    // Select ward
                    const wardSelect = document.querySelector('select[name="selectWard"]');
                    const wardOptions = Array.from(wardSelect.options);
                    const wardOption = wardOptions.find(option => option.text === ward);
                    if (wardOption) {
                        wardOption.selected = true;
                    }
                }
                else {
                    console.error('Không tìm thấy tỉnh/thành phố trong dropdown:', city);
                }
            }

            // Handle image
            if (location.image && imagePreview) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = location.image.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;
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

            // Handle update button
            const createButton = document.querySelector("#create");
            if (createButton) {
                createButton.textContent = "Cập nhật";
                createButton.onclick = function (event) {
                    event.preventDefault();

                    const inputPicture = document.querySelector('input[name="picture"]');
                    const inputName = document.querySelector('input[name="name"]').value;
                    const inputDescription = document.querySelector('input[name="description"]').value;
                    const inputPrice = document.querySelector('input[name="price"]').value;
                    const street = document.querySelector('input[name="inputStreet"]').value;
                    const cityElement = document.querySelector('select[name="selectCity"]');
                    const districtElement = document.querySelector('select[name="selectDistrict"]');
                    const wardElement = document.querySelector('select[name="selectWard"]');

                    if (!inputName || !inputPrice || !cityElement?.value || !districtElement?.value || !wardElement?.value || !street) {
                        alert("Vui lòng nhập đầy đủ thông tin!");
                        return;
                    }

                    const selectedCity = cityElement.options[cityElement.selectedIndex].text;
                    const selectedDistrict = districtElement.options[districtElement.selectedIndex].text;
                    const selectedWard = wardElement.options[wardElement.selectedIndex].text;

                    const address = `${street}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`.trim();

                    const updatedLocation = {
                        name: inputName,
                        description: inputDescription,
                        hourly_rental_fee: parseFloat(inputPrice) || 0,
                        address: address
                    };

                    // Tạo FormData
                    const formData = new FormData();
                    if (inputPicture.files[0]) {
                        formData.append('file', inputPicture.files[0]);
                    }
                    formData.append('location', new Blob([JSON.stringify(updatedLocation)], {
                        type: 'application/json'
                    }));

                    fetch(`${LocationAPI}/${editLocationId}`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    })
                        .then(response => {
                            if (!response.ok) throw new Error("Lỗi server");
                            return response.json();
                        })
                        .then(data => {
                            console.log("Đã cập nhật địa điểm thành công:", data);
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
            console.error('Lỗi:', error);
            // alert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
            if (imagePreview) imagePreview.src = defaultImagePath;
        });
}