const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  try {
    console.log('开始获取统计数据')

    // 获取实际的报名人数
    const contestantsResult = await db.collection('contestants').count()
    console.log('报名人数:', contestantsResult)

    // 获取总票数（从 contestants 集合中汇总 voteCount）
    const voteResult = await db.collection('contestants')
      .aggregate()
      .group({
        _id: null,
        totalVotes: $.sum('$voteCount')
      })
      .end()
    
    const totalVotes = voteResult.list[0]?.totalVotes || 0
    console.log('总票数:', totalVotes)

    // 获取实际的浏览量
    const pageviewsResult = await db.collection('pageviews').count()
    console.log('浏览量:', pageviewsResult)

    const data = {
      signupCount: contestantsResult.total || 0,
      voteCount: totalVotes,
      viewCount: pageviewsResult.total || 0
    }

    console.log('返回的统计数据:', data)

    return {
      success: true,
      data: data
    }
  } catch (err) {
    console.error('[getStatistics] 错误:', err)
    return {
      success: false,
      error: err.message || '获取统计数据失败'
    }
  }
} 