"use strict";
(function ($) {
// 自定义访客数量显示
$(document).ready(function() {
    // 设置自定义站点总浏览量
    var customSitePv = 15485;
    // 设置自定义站点总访客数
    var customSiteUv = 6123;
    // 设置自定义页面浏览量
    var customPagePv = 1453;
    
    // 覆盖不蒜子的显示值
    setTimeout(function() {
        var pvElement = document.getElementById('busuanzi_value_site_pv');
        var uvElement = document.getElementById('busuanzi_value_site_uv');
        var pagePvElement = document.getElementById('busuanzi_value_page_pv');
        
        if (pvElement) {
            pvElement.innerText = customSitePv.toLocaleString();
        }
        if (uvElement) {
            uvElement.innerText = customSiteUv.toLocaleString();
        }
        if (pagePvElement) {
            pagePvElement.innerText = customPagePv.toLocaleString();
        }
    }, 1000);
});

// 禁止 F12 开发者工具
document.onkeydown = function(e) {
    // 禁止 F12
    if (e.keyCode === 123) {
        return false;
    }
    // 禁止 Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        return false;
    }
    // 禁止 Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        return false;
    }
    // 禁止 Ctrl+U（查看源代码）
    if (e.ctrlKey && e.keyCode === 85) {
        return false;
    }
    // 禁止 Ctrl+S（保存页面）
    if (e.ctrlKey && e.keyCode === 83) {
        return false;
    }
};

// 禁止右键菜单
document.oncontextmenu = function() {
    return false;
};

// 检测开发者工具是否打开（简单检测）
setInterval(function() {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        // 检测到开发者工具可能已打开
        console.clear();
    }
}, 1000);

})(jQuery);
