const cloud = require('wx-server-sdk')

cloud.init({
  env: 'eee-3gvq7a499ead66de'
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { contestantId } = event
  const db = cloud.database()
  
  try {
    // 生成订单号
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 创建支付订单
    const result = await cloud.cloudPay.unifiedOrder({
      body: '送花支持', // 商品描述
      outTradeNo: orderId, // 订单号
      spbillCreateIp: '127.0.0.1', // IP地址
      subMchId: '1234567890', // 商户号，需要替换为实际的商户号
      totalFee: 100, // 1元 = 100分
      envId: 'eee-3gvq7a499ead66de', // 云环境ID
      functionName: 'payCallback', // 支付回调云函数
      nonceStr: Math.random().toString(36).substr(2, 15), // 随机字符串
      tradeType: 'JSAPI', // 交易类型
      openid: wxContext.OPENID // 用户openid
    })
    
    // 记录订单信息
    await db.collection('orders').add({
      data: {
        _id: orderId,
        contestantId,
        voterId: wxContext.OPENID,
        amount: 100,
        status: 'PENDING',
        createTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      paymentParams: {
        ...result.payment,
        success: () => {
          console.log('支付成功')
        },
        fail: (err) => {
          console.error('支付失败:', err)
        }
      }
    }
  } catch (err) {
    console.error('创建订单失败:', err)
    return {
      success: false,
      error: err.message || '创建订单失败'
    }
  }
} 