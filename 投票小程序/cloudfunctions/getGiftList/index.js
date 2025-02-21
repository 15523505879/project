const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 从数据库获取礼物列表
    const { data } = await db.collection('gifts')
      .orderBy('price', 'asc')
      .get()
    
    return {
      success: true,
      list: data
    }
  } catch (err) {
    console.error('[getGiftList] 错误:', err)
    return {
      success: false,
      error: err
    }
  }
} 