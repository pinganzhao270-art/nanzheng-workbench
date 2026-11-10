# 南政工作台（界面框架 v2）

这是私人团队使用的 Expo / React Native 手机 App 界面框架，目标平台为 iPhone 和 Android。

## 本版本已搭建
- 登录界面视觉框架（目前仅预览，不验证账号）
- 首页与底部导航
- 商品管理、订单中心、团队成员、经营统计页面框架
- 深蓝 + 白色视觉风格
- CNY 人民币业务标识

## 重要说明
当前版本是可运行的界面原型，不是已连接真实数据库的正式软件。登录按钮仅进入预览，不会验证邮箱/密码；页面暂时显示空状态。下一阶段再连接现有 Supabase 项目并完善真实功能。

## 本地运行
需要安装 Node.js。解压后在项目目录执行：

```bash
npm install
npx expo start
```

用 iPhone 或 Android 手机安装 Expo Go 后扫描终端/网页显示的二维码预览。

## 制作 Android 测试 APK
安装并登录 EAS CLI 后执行：

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## iPhone
可先用 Expo Go 预览。要制作可长期安装的 iPhone 测试包，需要 Apple 开发者签名/分发配置。

## 安全
- 不要把 Supabase `service_role` 或 secret key 放进 App。
- `.env.example` 只是配置模板，不含真实密钥。
