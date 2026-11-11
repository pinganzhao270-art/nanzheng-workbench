# 政南工作台

本仓库只保留独立的 **政南工作台** Android 项目，应用源码位于 `zhengnan-workbench/`。

- Android applicationId: `com.zhengnan.workbench`
- App version: `1.0.1` (versionCode 2)
- 唯一构建工作流：`.github/workflows/zhengnan-workbench-android.yml`
- 构建产物：`zhengnan-workbench-android-v1.0.1`

旧的“南政工作台”根目录应用源码、旧 APK 构建工作流和旧源码压缩包已从当前分支清理，避免误打包旧程序。

注意：本项目当前仍在独立重建阶段。界面入口与部分页面交互已建立；真实登录、订单、收付款、代付和团队数据功能须完成后端接入及真机验收，不能仅凭 APK 构建成功判定业务完整。
