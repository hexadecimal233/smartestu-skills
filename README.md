# smartestu-skills

数你最灵（smartestu.cn）的 agent skill。读取课程、作业列表、单份作业的每道题与批改结果，并在用户明确要求时提交或订正答案。

## 安装

```bash
npx skills add hexadecimal233/smartestu-skills -g
```

脚本无需构建，Node 与 bash 直接运行。

## 使用

装好之后不必记命令。在 agent 里直接说需求，它读 `SKILL.md` 与 `references/` 自己调接口：

- 「我还有哪些作业没交」拉两遍作业列表，按截止时间排序
- 「打开“两个重要的极限”看题目」拉整份作业，逐题给出题型与作答格式
- 「帮我完成这次作业」先把能答的题做完并展示结果，等你确认再存答案
- 「看看这次作业的批改结果和错因」给分数、错因分析、已公布的参考答案
- 「订正第 3 题」先查剩余次数与题目状态，再提交

满没满截止时间、还能订正几次，用服务端返回的 `examServerNow` 判断，不依赖本机时钟。

### 首次配置凭据

需要浏览器里的 `__Host-auth_refresh_v1`。打开 DevTools 的 Application 面板，左侧 Cookies 选 `https://smartestu.cn`，复制这一行的值：

```bash
export SMARTESTU_REFRESH_COOKIE='__Host-auth_refresh_v1=...'
node scripts/smartestu-api.mjs doctor
```

`doctor` 逐项报告 node、凭据文件与权限、cookie、账号角色（学号打码）、令牌、课程列表、待交数量、typst 版本。`fail` 表示这项挡住后续操作，`warn` 只提示（没装 typst、课程为空、网络不通）。全部通过时退出码 0。

换到的 access cookie 会连同 `csrfToken`、`sessionContext` 一起写进 `~/.config/smartestu/creds.json`，权限 600，位于仓库之外。之后不必再传参数。access cookie 只有 15 分钟有效，脚本每次运行自动换取，遇到 401 再换一次。

提交答案、交卷、订正、申诉、签到都会改动学生记录。每次写入前 agent 会先列出要发的内容与代价，等明确确认再发；交卷单独问一次，不会跟着做题一起提交。`write` 子命令要求显式加 `--allow-write`，agent 不会自己加。

### 手动核查

想自己看数据时：

```bash
node scripts/smartestu-api.mjs doctor           # 自检：依赖、凭据、会话、课程
node scripts/smartestu-api.mjs session          # 账号、csrf、sessionContext
node scripts/smartestu-api.mjs courses          # 课程列表
node scripts/smartestu-api.mjs pending          # 未交作业，按截止时间排序
node scripts/smartestu-api.mjs homework 42863   # 单份作业的全部题目
node scripts/smartestu-api.mjs get /api/config  # 任意 GET
```

## 证据口径

抓包亲眼见到的标为“已验证”，读客户端代码得出的标为“推断”，两者都没有的标为“未知”并留待补抓。每个请求体在 `references/` 里都写明属于哪一类，来源与缺口见 `references/capture-provenance.md`。

## 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `homeworks` 返回空列表，portal 却说有未交 | `courseIds` 传了空数组 | 用 `pending`，它先取课程 id 再查 |
| 接口返回 401 | access cookie 过期，刷新也失败 | 重新复制 refresh cookie，再跑一次 `session` |
| typst 报 `unknown variable: rac` | 把 LaTeX 的 `\frac` 直接喂给了 typst | 换 MathJax，或按换算表改写 |
| 上传渲染图被判非手写 | 平台要求手写作答 | 渲染图只用于阅读与讲解 |

## 依赖

- Node 18 以上，脚本用到 `fetch` 与 `--import`
- typst 0.15 以上，只有渲染图片时需要：用 `brew install typst` 或其他包管理器安装（`cargo install typst-cli`、`scoop install typst`、各发行版自带的包等）
