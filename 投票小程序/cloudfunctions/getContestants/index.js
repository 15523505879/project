const cloud = require('wx-server-sdk')

cloud.init({
  env: 'eee-3gvq7a499ead66de'
})

exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const { onlyCount } = event
  
  try {
    // 如果只需要数量，直接返回计数
    if (onlyCount) {
      const { total } = await db.collection('contestants').count()
      return {
        success: true,
        total
      }
    }
    
    // 获取所有参赛者信息，按投票数降序排序
    const { data } = await db.collection('contestants')
      .orderBy('voteCount', 'desc')
      .get()
    
    return {
      success: true,
      data: data.map(item => ({
        ...item,
        createTime: item.createTime.toJSON()
      }))
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 