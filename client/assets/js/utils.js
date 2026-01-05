
function getValue(id) {
    return document.getElementById(id).value.trim();
}
// Hàm xử lý nút Quay lại
function goBack() {
    // Quay lại trang trước trong lịch sử trình duyệt
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // Nếu không có lịch sử, chuyển hướng về trang chủ hoặc trang mặc định
        window.location.href = "home.html"; // Thay đổi URL nếu cần
    }
}

function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = "block";
    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);
}

function setupValidation(id, emptyMessage, pattern = null, patternMessage = "") {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("blur", function () {
        const value = input.value.trim();

        if (!value) {
            input.setCustomValidity(emptyMessage);
        } else if (pattern && !pattern.test(value)) {
            input.setCustomValidity(patternMessage);
        } else {
            input.setCustomValidity(""); // clear lỗi nếu đúng
        }
    });
    input.reportValidity();

    input.addEventListener("input", function () {
        input.setCustomValidity(""); // clear lỗi khi đang gõ lại
    });
}

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    } else {
        input.type = "password";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    }
}

const passwordInputElement = document.getElementById('password');
const passwordError = document.getElementById('passwordError');

if (passwordInputElement && passwordError) {
    passwordInputElement.addEventListener('input', function () {
        if (passwordInputElement.value.length < 8 && passwordInputElement.value.length > 0) {
            passwordError.textContent = 'Mật khẩu phải có ít nhất 8 ký tự.';
            passwordError.style.display = 'block';
        } else {
            passwordError.textContent = '';
            passwordError.style.display = 'none';
        }
    });
}