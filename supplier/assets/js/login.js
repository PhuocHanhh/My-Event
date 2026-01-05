
function start() {
    getData((users) => {
        renderBigAvatarProfile(users);
        handleInfo(users);
    });

}

start();

function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // Giải mã phần payload
        console.log("Decoded Token:", payload);
        var userId = payload.userId;  // Lấy userId từ payload
        console.log("User ID:", userId);
    }
    console.log("Token từ localStorage:", token);
    var UserDetailAPI = `http://localhost:8080/event-management/users/${userId}`;
    console.log(UserDetailAPI);
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(UserDetailAPI, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
    ]).then(([users]) => {
        callback(users);
    })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

// Render profile từ thông tin của user đã đăng nhập cũ
// function renderBigAvatarProfile(users) {
//     var listBigProfile = document.querySelector('#big-profile');
//     if (!listBigProfile) return;
//     // Kiểm tra nếu `users` không có dữ liệu
//     if (!users) {
//         listBigProfile.innerHTML = "<p>Không tìm thấy thông tin người dùng!</p>";
//         return;
//     }
//     console.log("Dữ liệu user:", users); // Kiểm tra dữ liệu đầu vào


//     // Hiển thị thông tin user với vai trò mặc định là "Admin"
//     listBigProfile.innerHTML = `

//         <img src="${users.avatar}" alt="Profile" class="rounded-circle">
//         <h2>${users.last_name} ${users.first_name}</h2>
//         <h3>${users.roleName || 'User'}</h3> <!-- Lấy role từ user, mặc định là 'User' nếu không có -->
//         <div class="social-links mt-2">
//             <a href="#" class="twitter"><i class="bi bi-twitter"></i></a>
//             <a href="#" class="facebook"><i class="bi bi-facebook"></i></a>
//             <a href="#" class="instagram"><i class="bi bi-instagram"></i></a>
//             <a href="#" class="linkedin"><i class="bi bi-linkedin"></i></a>
//         </div>
//     `;
// }
//new mới nhất xem ảnh đại diện từ be
function renderBigAvatarProfile(users) {
    var listBigProfile = document.querySelector('#big-profile');
    if (!listBigProfile) return;
    // Kiểm tra nếu `users` không có dữ liệu
    if (!users) {
        listBigProfile.innerHTML = "<p>Không tìm thấy thông tin người dùng!</p>";
        return;
    }
    console.log("Dữ liệu user:", users); // Kiểm tra dữ liệu đầu vào

    // Xử lý ảnh avatar
    let imageUrl = "assets/img/default-avatar.png"; // Ảnh mặc định
    if (users.avatar) {
        try {
            const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
            const fileName = users.avatar.split('/').pop();
            imageUrl = `${baseApiUrl}${fileName}`;
        } catch (error) {
            console.error('Lỗi xử lý ảnh:', error);
            imageUrl = "assets/img/default-avatar.png";
        }
    }

    // Hiển thị thông tin user với vai trò mặc định là "Admin"
    listBigProfile.innerHTML = `
        <img src="${imageUrl}" alt="Profile" class="rounded-circle" onerror="this.src='assets/img/default-avatar.png'">
        <h2>${users.last_name} ${users.first_name}</h2>
        <h3>${users.roleName || 'User'}</h3> <!-- Lấy role từ user, mặc định là 'User' nếu không có -->
        <div class="social-links mt-2">
            <a href="#" class="twitter"><i class="bi bi-twitter"></i></a>
            <a href="#" class="facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" class="instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" class="linkedin"><i class="bi bi-linkedin"></i></a>
        </div>
    `;
}
function handleInfo() {
    var user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        console.error("Không tìm thấy thông tin người dùng!");
        return;
    }

    // Gán thông tin vào các phần tử có ID tương ứng
    document.getElementById("nameinfo").textContent = `${user.last_name} ${user.first_name}`;
    document.getElementById("roleinfo").textContent = user.roleName || 'User';
    document.getElementById("phoneinfo").textContent = user.phone_number;
    document.getElementById("emailinfo").textContent = user.email;
}

// Gọi `handleInfo()` sau khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", handleInfo);

//Cập nhật profile
function updateProfile() {
    // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user) {
        console.error("Không tìm thấy thông tin người dùng!");
        return;
    }
    const currentUserId = user.id; // Lấy ID từ user
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }


    // Gán thông tin vào các ô input
    document.getElementById("lastname").value = user.last_name || "";
    document.getElementById("firstname").value = user.first_name || "";
    console.log("role:", user.roleName);
    document.getElementById("role").textContent = user.roleName || 'User';
    document.getElementById("phone").value = user.phone_number || "";
    document.getElementById("email").value = user.email || "";



    // Xử lý hiển thị ảnh hiện tại
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/profile-img.jpg";

    if (user.avatar) {
        try {
            const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
            const fileName = user.avatar.split('/').pop();
            const imageUrl = `${baseApiUrl}${fileName}`;

            // Log để debug
            console.log('Image URL:', imageUrl);

            // Tạo thẻ img mới
            const newImg = document.createElement('img');
            newImg.id = 'image';
            newImg.style.maxWidth = '300px';
            newImg.style.height = '250px';
            newImg.alt = 'Profile Preview';

            // Thay thế ảnh cũ bằng ảnh mới
            if (imagePreview) {
                imagePreview.parentNode.replaceChild(newImg, imagePreview);
            }

            // Set source cho ảnh mới
            newImg.src = imageUrl;

            // Xử lý lỗi load ảnh
            newImg.onerror = function () {
                console.error('Lỗi tải ảnh:', imageUrl);
                this.src = defaultImagePath;
            };
        } catch (error) {
            console.error('Lỗi xử lý ảnh:', error);
            if (imagePreview) imagePreview.src = defaultImagePath;
        }
    } else {
        if (imagePreview) imagePreview.src = defaultImagePath;
    }

    // Xử lý submit form
    const form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const lastname = document.getElementById("lastname").value;
        const firstname = document.getElementById("firstname").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const inputPicture = document.getElementById("fileInput");

        if (!lastname || !firstname || !email) {
            alert("Vui lòng nhập đầy đủ họ, tên và email!");
            return;
        }

        // Tạo object dữ liệu cập nhật
        const updatedUser = {
            last_name: lastname,
            first_name: firstname,
            phone_number: phone,
            email: email
        };

        // Tạo FormData để gửi dữ liệu và file
        const formData = new FormData();
        if (inputPicture && inputPicture.files[0]) {
            const file = inputPicture.files[0];
            const maxSizeInBytes = 5 * 1024 * 1024; // Giới hạn 5MB
            if (file.size > maxSizeInBytes) {
                alert("File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.");
                return;
            }
            formData.append('file', inputPicture.files[0]);
        }
        formData.append('user', new Blob([JSON.stringify(updatedUser)], {
            type: 'application/json'
        }));

        // Gửi yêu cầu PATCH
        fetch(`http://localhost:8080/event-management/users/${currentUserId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                // 'Content-Type': 'application/json'
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("Cập nhật hồ sơ thành công:", data);
                // Cập nhật localStorage với thông tin mới
                const updatedUserData = { ...user, ...updatedUser };
                if (data.avatar) updatedUserData.avatar = data.avatar;
                localStorage.setItem("user", JSON.stringify(updatedUserData));
                console.log("hình:", data.avatar);
                alert("Cập nhật hồ sơ thành công!");
                window.location.reload();
            })
            .catch(error => {
                console.error('Lỗi cập nhật hồ sơ:', error);
                alert(`Lỗi cập nhật hồ sơ: ${error.message}`);
            });
    });
}



// Hàm xử lý upload ảnh
function handleImageUpload() {
    const fileInput = document.getElementById("fileInput");
    const imagePreview = document.getElementById("image");
    const uploadButton = document.getElementById("inputImage");

    if (!fileInput || !imagePreview || !uploadButton) {
        console.error("Không tìm thấy fileInput, imagePreview hoặc uploadButton!");
        return;
    }

    uploadButton.addEventListener("click", function (event) {
        event.preventDefault();
        console.log("Nút upload được nhấn!");
        fileInput.click();
    });

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            console.log("File được chọn:", file.name);
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                console.log("Đã hiển thị preview ảnh!");
            };
            reader.readAsDataURL(file);
        }
    });
}

// Gọi các hàm sau khi DOM tải xong
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM đã tải xong, gọi updateProfile và handleImageUpload");
    updateProfile();
    handleImageUpload();
});