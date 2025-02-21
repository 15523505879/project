const app = getApp()

Component({
  data: {},

  methods: {
    getUserProfile() {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          // 存储用户信息
          wx.setStorageSync('userInfo', res.userInfo)
          app.globalData.userInfo = res.userInfo
          
          // 返回上一页或首页
          const pages = getCurrentPages()
          if (pages.length > 1) {
            wx.navigateBack()
          } else {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err)
          wx.showToast({
            title: '请授权后继续使用',
            icon: 'none'
          })
        }
      })
    }
  }
}) 