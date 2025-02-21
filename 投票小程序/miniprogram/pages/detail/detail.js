const app = getApp()

Component({
  data: {
    activityInfo: {
      description: '',
      rules: [],
      schedule: {
        signupStart: '',
        signupEnd: '',
        voteStart: '',
        voteEnd: ''
      },
      contact: {
        qq: ''
      },
      categories: [],
      requirements: [],
      prizes: []
    }
  },

  pageLifetimes: {
    show() {
      if (!app.checkLogin()) return
      if (typeof this.getTabBar === 'function') {
        this.getTabBar().setData({
          selected: 3
        })
      }
    }
  },

  lifetimes: {
    attached() {
      if (!app.checkLogin()) return
      this.getActivityInfo()
    }
  },

  methods: {
    async getActivityInfo() {
      wx.hideLoading()
      
      try {
        wx.showLoading({ 
          title: '加载中...',
          mask: true
        })
        
        const { result } = await wx.cloud.callFunction({
          name: 'getActivityInfo'
        })
        
        if (result && result.success) {
          const schedule = result.schedule || {}
          const contact = result.contact || {}
          
          this.setData({
            activityInfo: {
              description: result.description || '',
              rules: result.rules || [],
              schedule: {
                signupStart: schedule.signupStart || '',
                signupEnd: schedule.signupEnd || '',
                voteStart: schedule.voteStart || '',
                voteEnd: schedule.voteEnd || ''
              },
              contact: {
                qq: contact.qq || ''
              },
              categories: result.categories || [],
              requirements: result.requirements || [],
              prizes: result.prizes || []
            }
          })
        } else {
          throw new Error('获取活动信息失败')
        }
      } catch (err) {
        console.error('获取活动信息失败:', err)
        wx.showToast({
          title: '获取活动信息失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        setTimeout(() => {
          wx.hideLoading()
        }, 100)
      }
    }
  }
}) 