# 代码知识图谱生成器 (Code Knowledge Graph Generator)

A system that converts JavaScript code into interactive knowledge graphs, visualizing code structure and dependencies.

## 功能特性 (Features)

- 🔍 **代码解析** - JavaScript代码自动分析和实体提取
- 📊 **知识图谱生成** - 将代码结构转换为图形表示
- 🎨 **交互式可视化** - 基于D3.js的动态图形界面
- 📱 **响应式设计** - 支持各种屏幕尺寸
- 🌐 **中英双语** - 支持中文和英文界面

## 系统组件 (System Components)

### 1. 代码解析器 (Code Parser) - `code-parser.js`
- 解析JavaScript代码
- 提取函数、变量、对象等实体
- 识别函数调用、属性访问等关系

### 2. 知识图谱生成器 (Knowledge Graph Generator) - `knowledge-graph-generator.js`
- 将解析结果转换为图结构
- 生成节点和边的关系
- 支持多种导出格式 (JSON, DOT)

### 3. 图形可视化器 (Graph Visualizer) - `knowledge-graph-visualizer.js`
- 基于D3.js的交互式可视化
- 支持拖拽、缩放、筛选
- 动态布局和力导向图

### 4. 主应用 (Main Application) - `app.js`
- 集成所有组件
- 用户界面管理
- 事件处理和数据流控制

## 使用方法 (Usage)

### 1. 基本使用
1. 打开 `knowledge-graph.html`
2. 在代码输入区域输入JavaScript代码
3. 点击"分析代码"按钮
4. 查看生成的知识图谱

### 2. 示例代码
系统内置了三体物理模拟的示例代码，点击"加载示例代码"即可加载。

### 3. 交互功能
- **拖拽节点** - 重新排列图形布局
- **缩放平移** - 鼠标滚轮缩放，拖拽平移
- **节点筛选** - 按类型筛选显示的节点
- **导出数据** - 将图谱数据导出为JSON文件

## 文件结构 (File Structure)

```
demo0809/
├── index.html                    # 三体模拟演示页面
├── threebody.js                  # 三体物理模拟代码
├── knowledge-graph.html          # 知识图谱生成器主页面
├── code-parser.js               # 代码解析模块
├── knowledge-graph-generator.js  # 图谱生成模块
├── knowledge-graph-visualizer.js # 可视化模块
├── app.js                       # 主应用程序
├── test.js                      # 测试脚本
└── README.md                    # 项目文档
```

## 技术栈 (Technology Stack)

- **前端框架**: 原生JavaScript (Vanilla JS)
- **可视化库**: D3.js v7
- **图形渲染**: SVG + Canvas
- **样式**: CSS3 with Grid/Flexbox
- **模块系统**: ES6 Modules / CommonJS

## 安装和运行 (Installation & Running)

### 方法1: 本地服务器
```bash
# 使用Python启动本地服务器
python3 -m http.server 8080

# 或使用Node.js
npx http-server -p 8080

# 访问应用
# 知识图谱生成器: http://localhost:8080/knowledge-graph.html
# 三体模拟: http://localhost:8080/index.html
```

### 方法2: 直接打开文件
直接在浏览器中打开 `knowledge-graph.html` 文件即可使用。

## 系统架构 (System Architecture)

```
用户输入JavaScript代码
         ↓
    CodeParser解析代码
         ↓
提取实体和关系数据
         ↓
KnowledgeGraphGenerator生成图结构
         ↓
KnowledgeGraphVisualizer渲染可视化
         ↓
     用户交互界面
```

## 支持的代码特性 (Supported Code Features)

- ✅ 函数声明和调用
- ✅ 变量声明和使用
- ✅ 对象属性访问
- ✅ 作用域分析
- ✅ 基本的控制流
- 🔄 类和继承 (计划中)
- 🔄 模块导入导出 (计划中)
- 🔄 异步函数 (计划中)

## 示例分析结果 (Example Analysis Results)

对于输入的三体模拟代码，系统可以识别：
- **函数**: resize, createShader, step, render
- **变量**: canvas, gl, masses, bodies, G, dt
- **调用关系**: render → step, render → requestAnimationFrame
- **数据流**: bodies → step → render

## 贡献指南 (Contributing)

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证 (License)

MIT License

## 作者 (Author)

Code Knowledge Graph Generator System

---

*将代码转换为知识图谱，让代码结构一目了然！*