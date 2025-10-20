# Mocha → Vitest Migration Guide

## ✅ 第一个测试文件迁移完成

### 迁移文件
- **原文件**: `spec/unit/utils/utils.spec.js` (Mocha + Chai)
- **新文件**: `spec/unit/utils/utils.spec.ts` (Vitest + TypeScript)

### 测试结果对比

#### Vitest (新)
```
✓ spec/unit/utils/utils.spec.ts (7 tests) 2ms
  ✓ utils > xmlEncode > encodes xml text
  ✓ utils > isDateFmt > 'yyyy-mm-dd' a date
  ✓ utils > isDateFmt > '' is not a date
  ✓ utils > isDateFmt > '[Green]#,##0 ;[Red](#,##0)' is not a date
  ✓ utils > dateToExcel > should convert date to excel properly
  ✓ utils > excelToDate > should round to the nearest millisecond
  ✓ utils > excelToDate > should not lost millisecond precision

Test Files  1 passed (1)
Tests  7 passed (7)
Duration  332ms
```

#### Mocha (原)
```
✓ encodes xml text
✓ 'yyyy-mm-dd' a date
✓ '' is not a date
✓ '[Green]#,##0 ;[Red](#,##0)' is not a date
✓ should convert date to excel properly
✓ should round to the nearest millisecond
✓ should not lost millisecond precision

7 passing
```

**✅ 100% 测试逻辑一致，全部通过！**

---

## 🔄 API 映射表

### Chai → Vitest 断言映射

| Mocha + Chai | Vitest | 说明 |
|--------------|--------|------|
| `expect(x).to.equal(y)` | `expect(x).toBe(y)` | 严格相等 |
| `expect(x).to.deep.equal(y)` | `expect(x).toEqual(y)` | 深度相等 |
| `expect(x).to.be.true()` | `expect(x).toBe(true)` | 布尔值 true |
| `expect(x).to.be.false()` | `expect(x).toBe(false)` | 布尔值 false |
| `describe()` | `describe()` | 相同 |
| `it()` | `it()` | 相同 |

---

## 📁 项目结构

### 新增文件

```
exceljs/
├── vitest.config.ts              # Vitest 配置
├── spec/
│   ├── config/
│   │   └── vitest-setup.ts       # Vitest 全局设置
│   ├── vitest.d.ts               # TypeScript 类型声明
│   └── unit/
│       └── utils/
│           └── utils.spec.ts     # 迁移后的测试文件
```

---

## 🛠️ 配置文件

### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./spec/config/vitest-setup.ts'],
    include: ['spec/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './lib'),
    },
  },
});
```

### `spec/config/vitest-setup.ts`
- 实现了 `verquire()` 函数（兼容原 Mocha 测试的模块加载逻辑）
- 支持 ES5 和原生模块
- 全局可用，无需在每个测试文件中导入

---

## 🎯 迁移原则

### ✅ 严格遵守的原则

1. **逻辑完全一致** - 测试用例数量、测试内容、断言逻辑完全相同
2. **不改动测试逻辑** - 只转换 API，不优化或修改测试行为
3. **保持描述文本** - describe/it 的文本完全保持原样
4. **数据完全相同** - 测试数据、期望值完全一致

### ❌ 不做的事情

- ❌ 不优化测试代码
- ❌ 不修改测试逻辑
- ❌ 不添加新测试
- ❌ 不使用 Chai（完全使用 Vitest 原生 API）

---

## 📊 迁移对比

### 依赖变化

**Before (Mocha)**
```json
{
  "devDependencies": {
    "mocha": "^7.2.0",
    "chai": "^4.2.0",
    "chai-xml": "^0.3.2",
    "chai-datetime": "^1.7.0",
    "dirty-chai": "^2.0.1"
  }
}
```

**After (Vitest)**
```json
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/ui": "^3.2.4"
  }
}
```

### 性能对比

| 测试框架 | 7 个测试耗时 |
|---------|-------------|
| Mocha   | ~439ms (完整套件) |
| Vitest  | 2ms (单文件) |

---

## 🚀 运行命令

### Vitest 测试
```bash
# 运行单个文件
npx vitest run spec/unit/utils/utils.spec.ts

# 运行所有 Vitest 测试
npx vitest run

# Watch 模式
npx vitest

# UI 模式
npx vitest --ui
```

### Mocha 测试（原）
```bash
# 运行单元测试
npm run test:unit

# 运行完整测试
npm run test:full
```

---

## 📝 下一步迁移计划

### 建议迁移顺序

1. ✅ **已完成**: `spec/unit/utils/utils.spec.ts`
2. 🔜 **下一个**: 选择其他简单的 utils 测试
3. 🔜 **逐步**: 迁移所有 unit tests
4. 🔜 **最后**: integration 和 end-to-end tests

### 迁移检查清单

每个文件迁移后需要确认：

- [ ] 测试数量相同
- [ ] 所有测试通过
- [ ] 描述文本完全一致
- [ ] 断言逻辑完全相同
- [ ] 原 Mocha 测试仍然通过（确保没有破坏）

---

## ⚠️ 注意事项

1. **保留原文件** - 迁移完成前不要删除 `.spec.js` 文件
2. **并行运行** - 可以同时保持 Mocha 和 Vitest 测试
3. **逐个迁移** - 一次迁移一个文件，确保质量
4. **验证一致性** - 每次迁移后都要对比原测试

---

## 🎉 总结

第一个测试文件迁移成功！已验证：
- ✅ 使用纯 Vitest API（无 Chai）
- ✅ TypeScript 类型安全
- ✅ 100% 测试逻辑一致
- ✅ 所有测试通过
- ✅ 保持与原 Mocha 测试完全相同的行为

可以安全地继续迁移其他测试文件！
