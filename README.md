# Streaming Website Guide Hub

面向电视大屏的国家化流媒体网站导航。在线地址：

`https://dingqing-ryan.github.io/browsehere/home.html?country=AO`

## 本地运行

本项目通过 `fetch` 读取 JSON，请使用静态 HTTP 服务，而不是直接以 `file://` 打开：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/home.html?country=AO`。

## 国家选择与本地化

- `?country=US`：使用指定的两位国家码。
- `?AO`：同样可使用无值的两位国家码。
- 未指定国家码时，页面通过 `ipquery.io` 获取访问者 IP 所在国家；失败时回退到 `US`。

国家码同时决定目录数据和页面主语种。语言判断使用浏览器内置 `Intl.Locale`，不会额外请求翻译服务。

## 数据与构建

每个 `json/*.json` 文件保存一个或多个国家的 `countries[].records`。`category` 决定栏目，`customParameter` 是站点地址。

服务映射位于 [scripts/flixpatrol-country-services.json](scripts/flixpatrol-country-services.json)：

- `countries`：FlixPatrol 的国家专属官方服务。
- `shared.global`：所有国家共享的站点。
- `shared.languages`：按主语种匹配的地区站点。

更新任一 JSON 数据或服务映射后，运行：

```bash
node scripts/build-country-manifest.mjs
```

该命令会：

1. 重建 `json/manifest.json`；
2. 压缩国家 JSON，仅保留页面需要的字段；
3. 将“国家专属 → 全局 → 主语种”服务依次加入 `Top 50` 前部；
4. 按规范化域名去重（忽略 `www.`），并移除与注入服务重复的原 Top 50 记录。

脚本可重复执行，不会重复插入服务。构建完成后提交 `json/` 与 `scripts/flixpatrol-country-services.json`，再推送到 `main` 即可发布到 GitHub Pages。

## TV 遥控器焦点

按方向键进入 TV 焦点模式。白色焦点框会在左侧栏目和右侧卡片间按空间位置移动；从栏目右移时会聚焦对应栏目首个卡片，卡片左移会回到对应栏目。卡片焦点会自动居中滚动；到达首尾时自动滚至顶部或底部。按 `Enter` 或空格打开当前站点。

当宿主提供 `NaviSwitch` 的 `freestreaming_pagenav_v1` 能力时，页面会启用固定视口滚动与焦点桥接。
