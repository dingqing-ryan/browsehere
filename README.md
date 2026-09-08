# Country-aware streaming catalog

纯静态网站，无需构建。用任意静态服务器打开，例如：

```bash
cd outputs/freestreaming-catalog
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

也支持直接双击 `index.html`（`file://`）。由于浏览器禁止本地 HTML 用 `fetch` 读取 JSON，项目为每个国家 JSON 生成了同名 `.data.js` 包装；文件模式只会载入当前 URL 国家码对应的一份包装数据。

## URL 规则

- `?country=US`：显示美国目录。
- `?us`：同样会加载美国目录；任意两位国家码均可使用，例如 `?AO`。

## 国家数据逻辑

URL 国家码是数据源选择器，例如 `?country=AO` 会加载：

`json/BrowseHere国家分类汇总_20260902_114713_AO.json`

页面读取其中的 `countries[0].records`，按照记录的 `category` 生成左侧栏目和右侧卡片；`customParameter` 成为卡片名称及外部链接，`rank` 与 `eventCount` 显示为辅助信息。`catalog-api-base` 指向项目 `json/` 目录，后续数据批次只需同步更新该文件名前缀。

每次更新 `json/` 后执行：

```bash
node scripts/build-country-manifest.mjs
```

该固定步骤会重建 `manifest.json`、移除页面不用的分析字段，并将 [flixpatrol-country-services.json](scripts/flixpatrol-country-services.json) 中该国家的流媒体服务（`title`、`country_official_url`）依次插入 `Top 50` 的最前面。脚本可重复执行，不会重复插入。

参考页面的 `?us` 在其源码中没有对应的分类别名；它只识别 `?en`、`?es`、`?in` 等，用于滚动而不是获取数据。本实现保留了这类深链的使用体验，并补足了真正的国家解析。

## TV 遥控器焦点

按方向键会进入 TV 焦点模式：白色焦点框在左侧分类和右侧卡片之间按屏幕空间位置移动，`Enter` / 空格打开当前卡片；鼠标点击会退出 TV 焦点模式。若宿主提供 `NaviSwitch` 且声明 `freestreaming_pagenav_v1` 能力，页面会启用固定视口滚动、`__TV_PAGE_NAV_BRIDGE__` 恢复桥接，并在目录顶部向宿主工具栏交接焦点。
