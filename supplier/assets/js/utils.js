
function getValue(id) {
    return document.getElementById(id).value.trim();
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

function setupValidation(id, emptyMessage, regex = null, invalidMessage = null) {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("input", () => {
        const value = input.value.trim();
        if (!value) {
            input.setCustomValidity(emptyMessage);
        } else if (regex && !regex.test(value)) {
            input.setCustomValidity(invalidMessage);
        } else {
            input.setCustomValidity("");
        }
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