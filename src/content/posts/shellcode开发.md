---
title: "ShellCode开发"
published: 2023-05-12
category: "开发"
description: "# ShellCode开发  1.基本没人教的花活，网上会有文章，但是不会解释原理。这玩意其实难度不高，就是要注意的东西多。  2.shellcode开发其实有很多办法，纯汇编，C和汇编又或者纯C++。（像我这种纯FW只能纯C++了）  ## 开发PIC shellcode注意事项  1.不能使用全局变量，或者用static修饰的变量·使用API时必须动态调用(GetProAddress)·确保调"
tags: ["开发"]
---
# ShellCode开发

1.基本没人教的花活，网上会有文章，但是不会解释原理。这玩意其实难度不高，就是要注意的东西多。

2.shellcode开发其实有很多办法，纯汇编，C和汇编又或者纯C++。（像我这种纯FW只能纯C++了）

## 开发PIC shellcode注意事项

1.不能使用全局变量，或者用static修饰的变量·使用API时必须动态调用(GetProAddress)·确保调自定义shellcode入口点

2.·用API之前已经加载了与之对应的DLL

3.·所有字符串都必须要用字符串数组的方式替代

·属性——优化——O1/Ob2/Oi/Os/Oy/GL·

属性——代码生成———MT/GS-/GY·

属性——链接器——/INCREMENTAL:NO·

属性——链接器——调试——否

·属性——链接器——高级——入口点（自定义)

所有字符串都要用类似的格式去定义 unsigned char szUser32[] = { 'u','s','e','r','3','2','.','d','l','l',0 };防止破坏堆栈平衡

先看代码吧，代码是删减版只有模板

一个头文件comm.h

```
#include &lt;windows.h&gt;
//这个其实没什么好说的这个头文件主要是在这边定义函数指针
typedef FARPROC(WINAPI* FN_GetProcAddress)(
    _In_ HMODULE hModule,
    _In_ LPCSTR lpProcName
    );

typedef HMODULE(WINAPI* FN_LoadLibraryA)(
    _In_ LPCSTR lpLibFileName
    );

typedef int(WINAPI* FN_MessageBoxA)(
    _In_opt_ HWND hWnd,
    _In_opt_ LPCSTR lpText,
    _In_opt_ LPCSTR lpCaption,
    _In_ UINT uType);


typedef UINT(WINAPI* FN_WinExec)(
    LPCSTR lpCmdLine,
    UINT   uCmdShow
    );

typedef HANDLE(WINAPI * FN_CreateFileMappingW)(
        _In_     HANDLE hFile,
        _In_opt_ LPSECURITY_ATTRIBUTES lpFileMappingAttributes,
        _In_     DWORD flProtect,
        _In_     DWORD dwMaximumSizeHigh,
        _In_     DWORD dwMaximumSizeLow,
        _In_opt_ LPCWSTR lpName
        );


typedef struct tagApiInterface {
    FN_GetProcAddress pfnGetProcAddress;
    FN_LoadLibraryA pfnLoadLibrary;
    FN_MessageBoxA pfnMessageBoxA;
    FN_WinExec pfnWinExec;
    FN_CreateFileMappingW pfnCreateFileMappingW;
}APIINTERFACE, * PAPIINTERFACE;
```

然后是function.h，一般存放一些自实现的函数，我把我的删掉了

```
#pragma once
#include "comm.h"
#include &lt;windows.h&gt;
#include &lt;iostream&gt;
#include &lt;vector&gt;
#include &lt;cstdint&gt;
using namespace std;

```

最后是最重要的，注意看注释。

大概的思路：通过PEB（不知道是啥玩意的自己去补基础）去获取Kernel32.dll的地址，从Kernel32.dll中获取导出函数GetProcAddress，再通过GetProcAddress函数获取LoadLibraryA函数。就可以实现从任意DLL中获取任意导出函数进行编程。

```
#include "comm.h"
#include &lt;winternl.h&gt;
#include "function.h"


// 获取Kernel32.dll模块的基地址
ULONGLONG GetModuleKernel64()
{
    ULONGLONG dwKernel32Addr = 0;

    // 获取TEB的地址
    _TEB* pTeb = NtCurrentTeb();
    // 获取PEB的地址
    PULONGLONG pPeb = (PULONGLONG) * (PULONGLONG)((ULONGLONG)pTeb + 0x60);
    // 获取PEB_LDR_DATA结构的地址
    PULONGLONG pLdr = (PULONGLONG) * (PULONGLONG)((ULONGLONG)pPeb + 0x18);
    // 模块初始化链表的头指针InInitializationOrderModuleList
    PULONGLONG pInLoadOrderModuleList = (PULONGLONG)((ULONGLONG)pLdr + 0x10);

    // 获取链表中第一个模块信息，exe模块
    PULONGLONG pModuleExe = (PULONGLONG)*pInLoadOrderModuleList;
    //printf("EXE Base = &gt; %X \n", pModuleExe[6]);

    // 获取链表中第二个模块信息，ntdll模块
    PULONGLONG pModuleNtdll = (PULONGLONG)*pModuleExe;
    //printf("Ntdll Base = &gt; %X \n", pModuleNtdll[6]);

    // 获取链表中第三个模块信息，Kernel32模块
    PULONGLONG pModuleKernel32 = (PULONGLONG)*pModuleNtdll;
    //printf("Kernel32 Base = &gt; %X \n", pModuleKernel32[6]);

    // 获取kernel32基址
    dwKernel32Addr = pModuleKernel32[6];

    return dwKernel32Addr;
}

// 通过解析PE格式的导出表,从给定的模块基地址中获取指定函数的地址
FARPROC getProcAddress(HMODULE hModuleBase)
{
    // 获取DOS头
    PIMAGE_DOS_HEADER lpDosHeader = (PIMAGE_DOS_HEADER)hModuleBase;
    // 获取NT头
    PIMAGE_NT_HEADERS64 lpNtHeader = (PIMAGE_NT_HEADERS64)((ULONG64)hModuleBase + lpDosHeader-&gt;e_lfanew);
    // 检查导出目录的大小是否为0
    if (!lpNtHeader-&gt;OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_EXPORT].Size) {
        return NULL;
    }
    // 检查导出目录的虚拟地址是否为0
    if (!lpNtHeader-&gt;OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_EXPORT].VirtualAddress) {
        return NULL;
    }
    // 获取导出目录的地址
    PIMAGE_EXPORT_DIRECTORY lpExports = (PIMAGE_EXPORT_DIRECTORY)((ULONG64)hModuleBase + (ULONG64)lpNtHeader-&gt;OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_EXPORT].VirtualAddress);
    // 获取导出函数名称的地址
    PDWORD lpdwFunName = (PDWORD)((ULONG64)hModuleBase + (ULONG64)lpExports-&gt;AddressOfNames);
    // 获取导出函数名称序号的地址
    PWORD lpword = (PWORD)((ULONG64)hModuleBase + (ULONG64)lpExports-&gt;AddressOfNameOrdinals);
    // 获取导出函数地址的地址
    PDWORD  lpdwFunAddr = (PDWORD)((ULONG64)hModuleBase + (ULONG64)lpExports-&gt;AddressOfFunctions);

    // 循环计数器
    DWORD dwLoop = 0;
    // 存储找到的函数地址
    FARPROC pRet = NULL;
    for (; dwLoop &lt;= lpExports-&gt;NumberOfNames - 1; dwLoop++) {
        // 获取当前函数名称的地址
        char* pFunName = (char*)(lpdwFunName[dwLoop] + (ULONG64)hModuleBase);
        // 检查函数名称是否为"GetProcAddress"
        if (pFunName[0] == 'G' &amp;&amp;
            pFunName[1] == 'e' &amp;&amp;
            pFunName[2] == 't' &amp;&amp;
            pFunName[3] == 'P' &amp;&amp;
            pFunName[4] == 'r' &amp;&amp;
            pFunName[5] == 'o' &amp;&amp;
            pFunName[6] == 'c' &amp;&amp;
            pFunName[7] == 'A' &amp;&amp;
            pFunName[8] == 'd' &amp;&amp;
            pFunName[9] == 'd' &amp;&amp;
            pFunName[10] == 'r' &amp;&amp;
            pFunName[11] == 'e' &amp;&amp;
            pFunName[12] == 's' &amp;&amp;
            pFunName[13] == 's')
        {
            // 找到函数名称，获取其地址
            pRet = (FARPROC)(lpdwFunAddr[lpword[dwLoop]] + (ULONG64)hModuleBase);
            break;
        }
    }
    // 返回找到的函数地址
    return pRet;
}


void EntryMain()
{
    APIINTERFACE Api;

    HMODULE hKernel32 = (HMODULE)GetModuleKernel64();

    Api.pfnGetProcAddress = (FN_GetProcAddress)getProcAddress(hKernel32);

    char szLoadLibraryA[] = { 'L','o','a','d','L','i','b','r','a','r','y','A',0 };
    Api.pfnLoadLibrary = (FN_LoadLibraryA)Api.pfnGetProcAddress(hKernel32, szLoadLibraryA);
```

---

*GinTvT*
