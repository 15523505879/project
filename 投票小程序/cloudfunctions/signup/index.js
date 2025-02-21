const cloud = require('wx-server-sdk')

cloud.init({
  env: 'eee-3gvq7a499ead66de'
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { name, members, contact, description, coverUrl, videoUrl } = event
  const db = cloud.database()
  
  try {
    // 添加报名信息
    const result = await db.collection('contestants').add({
      data: {
        name,           // 项目名称
        members,        // 团队成员
        contact,        // 联系方式
        description,    // 项目介绍
        coverUrl,       // 封面图片
        videoUrl,       // 视频链接
        voteCount: 0,   // 初始票数
        createTime: db.serverDate(),
        _openid: wxContext.OPENID
      }
    })
    
    // 更新统计数据
    await db.collection('statistics').doc('total').update({
      data: {
        signupCount: db.command.inc(1)
      }
    }).catch(err => {
      console.error('更新统计数据失败:', err)
    })
    
    return {
      success: true,
      data: result
    }
  } catch (err) {
    console.error('[signup] 错误:', err)
    return {
      success: false,
      error: err.message || '报名失败'
    }
  }
} 