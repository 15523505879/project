const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { giftId, contestantId } = event
  const wxContext = cloud.getWXContext()
  
  try {
    // 检查用户积分是否足够
    const userRes = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .get()
    
    const user = userRes.data[0]
    const giftRes = await db.collection('gifts')
      .doc(giftId)
      .get()
    
    const gift = giftRes.data
    
    if (user.points < gift.price) {
      return {
        success: false,
        error: '积分不足'
      }
    }
    
    // 扣除积分并记录礼物赠送
    await db.collection('users').doc(user._id).update({
      data: {
        points: user.points - gift.price
      }
    })
    
    await db.collection('gift_records').add({
      data: {
        userId: user._id,
        contestantId,
        giftId,
        createTime: db.serverDate()
      }
    })
    
    return {
      success: true
    }
  } catch (err) {
    console.error('[sendGift] 错误:', err)
    return {
      success: false,
      error: err
    }
  }
} 