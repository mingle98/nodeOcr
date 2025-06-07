const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const fs = require('fs');
const afs = require('fs-extra');
const path = require('path');
const tesr = require('node-tesr');

// 设置Tesseract数据目录
process.env.TESSDATA_PREFIX = path.join(__dirname, 'tessdata');

// 图片OCR识别接口
router.post('/imgOcr', async (req, res) => {
    try {
        // 清空临时文件夹
        try {
            await afs.emptyDirSync(path.join(__dirname, 'tempImgs'));
            console.log('清空tempImgs成功');
        } catch (error) {
            console.log('清空tempImgs失败:', error);
        }

        // 创建表单解析对象
        let form = new multiparty.Form();
        
        // 设置文件存储路径
        form.uploadDir = path.join(__dirname, 'tempImgs');
        
        // 解析表单
        form.parse(req, async (err, fields, files) => {
            try {
                // 参数验证
                if (!fields) {
                    return res.status(400).json({
                        code: -11,
                        msg: '参数错误, 请检查参数是否正确',
                        data: {}
                    });
                }
                
                // 验证文件是否存在
                if (!files || !files.file || !files.file[0]) {
                    return res.status(400).json({
                        code: -1,
                        msg: '请上传file图片资源(form-data格式)',
                        data: {}
                    });
                }
                
                // 图片大小限制 (3MB)
                if (files.file[0].size > 1024 * 1024 * 3) {
                    return res.status(400).json({
                        code: -2,
                        msg: '被检测图片最大3M',
                        data: {}
                    });
                }
                
                // 验证图片类型
                let imgReg = /\S+\.(png|jpeg|jpg)$/g;
                let originImgName = files.file[0].originalFilename || files.file[0].path;
                if (!imgReg.test(originImgName)) {
                    return res.status(400).json({
                        code: -3,
                        msg: '仅仅支持（png、jpeg、jpg）类型图片检测',
                        data: {}
                    });
                }
                
                // 语言设置
                let langArr = ['chi_sim', 'eng'];
                let userLang = fields.lang || [];
                if (userLang[0] && !langArr.includes(userLang[0])) {
                    userLang[0] = langArr[0];
                }
                let lang = userLang[0] || 'chi_sim';
                
                // 确认文件路径存在
                if (!files || !files.file[0] || !files.file[0].path || !fs.existsSync(files.file[0].path)) {
                    return res.status(400).json({
                        code: -777,
                        msg: 'OCR识别失败(file path is bad)',
                        data: {}
                    });
                }
                
                // 执行OCR识别
                tesr(files.file[0].path, { l: lang, psm: 3 }, async function(err, data) {
                    try {
                        // 识别完成后清空临时文件夹
                        await afs.emptyDirSync(path.join(__dirname, 'tempImgs'));
                        console.log('清空tempImgs成功');
                    } catch (error) {
                        console.log('清空tempImgs失败:', error);
                    }
                    
                    if (err) {
                        return res.status(500).json({
                            code: -4,
                            msg: 'OCR识别失败',
                            data: {}
                        });
                    }
                    
                    // 返回识别结果
                    res.json({
                        code: 0,
                        msg: 'OCR识别成功',
                        data: {
                            text: data
                        }
                    });
                });
            } catch (error) {
                console.log('OCR处理异常:', error);
                return res.status(500).json({
                    code: -91,
                    msg: 'OCR识别失败',
                    data: {}
                });
            }
        });
    } catch (error) {
        console.log('OCR接口异常:', error);
        try {
            await afs.emptyDirSync(path.join(__dirname, 'tempImgs'));
            console.log('清空tempImgs成功2');
        } catch (error) {
            console.log('清空tempImgs失败2:', error);
        }
        return res.status(500).json({
            code: -9999,
            msg: 'OCR识别失败',
            data: {}
        });
    }
});

// Base64图片OCR识别接口
router.post('/base64Ocr', async (req, res) => {
    try {
        const { base64Image, lang } = req.body;
        
        // 参数验证
        if (!base64Image || typeof base64Image !== 'string') {
            return res.status(400).json({
                code: -1,
                msg: '请提供有效的base64图片',
                data: {}
            });
        }
        
        // 验证base64格式
        if (!base64Image.match(/^data:image\/(jpeg|png|jpg);base64,/)) {
            return res.status(400).json({
                code: -21,
                msg: '请传入有效的Base64格式的图片,只支持jpeg、png、jpg格式的图片',
                data: {}
            });
        }
        
        // 清空临时文件夹
        try {
            await afs.emptyDirSync(path.join(__dirname, 'tempImgs'));
        } catch (error) {
            console.log('清空tempImgs失败:', error);
        }
        
        // 创建临时文件
        const tempImgPath = path.join(__dirname, 'tempImgs', `temp_${Date.now()}.jpg`);
        
        // 提取base64数据
        const base64Data = base64Image.replace(/^data:image\/(jpeg|png|jpg);base64,/, '');
        
        // 写入临时文件
        fs.writeFileSync(tempImgPath, Buffer.from(base64Data, 'base64'));
        
        // 设置语言
        let ocrLang = lang || 'chi_sim';
        if (!['chi_sim', 'eng'].includes(ocrLang)) {
            ocrLang = 'chi_sim';
        }
        
        // 执行OCR识别
        tesr(tempImgPath, { l: ocrLang, psm: 3 }, async function(err, data) {
            try {
                // 识别完成后清空临时文件夹
                await afs.emptyDirSync(path.join(__dirname, 'tempImgs'));
            } catch (error) {
                console.log('清空tempImgs失败:', error);
            }
            
            if (err) {
                return res.status(500).json({
                    code: -4,
                    msg: 'OCR识别失败',
                    data: {}
                });
            }
            
            // 返回识别结果
            res.json({
                code: 0,
                msg: 'OCR识别成功',
                data: {
                    text: data
                }
            });
        });
    } catch (error) {
        console.log('Base64 OCR接口异常:', error);
        try {
            await afs.emptyDirSync(path.join(__dirname, 'tempImgs'));
        } catch (error) {
            console.log('清空tempImgs失败:', error);
        }
        return res.status(500).json({
            code: -9999,
            msg: 'OCR识别失败',
            data: {}
        });
    }
});

module.exports = router; 