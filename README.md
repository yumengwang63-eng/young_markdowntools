# young_markdowntools

这是一个在浏览器里使用的 Markdown 工具站。按下面的步骤，可以在自己的电脑上把它跑起来。

## 你需要先安装

- [Git](https://git-scm.com/downloads)
- [Node.js 22](https://nodejs.org/) 或更新版本（安装时勾选 npm）

装好后，打开终端，输入下面两条命令。能看到版本号就说明安装成功：

```bash
git --version
node --version
```

## 下载并启动

在你想存放项目的文件夹里打开终端，依次执行：

```bash
git clone https://github.com/yumengwang63-eng/young_markdowntools.git
cd young_markdowntools
npm ci
npm run dev
```

`npm ci` 会按锁文件安装依赖，第一次可能要等几分钟。看到终端里出现本地地址后，用浏览器打开：

http://127.0.0.1:3000

要停掉网站，回到这个终端，按 `Ctrl + C`。

## 换一台电脑或重新打开

代码已经在本机时，不用再 clone。进入项目文件夹后执行：

```bash
npm run dev
```

然后仍然打开 http://127.0.0.1:3000 。

## 常见情况

- 提示找不到 `node` 或 `npm`：重新安装 Node.js，安装完成后关掉终端再开一个。
- 提示端口 3000 已被占用：关掉之前没停掉的 `npm run dev`，或关掉占用 3000 端口的程序，再执行一次 `npm run dev`。
- 页面打不开：确认终端里这条命令还在运行，地址是 `http://127.0.0.1:3000`，不要用 `https`。

不需要配置账号。编辑器里保存的文档只存在当前这台浏览器中，换浏览器或清掉网站数据后不会自动还在。
