# FlexRig Control System (柔性工装控制系统)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css)

**FlexRig Control** 是一个现代化的工业控制仪表盘前端项目，专为基于 STM32 的柔性工装平台设计。该系统提供实时的姿态可视化、CAN 总线电机控制界面以及系统遥测数据监控。

## ✨ 主要功能 (Features)

*   **实时姿态可视化 (Real-time Visualization)**
    *   **人工地平仪 (Inclinometer):** 实时显示平台的俯仰角 (Pitch) 和横滚角 (Roll)。
    *   **高度计 (Height Gauge):** 动态显示主升降柱的高度数据。
*   **电机控制阵列 (Motor Control)**
    *   支持主驱动电机 (M1) 与辅助电机 (M2-M5) 的独立与协同控制。
    *   **点动/连续模式:** 支持 0.1° 精细步进调节或连续 Jog 运动。
    *   **安全机制:** 包含全局紧急停止 (E-STOP) 和状态复位功能。
*   **数据遥测 (Telemetry)**
    *   基于 Recharts 的实时折线图，记录高度与姿态的历史变化。
    *   监控电池电压、WiFi 信号强度及 CAN 总线负载。
*   **工业级 UI 设计**
    *   暗色系工业风格 (Slate/Industrial Theme)。
    *   响应式布局，适配桌面端与平板控制终端。

## 🛠️ 技术栈 (Tech Stack)

*   **核心框架:** [React 19](https://react.dev/)
*   **语言:** [TypeScript](https://www.typescriptlang.org/)
*   **构建工具:** [Vite](https://vitejs.dev/)
*   **样式库:** [Tailwind CSS](https://tailwindcss.com/) (通过 CDN 配置)
*   **图标库:** [Lucide React](https://lucide.dev/)
*   **图表库:** [Recharts](https://recharts.org/)

## 🚀 快速开始 (Getting Started)

### 环境要求
*   Node.js >= 16.0.0
*   npm 或 yarn

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/flexrig-control.git
    cd flexrig-control
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    打开浏览器访问 `http://localhost:5173` 即可看到控制面板。

## 📂 项目结构 (Structure)

```text
flexrig-control/
├── src/
│   ├── components/        # UI 组件
│   │   ├── HeightGauge.tsx    # 高度计组件
│   │   ├── Inclinometer.tsx   # 姿态仪组件
│   │   ├── MotorControls.tsx  # 电机控制面板
│   │   └── TelemetryChart.tsx # 遥测图表
│   ├── App.tsx            # 主应用逻辑与模拟循环
│   ├── constants.ts       # 系统常量 (限位、电机配置)
│   ├── types.ts           # TypeScript 类型定义
│   └── index.tsx          # 入口文件
├── index.html             # HTML 模板 (包含 Tailwind 配置)
└── package.json
```

## ⚙️ 配置 (Configuration)

你可以通过修改 `src/constants.ts` 来调整系统的物理参数：

```typescript
export const MAX_HEIGHT_MM = 1200; // 最大高度
export const MOTOR_CONFIG = [ ... ]; // 电机 ID 和名称映射
export const UPDATE_INTERVAL_MS = 100; // 界面刷新频率
```

## 🔌 硬件连接 (Integration)

当前版本处于 **演示/模拟模式 (Simulation Mode)**。
在 `App.tsx` 中包含了一个模拟物理循环 (`useEffect`) 来生成传感器数据。

若要连接真实硬件：
1.  移除 `App.tsx` 中的模拟定时器。
2.  集成 WebSocket 或 Web Serial API。
3.  解析 STM32 发送的 JSON/二进制数据包并调用 `setSensors` 更新状态。

## 📄 许可证 (License)

Distributed under the MIT License. See `LICENSE` for more information.
