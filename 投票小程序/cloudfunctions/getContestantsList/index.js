const cloud = require('wx-server-sdk')

cloud.init({
  env: 'eee-3gvq7a499ead66de'
})

const db = cloud.database()

// 获取视频临时链接
const getTempFileURL = async (fileID) => {
  try {
    const { fileList } = await cloud.getTempFileURL({
      fileList: [fileID]
    })
    return fileList[0].tempFileURL
  } catch (err) {
    console.error('获取视频临时链接失败:', err)
    return fileID
  }
}

exports.main = async (event, context) => {
  try {
    const { page = 1, pageSize = 10 } = event
    const db = cloud.database()
    
    // 获取总数，用于判断是否还有更多数据
    const { total } = await db.collection('contestants').count()
    
    // 如果是排行榜调用（pageSize > 100），返回所有数据
    if (pageSize > 100) {
      const contestants = await db.collection('contestants')
        .orderBy('voteCount', 'desc')
        .orderBy('createTime', 'desc')
        .get()
      
      const processedList = await Promise.all(
        contestants.data.map(async item => {
          if (item.videoUrl && item.videoUrl.startsWith('cloud://')) {
            item.videoUrl = await getTempFileURL(item.videoUrl)
          }
          return item
        })
      )

      return {
        success: true,
        list: processedList,
        total
      }
    }
    
    // 首页分页查询 - 先获取所有数据并排序
    const allContestants = await db.collection('contestants')
      .orderBy('voteCount', 'desc')  // 按投票数降序
      .orderBy('createTime', 'desc')  // 同票数时按创建时间降序
      .get()
    
    // 手动分页
    const start = (page - 1) * pageSize
    const pageData = allContestants.data.slice(start, start + pageSize)
    
    // 处理视频链接
    const processedList = await Promise.all(
      pageData.map(async item => {
        if (item.videoUrl && item.videoUrl.startsWith('cloud://')) {
          item.videoUrl = await getTempFileURL(item.videoUrl)
        }
        return item
      })
    )

    return {
      success: true,
      list: processedList,
      total,
      hasMore: (start + pageSize) < total
    }
  } catch (err) {
    console.error('获取参赛者列表失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
} 