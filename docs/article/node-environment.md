
## 隔离 nodejs 版本，在不同项目使用不同 node 版本方法（使用切换环境变量方法）

### Windows 环境

#### 一.下载不同的 nodejs 版本 zip[官网](https://nodejs.org/zh-cn/download)

#### 二.选择安装位置（可修改至自定义的路径）

在安装路径文件夹新增 node_cache 文件和 node_global 文件

#### 三.添加环境变量（位置：设置 =>> 系统 =>> 高级系统设置 =>> 环境变量）

1. 检查系统环境变量是否已经添加 node 路径，已经添加就先删除<br>
2. 在用户变量新增 NODE_GLOBAL，值是 node 路径的 node_global。新增 NODE_PATH，值是 nodejs 安装路径。在用户变量 Path（没有新增）新增 %NODE_PATH% 和 %NODE_GLOBAL% 用于修改 node 路径<br>
   到此已完成 nodejs 安装，可以执行 node -v 检查

#### 四.使用脚本切换 nodejs 版本

前置：我在 D:\node-version 目录下安装了两个 node 版本分属 v-16（D:\node-version\v-16）文件和 v-21（D:\node-version\v-21）文件<br>

1. 新建文件 switch-node.bat 在脚本内容新增一下内容并保存

```
@echo off
setlocal enabledelayedexpansion

REM 检查参数
if "%1"=="" (
echo Usage: %0 [node-version]
echo Available versions: v-16, v-21 // 可以修改入参，参数是文件夹名称
exit /b 1
)

REM 设置 Node.js 版本路径
set "NODE_VERSION=%1"
set "NODE_PATH=D:\node-version\%NODE_VERSION%"
set "NODE_GLOBAL=D:\node-version\%NODE_VERSION%\node_global"

REM 检查 Node.js 版本是否存在
if not exist "%NODE_PATH%" (
echo Node.js version %NODE_VERSION% not found at %NODE_PATH%.
exit /b 1
)

REM 更新环境变量
setx NODE_PATH "D:\node-version\%NODE_VERSION%"
setx NODE_GLOBAL "D:\node-version\%NODE_VERSION%\node_global"

REM 验证切换是否成功
echo Switching to Node.js version %NODE_VERSION%...
%NODE_PATH%\node.exe -v

endlocal
```

2. 使用方式

```
// 在 switch-node.bat 目录下打开cmd，执行一下命令
switch-node.bat v-16
// 出现一下提示表示切换成功
// Switching to Node.js version v-16...
// v16.20.2
```

#### 五.vscode 打开项目自动切换版本设置

1. 把 switch-node.bat 复制一份到项目目录下
2. 项目目录新增.vscode，此目录新增 tasks.json

   tasks.json 内容

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Switch Node v21",
      "type": "shell",
      "command": ".\\switch-node.bat",
      "args": ["v-16"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "dedicated"
      },
      "runOptions": {
        "runOn": "folderOpen"
      },
      "problemMatcher": []
    }
  ]
}
```
