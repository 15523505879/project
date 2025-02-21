const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const now = new Date()
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    )
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const voteRecord = await db.collection('votes')
      .where({
        voterId: wxContext.OPENID,
        createTime: db.command.and([
          db.command.gte(today),
          db.command.lt(tomorrow)
        ])
      })
      .count()
    
    return {
      success: true,
      hasVoted: voteRecord.total > 0
    }
  } catch (err) {
    console.error('[checkVoteStatus] 错误:', err)
    return {
      success: false,
      error: err.message || '检查投票状态失败'
    }
  }
} 