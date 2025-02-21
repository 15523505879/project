Component({
  data: {
    giftList: []
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function') {
        this.getTabBar().setData({
          selected: 4
        })
      }
    }
  },

  lifetimes: {
    attached() {
      this.getGiftList()
    }
  },

  methods: {
    async getGiftList() {
      try {
        const res = await wx.cloud.callFunction({
          name: 'getGiftList'
        })
        this.setData({ giftList: res.result.list })
      } catch (err) {
        console.error('获取礼物列表失败:', err)
      }
    },

    async sendGift(e) {
      const { id } = e.currentTarget.dataset
      try {
        await wx.cloud.callFunction({
          name: 'sendGift',
          data: { giftId: id }
        })
        wx.showToast({
          title: '赠送成功',
          icon: 'success'
        })
      } catch (err) {
        console.error('赠送礼物失败:', err)
        wx.showToast({
          title: '赠送失败',
          icon: 'none'
        })
      }
    }
  }
}) 