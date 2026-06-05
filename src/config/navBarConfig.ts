import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

// 根据页面开关动态生成导航栏配置
const getDynamicNavBarConfig = (): NavBarConfig => {
    const links: (NavBarLink | LinkPreset)[] = [
        LinkPreset.Home,
        LinkPreset.Archive,
        LinkPreset.Friends,
        LinkPreset.About,
        {
            name: "GitHub",
            url: "https://github.com/GinTvT",
            external: true,
            icon: "fa7-brands:github",
        },
    ];
    return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
