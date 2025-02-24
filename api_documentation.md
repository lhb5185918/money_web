# 家庭资产管理系统 API 文档

## 1. 用户相关接口

### 1.1 用户登录
```http
POST /api/user/login
```

请求体：
```json
{
  "username": "string",
  "password": "string"
}
```

响应：
```json
{
  "token": "string",
  "userInfo": {
    "id": "number",
    "username": "string",
    "role": "string"  // 家庭角色，如：爸爸、妈妈、儿子
  }
}
```

## 2. 资产概览相关接口

### 2.1 获取资产概览
```http
GET /api/assets/overview
```

响应：
```json
{
  "totalAssets": "number",      // 总资产
  "monthlyChange": "number",    // 月度变化率
  "cashAssets": "number",       // 现金资产
  "investmentAssets": "number"  // 投资资产
}
```

### 2.2 获取月度预算信息
```http
GET /api/budget/monthly
```

响应：
```json
{
  "budgetAmount": "number",     // 预算金额
  "currentSpent": "number",     // 当前支出
  "budgetProgress": "number"    // 预算进度
}
```

### 2.3 获取最近交易记录
```http
GET /api/transactions/recent
```

响应：
```json
{
  "transactions": [{
    "id": "number",
    "title": "string",
    "date": "string",
    "amount": "number",
    "type": "number",      // 0: 支出, 1: 收入
    "category": "number",  // 分类ID
    "paymentType": "number" // 支付方式ID
  }]
}
```

## 3. 资产管理相关接口

### 3.1 获取现金账户列表
```http
GET /api/assets/cash-accounts
```

响应：
```json
{
  "accounts": [{
    "id": "number",
    "name": "string",
    "type": "string",
    "balance": "number"
  }]
}
```

### 3.2 获取投资理财列表
```http
GET /api/assets/investments
```

响应：
```json
{
  "investments": [{
    "id": "number",
    "name": "string",
    "type": "string",
    "amount": "number",
    "rate": "number"  // 收益率
  }]
}
```

### 3.3 获取固定资产列表
```http
GET /api/assets/fixed-assets
```

响应：
```json
{
  "assets": [{
    "id": "number",
    "name": "string",
    "type": "string",
    "value": "number",
    "purchaseDate": "string"
  }]
}
```

## 4. 记账相关接口

### 4.1 创建新记录
```http
POST /api/transactions/create
```

请求体：
```json
{
  "type": "number",       // 0: 支出, 1: 收入
  "amount": "number",     // 金额
  "category": "number",   // 分类ID
  "paymentType": "number",// 支付方式ID
  "date": "string",       // 日期
  "remark": "string"      // 备注
}
```

### 4.2 获取分类列表
```http
GET /api/categories/list
```

响应：
```json
{
  "categories": [{
    "id": "number",
    "text": "string",
    "type": "number"  // 0: 支出分类, 1: 收入分类
  }]
}
```

### 4.3 获取支付方式列表
```http
GET /api/payment-types/list
```

响应：
```json
{
  "paymentTypes": [{
    "id": "number",
    "text": "string",
    "icon": "string"
  }]
}
```

## 5. 统计相关接口

### 5.1 获取资产分布数据
```http
GET /api/statistics/asset-distribution
```

响应：
```json
{
  "distribution": [{
    "name": "string",
    "percentage": "number",
    "amount": "number",
    "color": "string"
  }]
}
```

### 5.2 获取资产趋势数据
```http
GET /api/statistics/asset-trend
```

请求参数：
```json
{
  "months": "number"  // 获取最近几个月的数据
}
```

响应：
```json
{
  "trend": [{
    "date": "string",
    "totalAssets": "number",
    "cashAssets": "number",
    "investmentAssets": "number"
  }]
}
```

### 5.3 获取月度收支统计
```http
GET /api/statistics/monthly-summary
```

请求参数：
```json
{
  "date": "string"  // 年月
}
```

响应：
```json
{
  "income": "number",
  "expense": "number",
  "categories": [{
    "id": "number",
    "name": "string",
    "amount": "number",
    "percentage": "number"
  }]
}
```

### 5.4 获取家庭成员资产占比
```http
GET /api/statistics/family-assets
```

响应：
```json
{
  "members": [{
    "name": "string",
    "percentage": "number",
    "amount": "number"
  }]
}
```

## 数据库表结构

### 1. 用户表（users）
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 交易记录表（transactions）
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type INTEGER NOT NULL,  -- 0: 支出, 1: 收入
  amount DECIMAL(10,2) NOT NULL,
  category_id INTEGER NOT NULL,
  payment_type_id INTEGER NOT NULL,
  date DATE NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (payment_type_id) REFERENCES payment_types(id)
);
```

### 3. 分类表（categories）
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL,
  type INTEGER NOT NULL,  -- 0: 支出分类, 1: 收入分类
  icon VARCHAR(50)
);
```

### 4. 支付方式表（payment_types）
```sql
CREATE TABLE payment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50)
);
```

### 5. 资产账户表（accounts）
```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,  -- 现金/投资/固定资产
  balance DECIMAL(10,2) NOT NULL,
  rate DECIMAL(5,2),  -- 投资账户收益率
  purchase_date DATE,  -- 固定资产购入日期
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6. 预算表（budgets）
```sql
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
``` 