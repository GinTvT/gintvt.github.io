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

// 弹窗冷却时间（毫秒）
var alertCooldown = 5000; // 5秒内不重复弹窗
var lastAlertTime = 0;

// 创建提示弹窗
function showHackerAlert() {
    var now = Date.now();
    
    // 检查冷却时间
    if (now - lastAlertTime < alertCooldown) {
        return; // 冷却中，不显示
    }
    
    lastAlertTime = now;
    
    // 如果弹窗已存在，先移除
    var existingAlert = document.getElementById('hacker-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 创建弹窗元素
    var alertDiv = document.createElement('div');
    alertDiv.id = 'hacker-alert';
    alertDiv.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #2196F3;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 99999;
            font-size: 14px;
            font-weight: 500;
            animation: hackerAlertSlide 0.3s ease-out;
        ">
            不可以哦！
        </div>
        <style>
            @keyframes hackerAlertSlide {
                0% { transform: translateX(-100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 2秒后自动消失
    setTimeout(function() {
        if (alertDiv.parentNode) {
            alertDiv.style.animation = 'hackerAlertSlide 0.3s ease-out reverse';
            setTimeout(function() {
                alertDiv.remove();
            }, 300);
        }
    }, 2000);
}

// 禁止 F12 开发者工具并显示提示
document.onkeydown = function(e) {
    // 禁止 F12
    if (e.keyCode === 123) {
        showHackerAlert();
        return false;
    }
    // 禁止 Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        showHackerAlert();
        return false;
    }
    // 禁止 Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        showHackerAlert();
        return false;
    }
    // 禁止 Ctrl+U（查看源代码）
    if (e.ctrlKey && e.keyCode === 85) {
        showHackerAlert();
        return false;
    }
    // 禁止 Ctrl+S（保存页面）
    if (e.ctrlKey && e.keyCode === 83) {
        showHackerAlert();
        return false;
    }
};

// 禁止右键菜单并显示提示
document.oncontextmenu = function(e) {
    showHackerAlert();
    return false;
};

// 检测开发者工具是否打开（降低检测频率，避免误触发）
var devToolsCheckInterval = null;
var devToolsCheckDelay = 3000; // 3秒检测一次

function startDevToolsCheck() {
    if (devToolsCheckInterval) return; // 已经在检测中
    
    devToolsCheckInterval = setInterval(function() {
        // 更严格的检测条件
        var heightDiff = window.outerHeight - window.innerHeight;
        var widthDiff = window.outerWidth - window.innerWidth;
        
        // 检测窗口大小异常（开发者工具通常占用较大空间）
        if (heightDiff > 300 || widthDiff > 300) {
            showHackerAlert();
            console.clear();
        }
    }, devToolsCheckDelay);
}

// 页面加载后开始检测
$(window).on('load', function() {
    setTimeout(startDevToolsCheck, 2000); // 延迟2秒开始检测
});

})(jQuery);
