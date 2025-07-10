# CosyVoice语音功能使用指南

## 🎯 功能概述

MentorAI 现已集成阿里云CosyVoice大模型，为practice-chat界面提供更真实、更符合人设的语音对话体验：

### 1. AI端CosyVoice语音功能（文字+语音混合输出）
- **CosyVoice大模型**：使用阿里云最新的语音合成大模型
- **人设化语音**：根据客户画像（性别、年龄、性格）智能匹配语音角色
- **情感化表达**：支持多种情感风格（理性、感性、外向、内向、急躁、耐心、犹豫）
- **高质量音频**：22kHz采样率，接近真人语音质量
- **混合输出模式**：文字显示 + CosyVoice语音播放同步进行

### 2. 学员端语音功能（语音输入）
- **实时语音识别**：边说边转录为文字
- **多种录音模式**：点击录音 / 按住说话
- **智能降噪**：自动过滤环境噪音
- **语音质量检测**：确保录音清晰度

## 🚀 快速开始

### 前端组件
语音功能通过三个核心组件实现：

1. **VoiceController** - 语音控制面板
2. **VoiceInput** - 语音输入组件  
3. **VoicePlayer** - 语音播放器

### 后端服务
- **VoiceService** - 语音处理核心服务
- **AI语音响应API** - 集成AI生成和语音合成
- **语音路由** - 提供完整的语音API接口

## 📋 技术架构

### 语音合成（TTS）
```
AI文字响应 → 客户画像分析 → 语音特征选择 → 阿里云TTS → 音频返回
```

**支持的语音特征：**
- 性别：男性/女性
- 年龄：年轻/中年/成熟
- 性格调节：理性/感性/外向/内向/急躁/耐心

### 语音识别（ASR）
```
用户语音 → Web Speech API → 实时转录 → 文字确认 → 消息发送
```

**降级方案：**
- 主要：浏览器原生 Web Speech API
- 备用：阿里云语音识别服务

## 🎛️ 语音控制功能

### 语音设置面板
- **启用语音开关**：控制整体语音功能
- **自动播放**：AI响应后自动播放语音
- **音量控制**：0-100% 音量调节
- **语速控制**：0.5x-2x 播放速度
- **播放状态指示**：实时显示播放状态

### 语音输入控制
- **录音模式切换**：点击录音 vs 按住说话
- **实时转录显示**：边录音边显示识别文字
- **录音状态指示**：视觉反馈录音状态
- **错误处理**：麦克风权限、网络错误等

## 🎨 用户界面增强

### 对话消息增强
- AI消息下方显示语音播放器
- 播放进度条和时间显示
- 语音来源标识（AI语音 vs 浏览器TTS）
- 播放控制按钮（播放/暂停）

### 输入区域增强
- 语音输入切换按钮
- 可展开的语音输入面板
- 录音模式选择
- 实时转录显示区域

### 侧边栏控制
- 语音控制面板
- 全局语音设置
- 播放状态监控

## 🔧 配置说明

### 环境变量配置
```bash
# 阿里云语音服务
ALICLOUD_TTS_APP_KEY=your_tts_app_key
ALICLOUD_ASR_APP_KEY=your_asr_app_key
ALICLOUD_API_KEY=your_api_key
```

### 默认语音设置
```javascript
{
  enableVoice: true,    // 启用语音
  autoPlay: true,       // 自动播放
  volume: 0.8,          // 音量 80%
  speed: 1.0            // 正常语速
}
```

## 🎯 客户画像语音匹配

### CosyVoice语音角色映射
| 客户特征 | CosyVoice角色 | 描述 |
|---------|-------------|------|
| 女性 + 年轻 | longxiaochun | 年轻女性，声音清脆活泼 |
| 女性 + 中年 | longyaoyao | 中年女性，声音温和知性 |
| 女性 + 成熟 | longwan | 成熟女性，声音稳重优雅 |
| 男性 + 年轻 | longfei | 年轻男性，声音阳光有活力 |
| 男性 + 中年 | longhua | 中年男性，声音沉稳专业 |
| 男性 + 成熟 | longxiaobei | 成熟男性，声音深沉有权威感 |

### 性格语音风格调节
| 性格特征 | 语速调节 | 情感风格 | 描述 |
|---------|---------|---------|------|
| 理性 | 0.9x | neutral | 理性客观，语速稍慢，语调平稳 |
| 感性 | 1.0x | warm | 感性温和，语调有起伏，富有感情 |
| 外向 | 1.1x | cheerful | 外向活泼，语速较快，语调明快 |
| 内向 | 0.8x | calm | 内向沉稳，语速较慢，语调低沉 |
| 急躁 | 1.2x | urgent | 急躁不耐，语速较快，语调急促 |
| 耐心 | 0.85x | patient | 耐心细致，语速缓慢，语调温和 |
| 犹豫 | 0.9x | hesitant | 犹豫不决，语速不均，有停顿 |

## 🔄 API接口

### 语音合成
```http
POST /api/voice/synthesize
Content-Type: application/json

{
  "text": "要转换的文字",
  "customerProfile": {
    "gender": "女",
    "age": "30岁",
    "personality": ["理性"]
  }
}
```

### AI语音响应
```http
POST /api/ai/generate-voice-response
Content-Type: application/json

{
  "message": "用户消息",
  "taskConfig": {...},
  "enableVoice": true
}
```

### 语音配置推荐
```http
POST /api/voice/recommend-voice
Content-Type: application/json

{
  "customerProfile": {
    "gender": "男",
    "age": "35岁",
    "personality": ["外向", "急躁"]
  }
}
```

## 🛠️ 开发指南

### 添加新的语音特征
1. 在 `voiceService.js` 中扩展 `voiceProfiles`
2. 添加对应的性格调节参数
3. 更新语音推荐逻辑

### 自定义语音组件
```typescript
import VoicePlayer from '@/components/VoicePlayer';

<VoicePlayer
  voiceData={voiceData}
  text={messageText}
  autoPlay={true}
  volume={0.8}
  speed={1.0}
  onPlayStart={() => console.log('开始播放')}
  onPlayEnd={() => console.log('播放结束')}
/>
```

### 集成语音输入
```typescript
import VoiceInput from '@/components/VoiceInput';

<VoiceInput
  onTranscript={(text) => setInputText(text)}
  onError={(error) => console.error(error)}
  disabled={false}
/>
```

## 🐛 故障排除

### 常见问题

**1. 语音无法播放**
- 检查浏览器是否支持音频播放
- 确认音量设置不为0
- 检查阿里云TTS配置

**2. 语音识别不工作**
- 确认浏览器支持 Web Speech API
- 检查麦克风权限
- 确认网络连接正常

**3. 语音延迟较高**
- 检查网络连接速度
- 考虑使用浏览器TTS降级
- 优化音频文件大小

### 降级处理
- **TTS降级**：阿里云TTS → 浏览器TTS
- **ASR降级**：Web Speech API → 阿里云ASR
- **网络降级**：在线服务 → 本地处理

## 📈 性能优化

### 音频缓存
- 常用语音片段预加载
- 客户特定语音配置缓存
- 音频文件压缩优化

### 网络优化
- 流式TTS处理
- 音频数据压缩
- CDN加速分发

## 🔮 未来规划

### 高级功能
- [ ] 情感语音合成
- [ ] 多语言支持
- [ ] 语音情感分析
- [ ] 实时语音对话
- [ ] 语音数据分析

### 用户体验
- [ ] 语音快捷键
- [ ] 语音主题切换
- [ ] 个性化语音训练
- [ ] 语音质量评估

---

## 📞 技术支持

如有问题或建议，请联系开发团队或查看项目文档。

**版本**: v1.0.0  
**更新时间**: 2025年1月10日
