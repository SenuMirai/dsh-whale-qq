# patches —— 对 dsh-world 的改动

这里放我们对 `dsh-world` 的所有修改。**为什么需要这个目录：**

dsh-world 是第三方包，装在 profile 的 `node_modules` 里。我们在它上面打了三处补丁，
重装或升级一次，这些改动会跟着 `node_modules` 一起消失，**而且不会报错**，
只会静默退化：

| 现象 | 缺的是哪个补丁 |
|---|---|
| 私聊发图，她说「图没过来，只有图片两个字」 | 桥收图片 |
| 控制台少「记忆 / 群对话 / 最近娱乐」页 | 控制台快照 |
| 某一页报错整块空白 | 错误边界 |

## 怎么用

```bash
# 只检查，不改文件（重启后、升级后先跑这个）
node patches/verify.mjs

# 把缺的补回来（改前自动留 .bak-<时间戳>）
node patches/apply.mjs

# 只看会做什么，不写盘
node patches/apply.mjs --check
```

profile 不在默认位置时：

```bash
DSH_WORLD_PROFILE_DIR="D:/other/profile" node patches/apply.mjs
```

## 两个补丁形态

### 1. 锚点补丁（`world-bridge-images.mjs`）

改文件里的一小段，靠锚点定位。幂等：已经打过就跳过。

- `detect()` 认 MARKER，也认「解析 body.images」这段特征
- 上游改了结构 → 抛错并说明要重新定位，不会静默写坏

### 2. 整文件快照（`world-client-0.5.6.js`）

控制台客户端改动太多、太分散，锚点补丁容易碎，所以存整文件。

- 快照有目标版本（`world-client.version.txt`）
- 装着的 dsh-world 版本不匹配 → **拒绝覆盖**，并提示按新版重新生成快照
- 覆盖前留 `.bak-<时间戳>`

## 升级 dsh-world 之后要做什么

```text
1. node patches/verify.mjs        → 看哪几项掉了
2. 版本变了的话，apply 会报 version-mismatch
3. 此时需要：拿新版 client/index.js 当基线，
   把「记忆页 / 群对话 / 折叠 / 最近娱乐 / 错误边界」这几块重新加上，
   存成 world-client-<新版本>.js，改 world-client.version.txt
4. node patches/apply.mjs
node patches/verify.mjs
```

第 3 步别跳过：直接把旧快照盖到新版上，会把新版的其他改进一起抹掉。

## 曾经踩过的坑

- **2026-10-27**：升级 0.5.1 → 0.5.6，图片静默失效。
  原因是 0.5.6 的 `route.js` 只读 `body.text`，不解析 `images`，
  而 `bridge.say(text, images)` 本身是支持的。补丁就是在路由里把图转成
  `saveImages` 认识的形状。
