# Gacha OBS Overlay

一个本地运行的抽卡直播 Overlay，供 OBS Studio 通过 Browser Source 显示。主播在控制台录入观众、执行单抽或十连，Overlay 会逐张翻牌并保存每位观众的抽数与保底。

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

概率总和必须为 100%。概率输入为空时，保存配置会恢复上述默认值。

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
