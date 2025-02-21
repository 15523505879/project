// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'eee-3gvq7a499ead66de', // 您的云环境ID
      traceUser: true
    })

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
      },
    })
  },
})