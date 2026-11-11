# 南政工作台 v1.1.0（融通工作台重建版）

本项目参考用户提供的融通工作台 APK 与页面截图，以 Expo / React Native 独立重建界面和交互。参考 APK 为 Flutter AOT 发布包，不能直接恢复或复制其原始 Dart 源码。

## 当前版本

- 六个业务页签：首页、账号、订单、付款、代付、更多。
- 顶部业务页签与底部五项导航按参考截图结构重建。
- Supabase Auth 邮箱密码登录、会话持久化、权限校验、忘记密码和深链密码重置。
- 仅允许 `store_admins` 中的店主或 `store_team_members` 中已授权成员进入。
- Android 应用版本：1.1.0（versionCode 2）。

## 当前尚未完成

- 账号、订单、付款、代付页面目前使用演示数据，尚未接入真实业务数据表。
- 余额、充值、提现、转分、付款、代付等资金动作不会执行真实资金划转。
- 团队、消息、客服、公告、流水等其余模块仍需继续按参考 APK 的组件和状态流程重建。
- 完整一比一界面与业务流程尚未完成，当前版本不能标记为最终交付。

## 本地运行

首次在本地运行前，先从仓库中的压缩源码恢复主入口：

```bash
base64 --decode .github/source/App.js.gz.b64 | gzip --decompress --stdout > App.js
npm install
npx expo start
```

## Android APK

GitHub Actions 会自动恢复源码、安装依赖、生成 Android 项目并构建 Release APK。构建成功后，在对应 Actions 运行页面下载 `nanzheng-workbench-android-apk` artifact。

## 安全

- 客户端只使用 Supabase Publishable Key。
- 不得将 `service_role` 或 secret key 写入 App、APK 或 GitHub。
- 真实资金交易必须由经过授权的服务端执行，并保留审计记录。
