const cloud = require('wx-server-sdk')

cloud.init({
  env: 'eee-3gvq7a499ead66de'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { contestantId } = event
  
  try {
    // 检查今日投票次数
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
    
    // 限制每天只能投1票
    const DAILY_VOTE_LIMIT = 1
    if (voteRecord.total >= DAILY_VOTE_LIMIT) {
      return {
        success: false,
        error: '您今天已经投过票了，明天再来吧！'
      }
    }

    // 开始事务
    const transaction = await db.startTransaction()
    
    try {
      // 添加投票记录
      await transaction.collection('votes').add({
        data: {
          voterId: wxContext.OPENID,
          contestantId,
          createTime: db.serverDate()
        }
      })

      // 更新作品票数
      await transaction.collection('contestants')
        .doc(contestantId)
        .update({
          data: {
            voteCount: db.command.inc(1)
          }
        })

      // 提交事务
      await transaction.commit()
      
      return {
        success: true
      }
    } catch (err) {
      // 回滚事务
      await transaction.rollback()
      throw err
    }
  } catch (err) {
    console.error('[castVote] 错误:', err)
    return {
      success: false,
      error: err.message || '投票失败'
    }
  }
} 