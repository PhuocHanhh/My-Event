const BASE_URL = "http://localhost:8080/event-management";

// Thêm sự kiện beforeunload để xóa openContractAfterLogin nếu chưa đăng nhập
window.addEventListener("beforeunload", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.removeItem("openContractAfterLogin");
    }
});

// Hàm lấy query parameter từ URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Hàm hiển thị thông báo
function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = "block";
    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);
}

// Hàm đăng nhập
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    getUser(email, password, handleLogin);
}

function getUser(email, password, callback) {
    fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((res) => res.json())
        .then(callback)
        .catch((error) => {
            console.error("Lỗi kết nối đến server:", error);
            toastr.error("Không thể kết nối đến server!", "Lỗi");
        });
}

function handleLogin(data) {
    toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 2000,
        closeButton: true,
        progressBar: true,
    };

    if (data.code === 1000 && data.result) {
        const body = data.result;

        // Lưu token
        localStorage.setItem("token", body.token);
        console.log("Token: ", body.token);
        if (body) {
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: body.user?.id,
                    email: body.user?.email,
                    last_name: body.user?.last_name,
                    first_name: body.user?.first_name,
                    avatar: body.user?.avatar,
                    phone_number: body.user?.phone_number,
                    roleName: body.user?.roleName // Lưu role_id 
                })
            );
            console.log("User info saved to localStorage:", body.user);
            console.log("avatar:", body.user?.avatar); // Kiểm tra roleName
        } else {
            console.error("No user data in response");
        }

        // Hiển thị thông báo thành công
        toastr.success("Đăng nhập thành công!", "Thành công");
        console.log("Data từ API:", data);
        console.log("User nhận được:", data.result);

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
            window.location.href = "home.html";
        }, 2000);
    } else {
        toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
    }
}
// Hàm xử lý quên mật khẩu
async function handleForgotPassword(event) {
    event.preventDefault();

    const forgotEmail = document.getElementById("forgotEmail").value;

    if (!forgotEmail) return showAlert("Vui lòng nhập email!", "danger");

    const submitButton = event.target.querySelector("button[type='submit']");
    toggleButtonState(submitButton, true, "Đang gửi...", "GỬI YÊU CẦU");

    // submitButton.disabled = true;
    // submitButton.textContent = "Đang gửi...";

    try {
        const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: forgotEmail,
            }),
        });

        const result = await response.json();

        if (response.ok && result.code === 1000) {
            showAlert("Yêu cầu đã được gửi! Vui lòng kiểm tra email.", "success");
            localStorage.setItem("resetEmail", forgotEmail); // Lưu email tạm thời
            setTimeout(() => {
                switchForm("verify");
            }, 2000);
        } else {
            showAlert(result.message || "Email không tồn tại!", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleForgotPassword:", error);
    } finally {
        toggleButtonState(submitButton, false, "Đang gửi...", "GỬI YÊU CẦU");

        // submitButton.disabled = false;
        // submitButton.textContent = "GỬI YÊU CẦU";
    }
}
async function handleResetPassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const token = localStorage.getItem("resetToken");
    const email = localStorage.getItem("resetEmail");
    console.log("Token:", token);
    console.log("Email:", email);

    const submitButton = event.target.querySelector("button[type='submit']");
    toggleButtonState(submitButton, true, "Đang cập nhật...", "GỬI YÊU CẦU");

    // submitButton.disabled = true;
    // submitButton.textContent = "Đang cập nhật...";

    if (!token) {
        showAlert("Mã xác thực không hợp lệ! Vui lòng thử lại.", "danger");
        toggleButtonState(submitButton, false, "Đang gửi...", "CẬP NHẬT MẬT KHẨU");

        // submitButton.disabled = false;
        // submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
        return;
    }

    if (!newPassword) {
        showAlert("Vui lòng nhập mật khẩu mới!", "danger");
        toggleButtonState(submitButton, false, "Đang gửi...", "CẬP NHẬT MẬT KHẨU");

        // submitButton.disabled = false;
        // submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert("Mật khẩu xác nhận không khớp!", "danger");
        toggleButtonState(submitButton, false, "Đang gửi...", "CẬP NHẬT MẬT KHẨU");
        // submitButton.disabled = false;
        // submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
        return;
    }
    var code = token;
    try {
        const response = await fetch(`${BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                code,
                newPassword,
            }),
        });

        const result = await response.json();

        if (response.ok && result.code === 1000) {
            showAlert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.", "success");
            localStorage.removeItem("resetToken");
            localStorage.removeItem("resetEmail");
            setTimeout(() => {
                switchForm("login");
            }, 2000);
        } else {
            showAlert(result.message || "Lỗi khi đặt lại mật khẩu! Vui lòng thử lại.", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleResetPassword:", error);
    } finally {
        toggleButtonState(submitButton, false, "Đang gửi...", "CẬP NHẬT MẬT KHẨU");
        // submitButton.disabled = false;
        // submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
    }
}
function toggleButtonState(button, isLoading, loadingText = "Đang xử lý...", normalText = "Xác nhận") {
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : normalText;
}
// Hàm chuyển đổi form
function switchForm(formType) {
    const loginSection = document.getElementById("loginSection");
    const forgotPasswordSection = document.getElementById("forgotPasswordSection");
    const verifySection = document.getElementById("verifySection");
    const resetPasswordSection = document.getElementById("resetPasswordSection");
    const formTitle = document.getElementById("formTitle");
    const alertBox = document.getElementById("alertBox");

    loginSection.style.display = "none";
    forgotPasswordSection.style.display = "none";
    verifySection.style.display = "none";
    resetPasswordSection.style.display = "none";
    alertBox.style.display = "none"; // Ẩn thông báo khi chuyển form

    if (formType === "forgotPassword") {
        forgotPasswordSection.style.display = "block";
        formTitle.textContent = "QUÊN MẬT KHẨU";
    } else if (formType === "verify") {
        verifySection.style.display = "block";
        formTitle.textContent = "XÁC THỰC MÃ";
    } else if (formType === "resetPassword") {
        resetPasswordSection.style.display = "block";
        formTitle.textContent = "ĐẶT LẠI MẬT KHẨU";
    } else {
        loginSection.style.display = "block";
        formTitle.textContent = "ĐĂNG NHẬP";
    }
}
async function handleVerifyCode(event) {
    event.preventDefault();
    const code = [...document.querySelectorAll(".verification-input")]
        .map(input => input.value.trim())
        .join("");
    const email = localStorage.getItem("resetEmail");

    if (!email || !code) {
        showAlert("Vui lòng nhập đầy đủ mã xác thực!", "danger");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/auth/verify-pass-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code }),
        });

        const result = await response.json();
        console.log("Result:", result);
        if (result.message === "Bạn có thể đặt lại mật khẩu") {
            localStorage.setItem("resetToken", code);
            showAlert("Xác thực thành công! Vui lòng đặt lại mật khẩu.", "success");
            setTimeout(() => {
                switchForm("resetPassword");
            }, 1000);
        } else {
            showAlert("Mã xác thực không đúng!", "danger");
        }
    } catch (error) {
        showAlert("Lỗi khi xác thực mã! Vui lòng thử lại.", "danger");
        console.error("Lỗi xác thực:", error);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const verifyForm = document.getElementById("verifyForm");
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const backToLoginLink = document.getElementById("backToLogin");
    const backToForgotPasswordLink = document.getElementById("backToForgotPassword");
    const backToLoginFromReset = document.getElementById("backToLoginFromReset");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            login();
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", handleForgotPassword);
    }

    if (verifyForm) {
        verifyForm.addEventListener("submit", handleVerifyCode);
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", handleResetPassword);
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (event) => {
            event.preventDefault();
            switchForm("forgotPassword");
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener("click", (event) => {
            event.preventDefault();
            switchForm("login");
        });
    }

    if (backToForgotPasswordLink) {
        backToForgotPasswordLink.addEventListener("click", (event) => {
            event.preventDefault();
            switchForm("forgotPassword");
        });
    }

    if (backToLoginFromReset) {
        backToLoginFromReset.addEventListener("click", (event) => {
            event.preventDefault();
            switchForm("login");
        });
    }
    // Tự động chuyển con trỏ giữa các ô input mã xác thực
    const inputs = document.querySelectorAll(".verification-input");
    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // Validation
    setupValidation("email", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email có dạng abc@gmail.com!");
    setupValidation("password", "Vui lòng nhập mật khẩu!");
    setupValidation("forgotEmail", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email có dạng abc@gmail.com!");
    setupValidation(
        "newPassword",
        "Vui lòng nhập mật khẩu mới!",
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số!"
    );
    setupValidation("confirmPassword", "Vui lòng nhập xác nhận mật khẩu!");
});