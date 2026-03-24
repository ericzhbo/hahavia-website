# Airtable 设置指引

## 步骤1：创建Airtable账户

1. 访问 https://airtable.com 并注册账户（免费）
2. 登录后进入您的工作区

## 步骤2：创建Base和Table

1. 点击 "Create a base" 或 "Start from scratch"
2. 选择 "From scratch"
3. 命名您的Base为 "Hahavia Website"
4. 将默认的表格重命名为 "Contacts"

## 步骤3：设置表格字段

在 "Contacts" 表格中，创建以下字段：

| 字段名 | 字段类型 | 说明 |
|--------|----------|------|
| Name | Single line text | 客户姓名 |
| Email | Email | 邮箱地址 |
| Phone | Phone number | 电话号码 |
| Message | Long text | 消息内容 |
| Status | Single select | 状态（Pending/Processing/Completed） |
| Created At | Created time | 创建时间 |

### 如何创建字段：
1. 点击 "+" 按钮添加新字段
2. 选择字段类型
3. 输入字段名称
4. 点击 "Create field"

## 步骤4：获取API密钥

1. 点击右上角的头像 → "Account"
2. 滚动到 "API" 部分
3. 点击 "Generate API key" 或 "Create token"
4. 复制生成的API密钥（格式类似：patXXXXXXXXXXXXX）
5. **保存好这个密钥，只显示一次！**

## 步骤5：获取Base ID

1. 打开您的Base
2. 点击右上角的 "Help" → "API documentation"
3. 在API文档页面，您会看到Base ID（格式类似：appXXXXXXXXXXXXX）
4. 复制这个Base ID

## 步骤6：设置Vercel环境变量

在Vercel项目设置中添加以下环境变量：

```
AIRTABLE_API_KEY=您的API密钥
AIRTABLE_BASE_ID=您的Base ID
```

### 如何在Vercel中设置：
1. 登录Vercel
2. 进入您的项目
3. 点击 "Settings" → "Environment Variables"
4. 添加上述两个变量
5. 重新部署项目

## 完成！

现在您的Airtable已经设置好了，可以开始接收和存储表单提交数据了！
