const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    await db.collection('page_views').add({
      data: {
        createTime: db.serverDate(),
        openid: cloud.getWXContext().OPENID
      }
    })
    
    return {
      success: true
    }
  } catch (err) {
    console.error('[updatePageView] 错误:', err)
    return {
      success: false,
      error: err
    }
  }
} 