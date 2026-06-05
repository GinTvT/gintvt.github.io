---
title: ".NET审计记录"
published: 2025-05-23
category: "代码审计"
description: "# .NET审计记录  最近也是在复健一下代码审计, 顺便记录一下思路  ## 审计准备  一个正常人的脑子  一个正常人用的电脑  一套net代码  审计工具:dnSpy:https://github.com/dnSpy/dnSpy  ### 案例1  我们用一个大佬打下来的某套源码来审计, 该系统如果出洞也是通用了()  **第一步:看眼路由**  简单用登录框看一眼路由结构  ![image"
tags: ["代码审计"]
---
# .NET审计记录

最近也是在复健一下代码审计, 顺便记录一下思路

## 审计准备

一个正常人的脑子

一个正常人用的电脑

一套net代码

审计工具:dnSpy:https://github.com/dnSpy/dnSpy

### 案例1

我们用一个大佬打下来的某套源码来审计, 该系统如果出洞也是通用了()

**第一步:看眼路由**

简单用登录框看一眼路由结构

![image-20260311152250749](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152250817.png)

抓包看路径

![image-20260311152335976](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152336020.png)

/Home/newLogin 根据这个路径, 没有像login.aspx的文件拓展名, 可以高度确定网站是一个MVC架构, 且存在一个集中的controller 

Home是controller, newLogin是方法 

所以现在, 我们回到源码中去找他集中的controller

![image-20260311152427374](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152427426.png)

根据他的dll来猜测, system应该是系统的东西, 应该跟controller没什么关系, 其他的一些命名也不是很符合我们要找的controller, 看到JuCheap, 感觉就是他了, 点开JuCheap后, 果然我们发现了controller

![image-20260311152458321](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152458355.png)

依照登录口的路由/Home/newLogin, 我们可以在controller中找到他

![image-20260311152534002](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152534045.png)

既然到这里, 我们再看看他下面的一些东西, 其中有一个叫做Filters的, 这个就是过滤器, 如果方法添加了过滤器, 那就可能没办法从前台发起攻击了

![image-20260311152559978](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152600014.png)

当然也不是绝对, 万一他的过滤器压根就没写东西呢, 别不信, 真有这种

![image-20260311152620400](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152620431.png)

![image-20260311152633150](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152633177.png)

这套代码就写的有点东西, 审计难度也大(其实就是我菜), 接下来我们看一套难度没这么大的

### 案例2 

这回也是拿一套非MVC架构的来审 路径中有.aspx, 这就是非常典型的Web Forms, 这种结构就是单纯的物理文件了

![image-20260311152724531](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152724626.png)

我们直接跳过审计阶段来到漏洞点, 这里接收了参数到DleteTemp中

![image-20260311152752690](https://cdn.jsdelivr.net/gh/GinTvT/Image@img/img/20260311152752753.png)

---

*GinTvT*
