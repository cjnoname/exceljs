# ES2019 升级指南

## 概述

ExcelJS 已全面升级至 ES2019，移除了所有 ES5 支持和相关 polyfills。

## 最低要求

### Node.js
- **最低版本**: Node.js >= 12.0.0
- **之前**: Node.js >= 8.3.0
- **原因**: ES2019 特性需要 Node.js 12+ 原生支持

### 浏览器
支持 ES2019 的现代浏览器：
- Chrome >= 73 (2019年3月)
- Firefox >= 65 (2019年1月)
- Safari >= 12.1 (2019年3月)
- Edge >= 79 (2020年1月，基于 Chromium)

## 主要变更

### 1. 移除 ES5 支持
- ❌ 删除 `dist/es5/` 目录
- ❌ 移除 `require('exceljs/dist/es5')` 导入方式
- ❌ 移除所有 ES5 相关的 npm 脚本
- ❌ 移除 ES5 版本检查代码

### 2. 移除 Polyfills 依赖
不再需要以下 polyfills：
- `core-js` (Promise, Object.assign, Symbol 等)
- `regenerator-runtime` (async/await)
- `babel-polyfill`
- IE 11 regex polyfills

### 3. 构建配置更新

#### .babelrc
```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "12",
          "browsers": [
            "chrome >= 73",
            "firefox >= 65",
            "safari >= 12.1",
            "edge >= 79"
          ]
        }
      }
    ]
  ]
}
```

#### .browserslistrc
```
# ES2019-compatible browsers
chrome >= 73
firefox >= 65
safari >= 12.1
edge >= 79
# Exclude dead browsers
not dead
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2019"
  }
}
```

#### package.json
```json
{
  "engines": {
    "node": ">=12.0.0"
  }
}
```

### 4. 文档更新
- ✅ README.md: 移除 ES5 导入章节，添加运行要求
- ✅ README_zh.md: 同步更新中文文档
- ✅ 更新浏览器使用说明

## ES2019 特性支持

现在可以放心使用以下 ES2019 特性：

### 1. Array 方法
```javascript
// Array.prototype.flat
const arr = [1, [2, [3, 4]]];
arr.flat();        // [1, 2, [3, 4]]
arr.flat(2);       // [1, 2, 3, 4]

// Array.prototype.flatMap
[1, 2, 3].flatMap(x => [x, x * 2]);  // [1, 2, 2, 4, 3, 6]
```

### 2. Object 方法
```javascript
// Object.fromEntries
const entries = [['a', 1], ['b', 2]];
Object.fromEntries(entries);  // { a: 1, b: 2 }
```

### 3. String 方法
```javascript
// String.prototype.trimStart / trimEnd
'  hello  '.trimStart();  // 'hello  '
'  hello  '.trimEnd();    // '  hello'
```

### 4. Optional catch binding
```javascript
// 不需要 catch 参数
try {
  // code
} catch {  // ES2019: 不需要 (err)
  // handle error
}
```

### 5. Symbol.prototype.description
```javascript
const sym = Symbol('my description');
sym.description;  // 'my description'
```

### 6. 完整 async/await 支持
```javascript
// Node.js 12+ 原生支持，无需 regenerator-runtime
async function fetchData() {
  const data = await fetch(url);
  return data.json();
}
```

## 迁移指南

### 对于库使用者

#### 旧方式 (不再支持)
```javascript
// ES5 导入 - 已移除
const ExcelJS = require('exceljs/dist/es5');

// 带 polyfills - 不再需要
require('core-js/modules/es.promise');
require('regenerator-runtime/runtime');
const ExcelJS = require('exceljs');
```

#### 新方式 (推荐)
```javascript
// Node.js >= 12.0.0
const ExcelJS = require('exceljs');

// 或 ES6 模块
import ExcelJS from 'exceljs';
```

### 对于浏览器使用者

#### 旧方式 (不再支持)
```html
<!-- 带 polyfills - 不再需要 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.26.0/polyfill.js"></script>
<script src="exceljs.js"></script>
```

#### 新方式 (推荐)
```html
<!-- 现代浏览器，无需 polyfills -->
<script src="exceljs.browser.js"></script>
```

## 破坏性变更

### ⚠️ 不再支持的环境
- ❌ Node.js < 12.0.0
- ❌ IE 11 及以下版本
- ❌ Chrome < 73
- ❌ Firefox < 65
- ❌ Safari < 12.1
- ❌ Edge Legacy (非 Chromium 版本)

### ⚠️ 移除的导入路径
- ❌ `require('exceljs/dist/es5')`
- ❌ `require('exceljs/dist/es5/...')`

### ⚠️ 移除的 npm 脚本
- ❌ `npm run test:es5`
- ❌ `npm run test:unit:es5`
- ❌ `npm run test:integration:es5`
- ❌ `npm run test:end-to-end:es5`

## 优势

### 1. 性能提升
- 移除了 polyfills 和转译开销
- 使用原生 ES2019 特性，运行更快
- 构建产物更小更优化

### 2. 更现代的代码
- 可以使用 Array.flat/flatMap
- 可以使用 Object.fromEntries
- Optional catch binding 简化错误处理
- 原生 async/await，无需运行时

### 3. 更简单的依赖
- 移除 core-js
- 移除 regenerator-runtime
- 移除 babel-polyfill
- 减少包大小

### 4. 更好的维护性
- 不再需要维护两套代码（ES5 + ES2019）
- 简化构建流程
- 减少测试负担

## 测试验证

### 单元测试
```bash
npm run test:unit
# ✅ 876 passing (285ms)
# ✅ 1 pending
```

### 构建验证
```bash
npm run build
# ✅ Babel 配置正确
# ✅ 浏览器包构建成功
# ✅ 保留 ES2019 语法 (class, async/await)
```

## 常见问题

### Q: 我的 Node.js 版本低于 12.0.0 怎么办？
A: 请升级到 Node.js 12+ (推荐使用 LTS 版本，如 12.x, 14.x, 16.x, 18.x, 20.x)

### Q: 我需要支持 IE 11 怎么办？
A: ExcelJS 不再支持 IE 11。请考虑：
- 使用旧版本 ExcelJS (4.3.0 或更早)
- 在服务端处理 Excel，前端只显示结果
- 使用现代浏览器

### Q: 我还需要 babel-polyfill 吗？
A: 不需要。ExcelJS 现在面向 ES2019+ 环境，所有必需特性都已原生支持。

### Q: 浏览器包的大小有变化吗？
A: 由于移除了 polyfills 和减少了转译，包大小应该会减小。

## 相关链接

- [Node.js 发布时间表](https://nodejs.org/en/about/releases/)
- [ES2019 特性列表](https://github.com/tc39/proposals/blob/master/finished-proposals.md)
- [浏览器兼容性查询](https://caniuse.com/)

## 版本历史

- **4.4.0**: 全面升级至 ES2019，移除 ES5 支持
- **4.0.0**: 引入 ES5 可选导入 (`dist/es5`)
- **3.0.0**: 主导出改为原始源码

---

**更新日期**: 2024
**最低支持**: Node.js 12.0.0 / ES2019
