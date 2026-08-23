# Gacha OBS Overlay

一个本地运行的抽卡直播 Overlay，供 OBS Studio 通过 Browser Source 显示。主播在控制台录入观众、执行单抽或十连，Overlay 会逐张翻牌并保存每位观众的抽数与保底。

## 新手完整操作指南（Windows + OBS Studio）

### 这是什么

这是一个“抽卡直播画面插件”，不是 OBS 插件安装包，也不是一个普通网页。它由两部分组成：

- **控制台**：主播在普通浏览器中打开，用来添加观众、设置概率、点击单抽/十连。
- **Overlay**：一张透明的网页，OBS 只负责把它叠加到直播画面中，显示翻牌动画和结果。

正确的使用关系是：

```text
普通浏览器打开 /control  -> 主播点击抽卡
OBS 浏览器来源打开 /overlay -> 直播画面显示动画
```

### 第一次使用：从 GitHub 下载

1. 打开项目页面：<https://github.com/whimy7/gacha-obs-overlay>。
2. 点击绿色 `Code` 按钮，再点击 `Download ZIP`。
3. 下载完成后，在“下载”文件夹找到 ZIP 文件。
4. 右键 ZIP -> `全部解压缩`。
5. 把解压出来的文件夹移动到一个不会随便删除的位置，例如桌面。
6. 打开这个文件夹，确认里面能看到 `package.json`、`server.js` 和 `start-gacha.bat`。

如果看不到 `package.json`，说明你打开的是外层文件夹；继续打开里面那一层项目文件夹。

### 第一次使用：安装 Node.js

1. 打开 <https://nodejs.org/>。
2. 下载带有 `LTS` 标记的 Windows 安装包。
3. 一直点击 `Next` 完成安装，安装选项保持默认。
4. 安装结束后关闭并重新打开文件夹窗口。

Node.js 只需要安装一次。这个项目不需要安装 Visual Studio、C++ 编译器、数据库或 Python。

### 第一次使用：启动程序

1. 打开项目文件夹。
2. 双击 `start-gacha.bat`。
3. 第一次运行会自动安装项目文件，等待它完成。
4. 看到下面两行地址后，**不要关闭黑色窗口**：

   ```text
   Control panel: http://127.0.0.1:3000/control
   OBS overlay:   http://127.0.0.1:3000/overlay
   ```

5. 用 Chrome、Edge 或其他浏览器打开：

   ```text
   http://127.0.0.1:3000/control
   ```

这个黑色窗口就是本地服务器。关闭它，网页和 OBS 画面都会停止。

### 第一次抽卡：控制台操作顺序

1. 在“观众”区域输入观众姓名。
2. 点击 `新增`。
3. 点击左侧列表中的观众姓名，使它变成选中状态。
4. 如需修改概率，在概率区域填写五个数字；总和必须为 `100`。
5. 如需保底，在 SR、SSR 或 UR 的输入框填写抽数，例如 `10`。
6. 在“十连模式”选择 `纯随机十连` 或 `公平约束十连`。
7. 公平约束模式下，确认 `SR + R 最大数量`，默认是 `2`。
8. 点击 `保存规则和概率`。
9. 点击 `单抽` 或 `十连`。

如果只打开 `/overlay` 而没有点击抽卡，它显示“等待抽卡”是正常的。

### 第一次在 OBS 中显示

1. 先按上面的步骤启动 `start-gacha.bat`，保持黑色窗口打开。
2. 打开 OBS Studio。
3. 在底部找到“来源”面板，点击 `+`。
4. 选择 `浏览器`，再选择 `创建新的`，名称可填写 `抽卡 Overlay`。
5. 在 URL 输入框粘贴：

   ```text
   http://127.0.0.1:3000/overlay
   ```

6. 宽度填写 `1920`，高度填写 `1080`。
7. 点击 `确定`。
8. 把新出现的浏览器来源拖到游戏画面或摄像头来源的上方。
9. 回到普通浏览器的控制台点击抽卡，OBS 预览中就会出现 5×2 卡片翻牌动画。

不要把 `/control` 添加到 OBS。Overlay 页面背景是透明的，因此只会看到标题、卡片和文字，不会出现一个完整的网页框。

### 常见问题

**问题：浏览器显示“127.0.0.1 拒绝连接”。**

原因是 `start-gacha.bat` 没有运行，或者黑色窗口已被关闭。重新双击 `start-gacha.bat`，等地址出现后刷新浏览器。

**问题：双击启动脚本后提示找不到 Node.js。**

重新安装 <https://nodejs.org/> 的 LTS 版本，然后重启电脑或重新打开启动脚本。

**问题：输入 `npm install` 时提示找不到 `package.json`。**

你当前 PowerShell 不在项目文件夹。不要在 `C:\Users\Fable` 直接运行；进入包含 `package.json` 的文件夹，或者直接双击 `start-gacha.bat`。

**问题：OBS 浏览器来源是白色、黑色或空白。**

右键 OBS 中的浏览器来源，点击 `刷新`。确认 URL 是 `/overlay` 而不是 `/control`，确认黑色启动窗口仍在运行，并确认宽高是 `1920×1080`。

**问题：Overlay 只有“等待抽卡”。**

这是正常待机状态。回到 `/control`：新增观众 -> 点击观众 -> 点击 `单抽` 或 `十连`。如果控制台也无法打开，先解决本地服务问题。

**问题：OBS 画面被其他来源挡住。**

在 OBS“来源”列表中，把“抽卡 Overlay”拖到更上方。列表越靠上，画面层级越高。

**问题：想停止程序。**

回到黑色启动窗口，按 `Ctrl+C`，再确认关闭。下次使用重新双击 `start-gacha.bat`。

## 中文使用说明

### 环境要求

- Windows、macOS 或 Linux
- Node.js 18 或更高版本
- OBS Studio（使用浏览器来源）

本项目只使用 Node.js 内置模块，不需要 Visual Studio、C++ 编译器、数据库服务或额外运行时。

### 安装与启动

在项目目录执行：

```bash
npm install
npm start
```

控制台地址：`http://127.0.0.1:3000/control`

Overlay 地址：`http://127.0.0.1:3000/overlay`

开发模式：

```bash
npm run dev
```

### OBS 配置

1. 打开 OBS Studio。
2. 在目标场景中添加“浏览器”来源。
3. URL 填写 `http://127.0.0.1:3000/overlay`。
4. 宽度设置为 `1920`，高度设置为 `1080`。
5. 将浏览器来源放在游戏画面、摄像头或背景之上。
6. 保持本地服务运行，主播在 `/control` 页面操作。

### 抽卡规则

默认概率为：

| 结果 | 概率 |
|---|---:|
| 空 | 70% |
| R | 20% |
| SR | 8% |
| SSR | 1.8% |
| UR | 0.2% |

概率总和必须为 100%。概率输入为空时，保存配置会恢复上述默认值。普卡在画面上显示为 `N`。

十连有两种模式：

- `纯随机十连`：十张牌独立按基础概率抽取，保留传统随机行为。
- `公平约束十连`：从合法十连结果中按条件概率抽取。SSR 与 UR 互斥，同一种高级牌最多一张；出现高级牌时其余为 N；没有高级牌时 SR+R 不超过控制台设置的上限，默认是 2。

公平约束会改变十连的最终分布，这是公开的组规则，不是抽完后偷偷修改结果。控制台会显示当前十连模式。

保底可以分别为 SR、SSR、UR 设置抽数上限。达到上限时，该次结果严格为配置的等级。更高等级的自然结果会同时满足较低等级保底并重置其计数。单抽和十连使用相同的连续抽取规则。

### 控制台功能

- 新增并选择观众；同名观众不允许重复。
- 单抽和十连。
- 修改概率与保底规则。
- 公平模式：按概率和保底运行。
- 演示模式：指定结果，默认不计入正式数据。
- 测试 Overlay 动画。
- 重置当前观众的抽数与保底。
- 导出完整 JSON 数据。

### 数据位置与备份

数据保存在项目目录的 `data/gacha.json`。建议在直播前复制一份备份；也可以使用控制台的“导出 JSON”按钮导出记录。

### 测试

```bash
npm test
```

## English Guide

### Requirements

- Windows, macOS, or Linux
- Node.js 18 or newer
- OBS Studio with a Browser Source

The project uses only Node.js built-in modules. Visual Studio, a C++ compiler, a database server, and other runtimes are not required.

### Install and Run

Run these commands in the project directory:

```bash
npm install
npm start
```

Control panel: `http://127.0.0.1:3000/control`

Overlay: `http://127.0.0.1:3000/overlay`

Development mode:

```bash
npm run dev
```

### OBS Setup

1. Open OBS Studio.
2. Add a Browser source to the target scene.
3. Set its URL to `http://127.0.0.1:3000/overlay`.
4. Set the width to `1920` and height to `1080`.
5. Place the Browser source above the game, camera, or background sources.
6. Keep the local server running while operating the `/control` page.

### Gacha Rules

Default probabilities:

| Result | Probability |
|---|---:|
| Empty | 70% |
| R | 20% |
| SR | 8% |
| SSR | 1.8% |
| UR | 0.2% |

The total must equal 100%. Blank probability fields restore these defaults when the settings are saved.

Separate pity limits can be configured for SR, SSR, and UR. When a limit is reached, the result is exactly the configured rarity. A naturally drawn higher rarity also satisfies and resets lower-rarity pity counters. Singles and ten-pulls use the same sequential draw rules.

### Ten-Pull Modes

- `Random ten-pull`: each slot is drawn independently using the base probabilities.
- `Fair constrained ten-pull`: samples only legal ten-pull outcomes. SSR and UR are mutually exclusive, each high rarity appears at most once, all other slots become N when a high rarity appears, and SR+R stays within the configured limit (2 by default).

The constrained mode changes the final ten-pull distribution by design; it is a public group rule, not post-draw result masking.

### Control Panel Features

- Add and select participants; duplicate names are rejected.
- Single draws and ten-pulls.
- Editable probabilities and pity rules.
- Fair mode using probabilities and pity.
- Demo mode with an optional forced result; demo draws are excluded from official data by default.
- Overlay animation test.
- Reset a participant's draws and pity.
- Export complete JSON data.

### Data and Backup

Data is stored in `data/gacha.json` inside the project directory. Make a copy before a live session, or use the “Export JSON” button in the control panel.

### Tests

```bash
npm test
```

## Future Integration

Bilibili chat and gift integrations are intentionally not included in this version. The draw API is separated so future event adapters can trigger draws without changing the core probability and pity engine.
