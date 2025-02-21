const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  try {
    console.log('开始获取活动信息')
    
    const activityInfo = {
      success: true,
      description: "展示优秀的移动互联网开发项目，发掘创新应用与解决方案",
      rules: [
        "1. 参赛对象：所有开发移动互联网项目的同学",
        "2. 作品要求：必须是可演示的移动端应用或小程序",
        "3. 评分标准：技术实现40%、创新性30%、用户体验30%",
        "4. 提交材料：项目介绍视频、团队成员信息、项目说明"
      ],
      schedule: {
        signupStart: "2024-12-20 00:00",
        signupEnd: "2024-12-31 23:59",
        voteStart: "2024-12-20 00:00",
        voteEnd: "2024-12-31 23:59"
      },
      contact: {
        qq: "486436738"
      },
      categories: [
        "小程序开发",
        "移动应用开发",
        "Web应用开发",
        "创新应用",
        "解决方案"
      ],
      requirements: [
        "项目必须是原创作品",
        "具有完整的功能演示",
        "符合微信小程序或移动应用相关规范",
        "有实际应用价值或创新点"
      ],
      prizes: [
        "一等奖：1名",
        "二等奖：2名",
        "三等奖：3名",
        "优秀奖：若干名"
      ]
    }
    
    console.log('返回的活动信息:', activityInfo)
    return activityInfo
    
  } catch (err) {
    console.error('[getActivityInfo] 错误:', err)
    return {
      success: false,
      error: err.message || '获取活动信息失败'
    }
  }
} 