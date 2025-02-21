const app = getApp()

Component({
  data: {
    rankList: []
  },

  lifetimes: {
    attached() {
      if (!app.checkLogin()) return
      this.getRankList()
    }
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function') {
        this.getTabBar().setData({
          selected: 2  // 设置底部tabbar选中项
        })
      }
      
      // 设置导航栏
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#4a6feb'
      })
      
      if (!app.checkLogin()) return
      // 每次显示页面时刷新数据
      this.getRankList()
    }
  },

  methods: {
    // 获取排行榜数据
    async getRankList() {
      wx.showLoading({ title: '加载中...' })
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getContestantsList',
          data: {
            page: 1,
            pageSize: 999  // 设置一个足够大的数字以获取所有数据
          }
        })
        
        if (result && result.success) {
          // 按投票数排序
          const sortedList = result.list.sort((a, b) => {
            if (b.voteCount !== a.voteCount) {
              return b.voteCount - a.voteCount
            }
            // 票数相同时按创建时间排序
            return new Date(a.createTime) - new Date(b.createTime)
          })
          
          this.setData({
            rankList: sortedList
          })
        } else {
          throw new Error(result.error || '获取排行榜失败')
        }
      } catch (err) {
        console.error('获取排行榜失败:', err)
        wx.showToast({
          title: '获取排行榜失败',
          icon: 'none'
        })
      } finally {
        wx.hideLoading()
      }
    },

    // 点击项目跳转到详情页
    onTapItem(e) {
      const { id } = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/work/work?id=${id}`
      })
    },

    onPullDownRefresh() {
      this.getRankList().then(() => {
        wx.stopPullDownRefresh()
      })
    }
  }
}) 