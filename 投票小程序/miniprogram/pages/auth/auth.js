const app = getApp()

Page({
  handleAuth() {
    app.getUserProfile()
      .then(() => {
        // 登录成功后返回首页
        wx.switchTab({
          url: '/pages/index/index'
        })
      })
      .catch(err => {
        console.error('授权失败:', err)
        wx.showToast({
          title: '请授权后继续使用',
          icon: 'none'
        })
      })
  }
}) 