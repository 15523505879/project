const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event
  
  try {
    const { data } = await db.collection('contestants')
      .doc(id)
      .get()
    
    if (!data) {
      throw new Error('作品不存在')
    }

    return {
      success: true,
      data: data
    }
  } catch (err) {
    console.error('[getContestant] 错误:', err)
    return {
      success: false,
      error: err.message || '获取作品信息失败'
    }
  }
} 