const cloud = require('wx-server-sdk')

cloud.init({
  env: 'eee-3gvq7a499ead66de'
})

exports.main = async (event, context) => {
  const { outTradeNo, resultCode } = event
  const db = cloud.database()
  const _ = db.command
  
  try {
    // 查询订单信息
    const order = await db.collection('orders').doc(outTradeNo).get()
    if (!order.data) {
      throw new Error('订单不存在')
    }
    
    if (resultCode === 'SUCCESS') {
      // 开启事务
      const transaction = await db.startTransaction()
      
      try {
        // 更新订单状态
        await transaction.collection('orders').doc(outTradeNo).update({
          data: {
            status: 'SUCCESS',
            payTime: db.serverDate()
          }
        })
        
        // 更新选手花朵数
        await transaction.collection('contestants').doc(order.data.contestantId).update({
          data: {
            flowerCount: _.inc(1)
          }
        })
        
        // 提交事务
        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }
    } else {
      // 更新订单状态为失败
      await db.collection('orders').doc(outTradeNo).update({
        data: {
          status: 'FAIL'
        }
      })
    }
    
    return { success: true }
  } catch (err) {
    console.error('支付回调处理失败:', err)
    return { success: false }
  }
} 