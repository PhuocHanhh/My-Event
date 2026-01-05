document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const verifyForm = document.getElementById("verifyForm");

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
    if (verifyForm) {
        verifyForm.addEventListener("submit", handleVerify);
        setupVerificationInputs();
    }

    // Thiết lập validation cho các trường
    setupValidation("lastName", "Vui lòng nhập họ!");
    setupValidation("firstName", "Vui lòng nhập tên!");
    setupValidation("email", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email có dạng abc@gmail.com!");
    setupValidation("phone", "Vui lòng nhập số điện thoại!", /^(03|05|07|08|09)\d{8}$/, "Số điện thoại có đủ 10 chữ số!");
    setupValidation("password", "Vui lòng nhập mật khẩu!", /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số!");
});

function setupVerificationInputs() {
    const inputs = document.querySelectorAll('.verification-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

// Xử lý form đăng ký
// async function handleRegister(event) {
//     event.preventDefault();

//     const ho = getValue("lastName");
//     const ten = getValue("firstName");
//     const email = getValue("email");
//     const phone = getValue("phone");
//     const password = getValue("password");

//     // Kiểm tra dữ liệu đầu vào
//     if (!ho) return showAlert("Vui lòng nhập họ!", "danger");
//     if (!ten) return showAlert("Vui lòng nhập tên!", "danger");
//     if (!email) return showAlert("Vui lòng nhập email!", "danger");
//     if (!phone) return showAlert("Vui lòng nhập số điện thoại!", "danger");
//     if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) return showAlert("Số điện thoại không hợp lệ!", "danger");
//     if (!password) return showAlert("Vui lòng nhập mật khẩu!", "danger");

//     const formData = {
//         first_name: ten,
//         last_name: ho,
//         email,
//         phone_number: phone,
//         password,
//         role_id: 2, // Giả định role_id = 2 cho user thường
//         avatar: "https://example.com/default-avatar.jpg", // Avatar mặc định
//     };

//     try {
//         const response = await fetch("http://localhost:8080/event-management/users/signing-up", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(formData),
//         });

//         const data = await response.json();

//         if (response.ok) {
//             showAlert("Đã gửi mã xác thực đến email của bạn!", "success");
//             localStorage.setItem("tempUser", JSON.stringify(data.user));
//             document.getElementById("registerForm").style.display = "none";
//             document.getElementById("verifyForm").style.display = "block";
//         } else {
//             showAlert(data.message || "Đăng ký thất bại! Vui lòng thử lại.", "danger");
//         }
//     } catch (error) {
//         showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
//         console.error("Lỗi trong handleRegister:", error);
//     }
// }


async function handleRegister(event) {
    event.preventDefault();

    const ho = getValue("lastName");
    const ten = getValue("firstName");
    const email = getValue("email");
    const phone = getValue("phone");
    // const passwordInput = getValue("password");
    const password = getValue("password");

    if (!ho) return showAlert("Vui lòng nhập họ!", "danger");
    if (!ten) return showAlert("Vui lòng nhập tên!", "danger");
    if (!email) return showAlert("Vui lòng nhập email!", "danger");
    if (!phone) return showAlert("Vui lòng nhập số điện thoại!", "danger");
    if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) return showAlert("Số điện thoại không hợp lệ!", "danger");
    if (!password) return showAlert("Vui lòng nhập mật khẩu!", "danger");
    if (password.length < 8) return showAlert("Mật khẩu phải có ít nhất 8 ký tự!", "danger");


    const formData = {
        first_name: ten,
        last_name: ho,
        email,
        phoneNumber: phone,
        password,
        role_id: 2,
        avatar: "https://example.com/default-avatar.jpg",
    };

    try {
        const response = await fetch("http://localhost:8080/event-management/users/signing-up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        console.log("Response status:", response.status);
        console.log("Response data:", data);

        // Kiểm tra mã trạng thái và data.result
        if ((response.status === 200 || response.status === 201) && data.result) {
            showAlert("Đã gửi mã xác thực đến email của bạn!", "success");
            localStorage.setItem("tempUser", JSON.stringify(data.result));
            console.log("tempUser đã lưu:", localStorage.getItem("tempUser"));

            const registerForm = document.getElementById("registerForm");
            const verifyForm = document.getElementById("verifyForm");

            if (registerForm && verifyForm) {
                registerForm.style.display = "none";
                verifyForm.style.display = "block";
                console.log("Đã chuyển sang verifyForm");
            } else {
                console.error("Không tìm thấy registerForm hoặc verifyForm!");
                showAlert("Lỗi giao diện, vui lòng tải lại trang!", "danger");
            }
        } else {
            showAlert(data.message || "Đăng ký thất bại! Vui lòng thử lại.", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleRegister:", error);
    }
}
// Toggle hiển thị mật khẩu
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
}

// Real-time validation cho mật khẩu
// const passwordInputElement = document.getElementById('password');
// const passwordError = document.getElementById('passwordError');

// if (passwordInputElement && passwordError) {
//     passwordInputElement.addEventListener('input', function () {
//         if (passwordInputElement.value.length < 8 && passwordInputElement.value.length > 0) {
//             passwordError.textContent = 'Mật khẩu phải có ít nhất 8 ký tự.';
//             passwordError.style.display = 'block';
//         } else {
//             passwordError.textContent = '';
//             passwordError.style.display = 'none';
//         }
//     });
// }
// async function handleVerify(event) {
//     event.preventDefault();

//     // const verificationCode = getValue("verificationCode");
//     const verificationCode = [
//         getValue("code1"),
//         getValue("code2"),
//         getValue("code3"),
//         getValue("code4"),
//         getValue("code5"),
//         getValue("code6")
//     ].join('');
//     const tempUser = JSON.parse(localStorage.getItem("tempUser"));

//     // if (!verificationCode) return showAlert("Vui lòng nhập mã xác thực!", "danger");
//     if (verificationCode.length !== 6) return showAlert("Vui lòng nhập đầy đủ 6 ký tự mã xác thực!", "danger");
//     if (!tempUser) return showAlert("Dữ liệu người dùng tạm thời không tồn tại!", "danger");

//     try {
//         // Tạo URL với code là query parameter
//         const url = `http://localhost:8080/event-management/api/verification/verify?code=${verificationCode}`;
//         console.log("Request URL:", url);

//         const response = await fetch(url, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         });

//         const data = await response.json();
//         console.log("Response status:", response.status);
//         console.log("Response data:", data);

//         if (response.ok) {
//             showAlert("Đăng ký thành công!", "success");
//             localStorage.setItem("token", data.token);
//             localStorage.setItem("user", JSON.stringify(data.user));
//             localStorage.removeItem("tempUser");

//             if (typeof window.updateHeader === "function") {
//                 window.updateHeader();
//             }

//             setTimeout(() => (window.location.href = "login.html"), 2000);
//         } else {
//             showAlert(data.message || "Mã xác thực không đúng!", "danger");
//         }
//     } catch (error) {
//         showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
//         console.error("Lỗi trong handleVerify:", error);
//     }
// }

async function handleVerify(event) {
    event.preventDefault();

    const verificationCode = [
        getValue("code1"),
        getValue("code2"),
        getValue("code3"),
        getValue("code4"),
        getValue("code5"),
        getValue("code6")
    ].join('');
    const tempUser = JSON.parse(localStorage.getItem("tempUser"));

    if (verificationCode.length !== 6) return showAlert("Vui lòng nhập đầy đủ 6 ký tự mã xác thực!", "danger");
    if (!tempUser) return showAlert("Dữ liệu người dùng tạm thời không tồn tại!", "danger");

    try {
        // Tạo URL với code là query parameter
        const url = `http://localhost:8080/event-management/api/verification/verify?code=${verificationCode}`;
        console.log("Request URL:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        console.log("Response status:", response.status);

        // Kiểm tra Content-Type trước khi parse
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Nếu không phải JSON, đọc như text
            const text = await response.text();
            data = { message: text };
        }

        console.log("Response data:", data);

        if (response.ok) {
            showAlert("Đăng ký thành công!", "success");
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.removeItem("tempUser");

            if (typeof window.updateHeader === "function") {
                window.updateHeader();
            }

            setTimeout(() => (window.location.href = "login.html"), 2000);
        } else {
            showAlert(data.message || "Mã xác thực không đúng!", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleVerify:", error);
    }
}
