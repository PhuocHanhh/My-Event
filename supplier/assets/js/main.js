// Gọi hàm highlightActiveMenu khi trang đã tải xong
document.addEventListener("DOMContentLoaded", function () {
  highlightActiveMenu();
});

// Hàm làm nổi bật mục menu đang active
function highlightActiveMenu() {
  const navLinks = document.querySelectorAll(".navmenu ul li a"); // Lấy tất cả các link trong menu
  const currentPage = window.location.pathname.split("/").pop() || "home.html"; // Lấy tên file hiện tại, mặc định là home.html nếu không có

  navLinks.forEach(link => {
      link.classList.remove("active"); // Xóa class active khỏi tất cả các link trước
      const href = link.getAttribute("href");
      if (href === currentPage) {
          link.classList.add("active"); // Thêm class active cho link tương ứng
      }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Import header
  fetch("./component/header.html")
      .then(response => response.text())
      .then(data => {
          document.getElementById("header").innerHTML = data;
          attachMobileNavEvent(); // Gán sự kiện mobile nav
          highlightActiveMenu(); // Gọi hàm làm nổi bật menu sau khi header load xong
      });

  // Import footer
  fetch("./component/footer.html")
      .then(response => response.text())
      .then(data => {
          document.getElementById("footer").innerHTML = data;
      });
});



// document.addEventListener("DOMContentLoaded", function () {
//     // Import header
//     fetch("./component/header.html")
//         .then(response => response.text())
//         .then(data => {
//             document.getElementById("header").innerHTML = data;
//             attachMobileNavEvent(); // Gán lại sự kiện sau khi header load xong
//         });

//     // Import footer
//     fetch("./component/footer.html")
//         .then(response => response.text())
//         .then(data => {
//             document.getElementById("footer").innerHTML = data;
//         });
// });

// Hàm gán sự kiện cho menu mobile
function attachMobileNavEvent() {
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

    function mobileNavToogle() {
        document.body.classList.toggle('mobile-nav-active');
        mobileNavToggleBtn.classList.toggle('bi-list');
        mobileNavToggleBtn.classList.toggle('bi-x');
    }

    if (mobileNavToggleBtn) {
        mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }
}


(function() {
    "use strict";
  
    /**
     * Apply .scrolled class to the body as the page is scrolled down
     */
    function toggleScrolled() {
      const selectBody = document.querySelector('body');
      const selectHeader = document.querySelector('#header');
      if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
      window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
    }
  
    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);
  
    /**
     * Mobile nav toggle
     */
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  
    function mobileNavToogle() {
      document.querySelector('body').classList.toggle('mobile-nav-active');
      mobileNavToggleBtn.classList.toggle('bi-list');
      mobileNavToggleBtn.classList.toggle('bi-x');
    }
    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }
  
    /**
     * Hide mobile nav on same-page/hash links
     */
    document.querySelectorAll('#navmenu a').forEach(navmenu => {
      navmenu.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          mobileNavToogle();
        }
      });
  
    });
  
    /**
     * Toggle mobile nav dropdowns
     */
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
      navmenu.addEventListener('click', function(e) {
        e.preventDefault();
        this.parentNode.classList.toggle('active');
        this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
        e.stopImmediatePropagation();
      });
    });
  
    /**
     * Preloader
     */
    const preloader = document.querySelector('#preloader');
    if (preloader) {
      window.addEventListener('load', () => {
        preloader.remove();
      });
    }
  
    /**
     * Scroll top button
     */
    let scrollTop = document.querySelector('.scroll-top');
  
    function toggleScrollTop() {
      if (scrollTop) {
        window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
      }
    }
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  
    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);
  
    /**
     * Animation on scroll function and init
     */
    function aosInit() {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
    window.addEventListener('load', aosInit);
  
    /**
     * Auto generate the carousel indicators
     */
    document.querySelectorAll('.carousel-indicators').forEach((carouselIndicator) => {
      carouselIndicator.closest('.carousel').querySelectorAll('.carousel-item').forEach((carouselItem, index) => {
        if (index === 0) {
          carouselIndicator.innerHTML += `<li data-bs-target="#${carouselIndicator.closest('.carousel').id}" data-bs-slide-to="${index}" class="active"></li>`;
        } else {
          carouselIndicator.innerHTML += `<li data-bs-target="#${carouselIndicator.closest('.carousel').id}" data-bs-slide-to="${index}"></li>`;
        }
      });
    });
  
    /**
     * Init swiper sliders
     */
    function initSwiper() {
      document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
        let config = JSON.parse(
          swiperElement.querySelector(".swiper-config").innerHTML.trim()
        );
  
        if (swiperElement.classList.contains("swiper-tab")) {
          initSwiperWithCustomPagination(swiperElement, config);
        } else {
          new Swiper(swiperElement, config);
        }
      });
    }
  
    window.addEventListener("load", initSwiper);
  
    /**
     * Initiate Pure Counter
     */
    new PureCounter();
  
  })();