Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: false
    },
    color: {
      type: String,
      value: '#ffffff'
    },
    background: {
      type: String,
      value: 'transparent'
    }
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 44
  },

  lifetimes: {
    attached() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync()
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
      
      // 计算导航栏高度
      const navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height
      
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight,
        navBarHeight: navBarHeight
      })
    }
  },

  methods: {
    onBack() {
      if (this.data.back) {
        wx.navigateBack({
          delta: 1
        })
      }
    }
  }
})
