const app = getApp()

Component({
  data: {
    currentTab: 0,
    userInfo: null,  // 用户信息
    hasUserInfo: false,  // 是否已登录
    canIUseGetUserProfile: wx.getUserProfile ? true : false,  // 是否可以使用新版获取用户信息接口
    statistics: {
      signupCount: 2104,
      voteCount: 509100,
      viewCount: 975780
    },
    countdown: {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    activityInfo: {
      signupStart: '2024/12/20 00:00:00',
      signupEnd: '2024/12/31 23:59:59',
      voteStart: '2024/12/20 00:00:00',
      voteEnd: '2024/12/31 23:59:59'
    },
    countdownTimer: null,
    statsTimer: null,
    contestantsList: [],  // 参赛者列表数据
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    contestantsCount: 0,  // 添加参赛作品数量计数
  },
  methods: {
    // 获取用户信息
    getUserProfile() {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          // 存储登录状态
          wx.setStorageSync('userInfo', res.userInfo)
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err)
          wx.showToast({
            title: '请授权后继续',
            icon: 'none'
          })
        }
      })
    },

    // 切换标签页
    switchTab(e) {
      const tab = parseInt(e.currentTarget.dataset.tab)
      
      switch(tab) {
        case 0: // 首页
          wx.switchTab({ url: '/pages/index/index' })
          break
          
        case 1: // 报名
          // 检查是否登录
          if (!this.data.hasUserInfo) {
            wx.showModal({
              title: '提示',
              content: '请先登录后再报名',
              success: (res) => {
                if (res.confirm) {
                  this.getUserProfile()
                }
              }
            })
            return
          }
          wx.switchTab({ url: '/pages/signup/signup' })
          break
          
        case 2: // 排行
          wx.switchTab({ url: '/pages/rank/rank' })
          break
          
        case 3: // 详情
          wx.switchTab({ url: '/pages/detail/detail' })
          break
      }
      
      this.setData({ currentTab: tab })
    },

    // 更新倒计时
    updateCountdown() {
      try {
        const endTime = new Date('2024/12/31 23:59:59')
        const now = new Date()
        const diff = endTime - now

        if (diff <= 0) {
          this.setData({
            countdown: {
              days: '00',
              hours: '00',
              minutes: '00',
              seconds: '00'
            }
          })
          
          if (this.data.countdownTimer) {
            clearInterval(this.data.countdownTimer)
          }
          return
        }

        // 计算天数、小时、分钟、秒数
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        this.setData({
          countdown: {
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
          }
        })
      } catch (err) {
        console.error('倒计时计算错误:', err)
      }
    },

    // 获取实时统计数据
    async getStatistics() {
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getStatistics'
        })
        
        if (result && result.success && result.data) {
          const viewCount = result.data.viewCount;
          // 根据浏览量大小决定显示格式
          const formattedViewCount = viewCount >= 10000 
            ? (viewCount / 10000).toFixed(1) + '万'
            : viewCount + '';

          this.setData({
            statistics: {
              signupCount: result.data.signupCount,
              voteCount: result.data.voteCount,
              viewCount: formattedViewCount
            }
          })
        } else {
          throw new Error(result.error || '获取数据失败')
        }
      } catch (err) {
        console.error('获取统计数据失败:', err)
        this.setData({
          statistics: {
            signupCount: 0,
            voteCount: 0,
            viewCount: '0'
          }
        })
      }
    },

    // 提交表单
    submitForm() {
      const signupForm = this.selectComponent('#signupForm')
      if (signupForm) {
        signupForm.submitForm()
      }
    },

    // 获取参赛者列表
    async getContestantsList() {
      if (!this.data.hasMore) return
      
      this.setData({ loading: true })
      wx.showLoading({ title: '加载中...' })
      
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getContestantsList',
          data: {
            page: this.data.page,
            pageSize: this.data.pageSize
          }
        })
        
        if (result && result.success) {
          const list = result.list || []
          // 获取所有云存储视频的临时链接
          const videoUrls = list
            .filter(item => item.videoUrl && item.videoUrl.startsWith('cloud://'))
            .map(item => item.videoUrl)
          
          if (videoUrls.length > 0) {
            const { fileList } = await wx.cloud.getTempFileURL({
              fileList: videoUrls
            })
            
            // 更新视频链接
            list.forEach(item => {
              const fileInfo = fileList.find(file => file.fileID === item.videoUrl)
              if (fileInfo) {
                item.videoUrl = fileInfo.tempFileURL
              }
            })
          }
          
          this.setData({
            contestantsList: this.data.page === 1 
              ? list 
              : [...this.data.contestantsList, ...list],  // 新数据追加到后面
            page: this.data.page + 1,
            hasMore: list.length === this.data.pageSize
          })
        } else {
          wx.showToast({
            title: result.error || '获取参赛作品失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('获取参赛者列表失败:', err)
        wx.showToast({
          title: '获取参赛作品失败',
          icon: 'none'
        })
      } finally {
        this.setData({ loading: false })
        wx.hideLoading()
      }
    },

    // 点击作品
    onTapWork(e) {
      const { id, index } = e.currentTarget.dataset
      const item = this.data.contestantsList[index]
      
      if (item.isPlaying) {
        // 如果视频正在播放，跳转到详情页
        wx.navigateTo({
          url: `/pages/work/work?id=${id}`
        })
      } else {
        // 停止其他正在播放的视频
        const updatedList = this.data.contestantsList.map((item, i) => ({
          ...item,
          isPlaying: i === index
        }))
        
        this.setData({
          contestantsList: updatedList
        })
      }
    },

    // 视频播放结束
    onVideoEnded(e) {
      const { index } = e.currentTarget.dataset
      const updatedList = [...this.data.contestantsList]
      updatedList[index].isPlaying = false
      
      this.setData({
        contestantsList: updatedList
      })
    },

    // 加载更多数据
    async onReachBottom() {
      // 如果正在加载或没有更多数据，直接返回
      if (this.data.loading || !this.data.hasMore) return
      
      // 调用获取列表方法
      this.getContestantsList()
    },

    onVideoError(e) {
      console.error('视频播放错误:', e.detail)
      const { index } = e.currentTarget.dataset
      console.log('出错的视频URL:', this.data.contestantsList[index].videoUrl)
    },

    onVideoLoaded(e) {
      console.log('视频加载成功:', e.detail)
    },

    // 检查参赛作品数量变化
    async checkContestantsUpdate() {
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getContestants',
          data: { onlyCount: true }
        })
        
        if (result && result.success) {
          // 不管数量是否变化，都刷新列表
          this.setData({
            contestantsCount: result.total,
            page: 1,
            hasMore: true,
            contestantsList: []
          }, () => {
            this.getContestantsList()
          })
        }
      } catch (err) {
        console.error('检查参赛作品更新失败:', err)
      }
    },
  },

  lifetimes: {
    attached() {
      // 检查登录状态
      if (!app.checkLogin()) return
      
      // 获取初始数据
      this.getStatistics()
      
      // 开始倒计时
      this.updateCountdown()
      const timer = setInterval(() => this.updateCountdown(), 1000)
      
      // 只新统计数据，不更新作品列表
      const statsTimer = setInterval(() => {
        this.getStatistics()
      }, 30000)

      this.setData({ 
        countdownTimer: timer,
        statsTimer: statsTimer
      })
      
      // 更新页面浏览量
      wx.cloud.callFunction({
        name: 'updatePageView'
      })
    },

    detached() {
      // 清除定时器
      if (this.data.countdownTimer) {
        clearInterval(this.data.countdownTimer)
      }
      if (this.data.statsTimer) {
        clearInterval(this.data.statsTimer)
      }
    }
  },

  onLoad() {
    console.log('图片路径:', '/images/banner/main-banner.jpg')
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function') {
        this.getTabBar().setData({
          selected: 0
        })
      }

      // 每次显示页面时都刷新列表
      if (app.checkLogin()) {
        this.checkContestantsUpdate()
      }
    }
  }
}) 