# 使用Bun作为运行环境
FROM oven/bun:1.3.1-alpine

# 设置工作目录
WORKDIR /app

# 创建数据目录，用于Docker环境下存储剪切板内容
RUN mkdir -p /data && chmod 777 /data

# 复制package.json、bun.lock和bunfig.toml文件
COPY package*.json bun.lock bunfig.toml ./

# 使用bun安装依赖
RUN bun install --production

# 复制所有项目文件
COPY . .

# 暴露端口
EXPOSE 5159

ENV IN_DOCKER=true
ENV MAX_ITEMS=1000
ENV MAX_AGE=0
ENV WRITE_INTERVAL=10
ENV MAX_CHANGES=100
ENV MIN_INTERVAL=5000
ENV FORCE_WRITE=true

# 添加标签信息
LABEL 镜像制作者="https://space.bilibili.com/17547201" \
      GitHub主页="https://github.com/Firfr/jian_qie_ban" \
      Gitee主页="https://gitee.com/firfe/jian_qie_ban"

# 设置启动命令（使用bun）
ENTRYPOINT ["bun", "run", "main.js"]
