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

})(jQuery);
