const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    console.log('开始获取排行榜数据')
    
    // 获取所有参赛者数据
    const { data } = await db.collection('contestants')
      .field({
        _id: true,
        name: true,
        members: true,
        voteCount: true,
        createTime: true
      })
      .orderBy('voteCount', 'desc')
      .orderBy('createTime', 'asc')
      .get()
    
    console.log('查询到的数据:', data)
    
    // 处理数据，确保每个字段都有值
    const formattedData = data.map(item => ({
      _id: item._id,
      name: item.name || '',
      members: item.members || '',
      voteCount: item.voteCount || 0,
      createTime: item.createTime
    }))
    
    return {
      success: true,
      list: formattedData
    }
  } catch (err) {
    console.error('[getRankList] 错误:', err)
    return {
      success: false,
      error: err.message || '获取排行榜数据失败'
    }
  }
} 