const express = require('express');
const path = require('path');
const fs = require('fs');
const afs = require('fs-extra');
const ocrRouter = require('./ocrRouter');

// 创建Express应用
const app = express();
const port = process.env.PORT || 80;

// 确保临时文件夹存在
afs.ensureDirSync(path.join(__dirname, 'tempImgs'));

// 允许解析 JSON 请求体
app.use(express.json({limit: '10mb'}));

// 允许解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 使用OCR路由
app.use('/api', ocrRouter);

// 简单的健康检查路由
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '图像OCR服务正常运行',
    time: new Date().toISOString()
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`OCR服务已启动，监听端口 ${port}`);
}); 