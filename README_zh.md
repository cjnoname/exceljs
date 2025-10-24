# ExcelTS

[![Build Status](https://github.com/cjnoname/exceljs/actions/workflows/tests.yml/badge.svg?branch=master&event=push)](https://github.com/cjnoname/exceljs/actions/workflows/tests.yml)

现代化的 TypeScript Excel 工作簿管理器 - 读取、操作和写入电子表格数据和样式到 XLSX 和 JSON。

## 关于本项目

ExcelTS 是 [ExcelJS](https://github.com/exceljs/exceljs) 的现代化版本，具有以下特性:

- ✅ **完整的 TypeScript 支持** - 完整的类型定义和现代 TypeScript 模式
- ✅ **升级的依赖** - 所有依赖项升级到最新稳定版本
- ✅ **现代构建系统** - 使用 Rolldown 进行更快的构建
- ✅ **增强的测试** - 迁移到 Vitest 并支持浏览器测试
- ✅ **ESM 优先** - 原生 ES Module 支持，兼容 CommonJS
- ✅ **Node 20+** - 针对现代 Node.js 版本优化
- ✅ **命名导出** - 所有导出都是命名导出，更好的 tree-shaking

## 翻译

- [English Documentation](README.md)

## 安装

```shell
npm install excelts
```

```shell
pnpm add excelts
```

```shell
yarn add excelts
```

## 快速开始

### 创建工作簿

```javascript
import { Workbook } from 'excelts';

const workbook = new Workbook();
const sheet = workbook.addWorksheet('我的工作表');

// 添加数据
sheet.addRow(['姓名', '年龄', '邮箱']);
sheet.addRow(['张三', 30, 'zhang@example.com']);
sheet.addRow(['李四', 25, 'li@example.com']);

// 保存文件
await workbook.xlsx.writeFile('output.xlsx');
```

### 读取工作簿

```javascript
import { Workbook } from 'excelts';

const workbook = new Workbook();
await workbook.xlsx.readFile('input.xlsx');

const worksheet = workbook.getWorksheet(1);
worksheet.eachRow((row, rowNumber) => {
  console.log('第 ' + rowNumber + ' 行 = ' + JSON.stringify(row.values));
});
```

### 单元格样式

```javascript
// 设置单元格值和样式
const cell = worksheet.getCell('A1');
cell.value = '你好';
cell.font = {
  name: 'Arial',
  size: 16,
  bold: true,
  color: { argb: 'FFFF0000' }
};
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFF00' }
};
```

## 功能特性

- **Excel 操作**
  - 创建、读取和修改 XLSX 文件
  - 多工作表支持
  - 单元格样式（字体、颜色、边框、填充）
  - 单元格合并和格式化
  - 行和列属性
  - 冻结窗格和拆分视图

- **数据处理**
  - 富文本支持
  - 公式和计算值
  - 数据验证
  - 条件格式
  - 图片和图表
  - 超链接
  - 数据透视表

- **高级功能**
  - 大文件流式处理
  - CSV 导入/导出
  - 带自动筛选的表格
  - 页面设置和打印选项
  - 数据保护
  - 注释和批注

## 浏览器支持

ExcelTS 同时支持 Node.js 和浏览器环境：

```javascript
// 浏览器使用
import { Workbook } from 'excelts/browser';

const workbook = new Workbook();
// ... 使用 workbook API
```

## 系统要求

- Node.js >= 20.0.0
- 支持 ES Module 的现代浏览器

## API 文档

详细的 API 文档，请参考以下综合文档部分：

- 工作簿管理
- 工作表
- 单元格和值
- 样式
- 公式
- 数据验证
- 条件格式
- 文件输入输出

API 与原始 ExcelJS 保持高度兼容。

## 贡献

欢迎贡献！请随时提交 Pull Request。

如果您提交错误修复的 pull request，请添加单元测试或集成测试（在 spec 文件夹中）来捕获该问题。

注意：请尽量避免在 PR 中修改包版本。版本在发布时更新，任何更改都可能导致合并冲突。

明确一点，添加到此库的所有贡献都将包含在库的 MIT 许可证中。

## 许可证

MIT License

基于 [ExcelJS](https://github.com/exceljs/exceljs) 由 [Guyon Roche](https://github.com/guyonroche) 创建

## 致谢

本项目是 ExcelJS 的现代化分支。原始实现的所有功劳归于：

- **Guyon Roche** - ExcelJS 原作者
- 所有 [ExcelJS 贡献者](https://github.com/exceljs/exceljs/graphs/contributors)

## 链接

- [GitHub 仓库](https://github.com/cjnoname/exceljs)
- [原始 ExcelJS](https://github.com/exceljs/exceljs)
- [问题跟踪](https://github.com/cjnoname/exceljs/issues)

## 更新日志

### 0.1.0 (2025-10-24)

- ExcelTS 首次发布
- 完整的 TypeScript 重写，严格类型检查
- 所有默认导出转换为命名导出
- 所有依赖项更新到最新版本
- 迁移到 Vitest 进行测试
- 切换到 Rolldown 进行打包
- 现代 ES Module 支持
- Node 20+ 支持
- 使用适当的访问修饰符增强类型安全
- 浏览器测试支持
- 性能优化
