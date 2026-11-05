# 嵌入式硬件工程总仓库

本仓库统一管理 Even-lwx 维护的九个嵌入式硬件工程。
每个工程保留独立的 Git 仓库，通过 Git 子模块纳入本仓库；总仓库记录各工程的固定提交版本。

| 工程 | 独立仓库 |
| --- | --- |
| AD7682 | https://github.com/Even-lwx/AD7682 |
| 三路单节锂电池充电器 | https://github.com/Even-lwx/Triple-1S-Battery-Charger |
| QI5W-R-Ver2.0 | https://github.com/Even-lwx/QI5W-R-Ver2.0 |
| ADS124S08 热电阻采集 | https://github.com/Even-lwx/ADS124S08_RTD_Acq |
| STM32F103RCT6 最小系统板 | https://github.com/Even-lwx/STM32F103RCT6-Minimal-System-Board |
| HookWeightModule | https://github.com/Even-lwx/HookWeightModule |
| QiRec-5-T | https://github.com/Even-lwx/QiRec-5-T |
| QiRec-5-R | https://github.com/Even-lwx/QiRec-5-R |
| UML244R | https://github.com/Even-lwx/UML244R |

完整克隆总仓库及全部子模块：

```sh
git clone --recurse-submodules git@github.com:Even-lwx/lwx-embedded-hardware-projects.git
```

上述命令需要预先配置 GitHub SSH 密钥。更新某个子工程后，先在子工程中提交并推送，再回到总仓库提交对应子模块的新版本引用。

项目自有说明文档和解释性注释使用中文；芯片型号、代码标识符、协议命令及工具识别标记保留原文，第三方原厂文件和许可证保留原始内容。
