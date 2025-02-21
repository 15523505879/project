const app = getApp()

Component({
  properties: {
    id: {
      type: String,
      value: '',
      observer: function(newVal) {
        if (newVal) {
          this.getContestantInfo(newVal)
          this.checkVoteStatus(newVal)
        }
      }
    }
  },

  data: {
    contestant: null,
    hasVoted: false,
    videoRatio: '16:9',
    videoContext: null
  },

  lifetimes: {
    attached() {
      if (!app.checkLogin()) return
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage && currentPage.options && currentPage.options.id) {
        const { id } = currentPage.options
        this.getContestantInfo(id)
        this.checkVoteStatus(id)
      }
    },

    detached() {
      if (this.data.videoContext) {
        this.data.videoContext.stop()
      }
    }
  },

  pageLifetimes: {
    show() {
      if (!app.checkLogin()) return
      if (this.data.contestant) {
        this.checkVoteStatus(this.data.contestant._id)
      }
    }
  },

  methods: {
    async getContestantInfo(id) {
      wx.showLoading({ title: '加载中...' })
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getContestant',
          data: { id }
        })
        
        if (result && result.success) {
          const contestant = result.data
          if (contestant.videoUrl && contestant.videoUrl.startsWith('cloud://')) {
            try {
              const { fileList } = await wx.cloud.getTempFileURL({
                fileList: [contestant.videoUrl]
              })
              if (fileList && fileList[0] && fileList[0].tempFileURL) {
                contestant.videoUrl = fileList[0].tempFileURL
              }
            } catch (err) {
              console.error('获取视频临时链接失败:', err)
              wx.showToast({
                title: '视频加载失败',
                icon: 'none'
              })
            }
          }
          
          this.setData({ contestant })
        } else {
          throw new Error(result.error || '获取作品信息失败')
        }
      } catch (err) {
        console.error('获取作品信息失败:', err)
        wx.showToast({
          title: '获取作品信息失败',
          icon: 'none'
        })
      } finally {
        wx.hideLoading()
      }
    },

    async checkVoteStatus(contestantId) {
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'checkVoteStatus',
          data: { contestantId }
        })
        
        if (result && result.success) {
          this.setData({ hasVoted: result.hasVoted })
        }
      } catch (err) {
        console.error('检查投票状态失败:', err)
      }
    },

    async onVote() {
      wx.showLoading({ title: '投票中...' })  // 显示加载提示
      
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'castVote',
          data: { contestantId: this.data.contestant._id }
        })
        
        // 先关闭加载提示
        wx.hideLoading()
        
        if (result && result.success) {
          wx.showToast({ title: '投票成功' })
          this.setData({
            hasVoted: true,
            'contestant.voteCount': (this.data.contestant.voteCount || 0) + 1
          })
          
          // 刷新相关页面数据
          const pages = getCurrentPages()
          pages.forEach(page => {
            if (page.route === 'pages/index/index') {
              // ... 更新首页列表的代码
            }
            if (page.route === 'pages/rank/rank') {
              page.getRankList()
            }
          })
        } else {
          wx.showToast({
            title: result.error || '投票失败',
            icon: 'none',
            duration: 2000
          })
        }
      } catch (err) {
        // 确保错误时也关闭加载提示
        wx.hideLoading()
        
        console.error('投票失败:', err)
        wx.showToast({
          title: err.message || '投票失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    },

    onVideoLoaded(e) {
      const { width, height } = e.detail
      const ratio = width / height
      this.setData({
        videoRatio: ratio < 1 ? '9:16' : '16:9'
      })

      this.setData({
        videoContext: wx.createVideoContext('work-video', this)
      })
    },

    onVideoError(e) {
      console.error('视频播放错误:', e)
      wx.showToast({
        title: '视频加载失败',
        icon: 'none'
      })
    },

    onVideoPlay() {
      console.log('视频开始播放')
    },

    onVideoPause() {
      console.log('视频暂停播放')
    },

    onVideoEnded() {
      console.log('视频播放结束')
      if (this.data.videoContext) {
        this.data.videoContext.seek(0)
      }
    }
  }
}) 