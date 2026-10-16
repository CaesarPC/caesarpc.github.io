# 远程控制固定入口

## 原理

公网隧道（Cloudflare Quick Tunnel）每次重启 URL 都会变。
本方案把「当前隧道地址」存到 GitHub 仓库，固定入口页读取后自动跳转。

```
朋友打开固定地址 → 读 url.json → 自动跳转到当前隧道
```

## 文件说明

| 文件 | 作用 |
|------|------|
| `remote.html` | GitHub Pages 固定入口页 |
| `remote/url.json` | 存放当前隧道地址（自动更新） |
| `remote/worker.js` | 可选：Cloudflare Worker（更快的跳转入口） |

## 固定地址

### 入口 A（GitHub Pages）

```
https://caesarpc.github.io/remote.html
```

合并到 main 分支后自动生效。

### 入口 B（Cloudflare Worker，推荐，更快）

1. Cloudflare Dashboard → Workers & Pages → Create Worker
2. 粘贴 `remote/worker.js` 内容
3. Deploy，得到 `https://remote.你的子域名.workers.dev`
4. 发给朋友这个地址即可

## 本机自动更新（关键）

隧道启动后，本地脚本会自动把新地址写回 `remote/url.json`。
需要在本地 `D:\remote_control\github_config.json` 配置一个 GitHub Token：

```json
{
  "token": "ghp_你的token",
  "owner": "CaesarPC",
  "repo": "CaesarPC.github.io",
  "branch": "main",
  "path": "remote/url.json"
}
```

Token 获取：GitHub → Settings → Developer settings → Personal access tokens →
Tokens (classic) → Generate new token，勾选 `repo` 权限。
