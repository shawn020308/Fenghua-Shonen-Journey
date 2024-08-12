import Swiper from '/swiper/swiper-bundle';
// import styles bundle
import '/swiper/swiper-bundle.css';
<!--不知道为什么intro.js 似乎因为CSP 一直导入不了 我的swiper白装了啊-->
// 这里初始化了一个swiper，绑定到.swiper-container上了
document.addEventListener('DOMContentLoaded', () => {
    const swiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        loop: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        mousewheel: {
            invert: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
});