App({
  globalData: {
    userInfo: null,
    needRefreshIndex: false
  },

  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'eee-3gvq7a499ead66de',
      traceUser: true
    })

    // 检查登录状态
    this.checkLoginStatus()
  },

  async checkLoginStatus() {
    try {
      // 获取缓存中的用户信息
      const userInfo = wx.getStorageSync('userInfo')
      
      if (userInfo) {
        this.globalData.userInfo = userInfo
        this.globalData.hasUserInfo = true
      } else {
        // 如果没有缓存，尝试获取用户信息
        await this.getUserProfile()
      }
    } catch (err) {
      console.error('检查登录状态失败:', err)
    }
  },

  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo
          this.globalData.hasUserInfo = true
          // 存储用户信息
          wx.setStorageSync('userInfo', res.userInfo)
          resolve(res.userInfo)
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err)
          // 如果用户拒绝授权，跳转到授权页面
          wx.redirectTo({
            url: '/pages/auth/auth'
          })
          reject(err)
        }
      })
    })
  },

  // 添加一个检查是否已登录的方法
  checkLogin() {
    if (!this.globalData.hasUserInfo) {
      wx.redirectTo({
        url: '/pages/auth/auth'
      })
      return false
    }
    return true
  }
}) 