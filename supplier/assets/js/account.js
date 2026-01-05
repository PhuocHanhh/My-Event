let currentUserId = null;
let currentUserData = null;
const defaultAvatar = './assets/img/avatar/avt.jpg';
let isDefaultAvatar = true;

function updateAvatarState(avatarSrc) {
    const avatarContainer = document.getElementById('avatarContainer');
    isDefaultAvatar = avatarSrc === defaultAvatar;
    if (isDefaultAvatar) {
        avatarContainer.classList.add('default');
    } else {
        avatarContainer.classList.remove('default');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
        alert('Vui lòng đăng nhập để xem thông tin cá nhân!');
        window.location.href = 'login.html';
        return;
    }

    currentUserId = userData.id;
    currentUserData = userData;

    document.getElementById('email').innerText = userData.email || 'Chưa có thông tin';
    document.getElementById('last_name').innerText = userData.last_name || 'Chưa có thông tin'; // Họ
    document.getElementById('first_name').innerText = userData.first_name || 'Chưa có thông tin'; // Tên
    document.getElementById('phone_number').innerText = userData.phone_number || 'Chưa có thông tin';

    const avatarImage = document.getElementById('avatarImage');
    const avatarSrc = userData.avatar || defaultAvatar;
    avatarImage.src = avatarSrc;
    updateAvatarState(avatarSrc);

    if (typeof window.updateHeader === 'function') {
        window.updateHeader();
    }
});

// Xử lý upload avatar
document.getElementById('avatarInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarImage = document.getElementById('avatarImage');
            avatarImage.src = e.target.result;
            updateAvatarState(e.target.result);
            console.log('Ảnh đã tải lên:', e.target.result);
        };
        reader.onerror = function(e) {
            console.error('Lỗi khi đọc file ảnh:', e);
            alert('Không thể tải ảnh lên. Vui lòng thử lại.');
        };
        reader.readAsDataURL(file);
    } else {
        alert('Vui lòng chọn một file ảnh!');
    }
});

// Lưu thay đổi
async function saveChanges() {
    const newEmail = document.getElementById('editEmail').value;
    const newLastName = document.getElementById('editLastName').value; // Họ
    const newFirstName = document.getElementById('editFirstName').value; // Tên
    const newPhoneNumber = document.getElementById('editPhoneNumber').value;
    const newAvatar = document.getElementById('avatarImage').src;

    const patchData = {};
    if (newEmail && newEmail !== currentUserData.email && newEmail.trim()) patchData.email = newEmail;
    if (newLastName && newLastName !== currentUserData.last_name && newLastName.trim()) patchData.last_name = newLastName;
    if (newFirstName && newFirstName !== currentUserData.first_name && newFirstName.trim()) patchData.first_name = newFirstName;
    if (newPhoneNumber && newPhoneNumber !== currentUserData.phone_number && newPhoneNumber.trim()) patchData.phone_number = newPhoneNumber;
    if (newAvatar && newAvatar !== currentUserData.avatar && newAvatar.trim()) patchData.avatar = newAvatar;

    if (Object.keys(patchData).length === 0) {
        alert('Không có thay đổi để lưu!');
        const modalElement = document.getElementById('editModal');
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        return;
    }

    console.log("Current User ID:", currentUserId);
    console.log("Patch Data gửi đi:", patchData);

    try {
        const response = await fetch(`https://67eabf6734bcedd95f647797.mockapi.io/User/${currentUserId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi khi cập nhật dữ liệu: ${response.status} - ${errorText}`);
        }

        const updatedDataFromServer = await response.json();
        const updatedData = {
            ...currentUserData,
            ...patchData,
            id: currentUserId
        };

        localStorage.setItem('user', JSON.stringify(updatedData));
        currentUserData = updatedData;

        document.getElementById('email').innerText = updatedData.email || 'Chưa có thông tin';
        document.getElementById('last_name').innerText = updatedData.last_name || 'Chưa có thông tin';
        document.getElementById('first_name').innerText = updatedData.first_name || 'Chưa có thông tin';
        document.getElementById('phone_number').innerText = updatedData.phone_number || 'Chưa có thông tin';
        document.getElementById('avatarImage').src = updatedData.avatar || defaultAvatar;

        updateAvatarState(updatedData.avatar);

        if (typeof window.updateHeader === 'function') {
            window.updateHeader();
        }

        const modalElement = document.getElementById('editModal');
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        alert('Cập nhật thông tin thành công!');
    } catch (error) {
        console.error('Lỗi khi cập nhật API:', error);
        alert(`Không thể cập nhật thông tin lên server: ${error.message}`);
    }
}

// Tự động điền dữ liệu vào form khi modal mở
document.getElementById('editModal').addEventListener('show.bs.modal', function () {
    document.getElementById('editEmail').value = document.getElementById('email').innerText === 'Chưa có thông tin' ? '' : document.getElementById('email').innerText;
    document.getElementById('editLastName').value = document.getElementById('last_name').innerText === 'Chưa có thông tin' ? '' : document.getElementById('last_name').innerText; // Họ
    document.getElementById('editFirstName').value = document.getElementById('first_name').innerText === 'Chưa có thông tin' ? '' : document.getElementById('first_name').innerText; // Tên
    document.getElementById('editPhoneNumber').value = document.getElementById('phone_number').innerText === 'Chưa có thông tin' ? '' : document.getElementById('phone_number').innerText;
});