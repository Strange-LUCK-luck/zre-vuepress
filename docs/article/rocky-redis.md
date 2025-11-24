## Rocky Linux 操作系统安装 MySQL 8

### 一. 更新并且安装

系统更新

```
sudo dnf update -y
```

安装 redis

```
sudo dnf install -y redis
```

### 二. 启动且设置开机自启动

```
sudo systemctl start redis
sudo systemctl enable redis
sudo systemctl status redis
```

检查版本

```
redis-server --version
```

### 三. 本地监听并且启用密码

编辑 /etc/redis.conf

```
bind 127.0.0.1
protected-mode yes
# Redis 6+ ACL 示例：
user default on >YourStrongPassword ~* +@all
# 或旧式：
requirepass YourStrongPassword
```

重启 redis

```
sudo systemctl restart redis
```

### 四. 本地开发(win10)

1. 下载 redis 的 win10 版本[官网](https://github.com/tporadowski/redis/releases)中的（Redis-x64-5.0.14.1.zip）
2. 将下载好的压缩包解压至 redis，在 redis 文件夹下打开 cmd，执行一下命令

```
redis-server.exe redis.windows.conf
```

3. 打开新窗口，测试链接(返回 PONG 即安装成功)

```
redis-cli.exe
ping
```
