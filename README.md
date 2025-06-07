# OCR 图像识别服务

[English](README_EN.md) | 简体中文

这是一个基于 Node.js 和 Tesseract OCR 引擎开发的 OCR 图像识别服务，支持中文简体和英文文本识别。

## 目录结构

```
ocr-server/
├── app.js              # 主程序入口
├── ocrRouter.js        # OCR接口路由
├── tempImgs/           # 临时图片存储目录
├── tessdata/           # Tesseract语言数据目录
│   ├── chi_sim.traineddata  # 中文简体语言包
│   └── eng.traineddata      # 英文语言包
└── node_modules/       # 项目依赖模块
```

## 安装步骤

1. 确保已安装 Node.js 环境
2. 克隆或下载此项目到本地
3. 确保 `tessdata` 目录中包含 `chi_sim.traineddata` 和 `eng.traineddata` 语言数据文件
4. 在项目根目录执行以下命令安装依赖：

```bash
yarn install
# 或者使用 npm
npm install
```

5. 启动服务：

```bash
yarn start
# 或者使用 npm
npm start
```

## API 接口说明

### 1. 图片文件识别接口

**请求URL：** `/api/imgOcr`

**请求方式：** POST

**Content-Type：** `multipart/form-data`

**参数说明：**

| 参数名 | 必选 | 类型   | 说明                             |
|--------|------|--------|----------------------------------|
| file   | 是   | File   | 要识别的图片文件（最大3MB）      |
| lang   | 否   | String | 识别语言，可选值：chi_sim, eng，默认为chi_sim |

**支持的图片格式：** png, jpeg, jpg

**请求示例：**

```bash
curl -X POST \
  http://localhost:80/api/imgOcr \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/image.jpg' \
  -F 'lang=chi_sim'
```

**返回示例：**

```json
{
  "code": 0,
  "msg": "OCR识别成功",
  "data": {
    "text": "识别出的文本内容"
  }
}
```

### 2. Base64图片识别接口

**请求URL：** `/api/base64Ocr`

**请求方式：** POST

**Content-Type：** `application/json`

**参数说明：**

| 参数名      | 必选 | 类型   | 说明                             |
|-------------|------|--------|----------------------------------|
| base64Image | 是   | String | Base64编码的图片数据             |
| lang        | 否   | String | 识别语言，可选值：chi_sim, eng，默认为chi_sim |

**支持的图片格式：** png, jpeg, jpg (Base64编码)

**请求示例：**

```bash
curl -X POST \
  http://localhost:80/api/base64Ocr \
  -H 'Content-Type: application/json' \
  -d '{
    "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZ...(此处为Base64编码的图片数据)",
    "lang": "chi_sim"
}'
```

**返回示例：**

```json
{
  "code": 0,
  "msg": "OCR识别成功",
  "data": {
    "text": "识别出的文本内容"
  }
}
```

## 错误码说明

| 错误码  | 说明                                 |
|---------|--------------------------------------|
| 0       | 成功                                 |
| -1      | 请上传file图片资源(form-data格式)    |
| -2      | 被检测图片最大3M                     |
| -3      | 仅支持（png、jpeg、jpg）类型图片检测 |
| -4      | OCR识别失败                          |
| -11     | 参数错误, 请检查参数是否正确         |
| -21     | 无效的Base64格式                     |
| -91     | OCR处理异常                          |
| -777    | OCR识别失败(file path is bad)        |
| -9999   | OCR识别失败(服务器内部错误)          |

## 注意事项

1. 请确保图片清晰可读，以提高识别准确率
2. 图片大小限制为3MB
3. 目前仅支持中文简体(chi_sim)和英文(eng)两种语言的识别
4. 默认使用中文简体(chi_sim)进行识别

## 故障排除

1. 如遇到语言包加载错误，请确保`tessdata`目录中包含相应的语言数据文件
2. 确保服务器有足够的权限访问临时文件夹和语言数据目录

## 开发者信息

此OCR服务基于以下技术开发：
- Node.js
- Express.js
- Tesseract OCR (通过node-tesr包)
- fs-extra
- multiparty

## 版权信息

© 2023 OCR Server@luckycola.com.cn