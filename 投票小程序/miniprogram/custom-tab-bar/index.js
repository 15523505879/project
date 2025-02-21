Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/images/tabbar/home.png",
        selectedIconPath: "/images/tabbar/home_selected.png"
      },
      {
        pagePath: "/pages/signup/signup",
        text: "报名",
        iconPath: "/images/tabbar/signup.png",
        selectedIconPath: "/images/tabbar/signup_selected.png"
      },
      {
        pagePath: "/pages/rank/rank",
        text: "排行",
        iconPath: "/images/tabbar/rank.png",
        selectedIconPath: "/images/tabbar/rank_selected.png"
      },
      {
        pagePath: "/pages/detail/detail",
        text: "详情",
        iconPath: "/images/tabbar/detail.png",
        selectedIconPath: "/images/tabbar/detail_selected.png"
      },
      {
        pagePath: "/pages/gift/gift",
        text: "礼物",
        iconPath: "/images/tabbar/gift.png",
        selectedIconPath: "/images/tabbar/gift_selected.png"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = this.data.list[data.index].pagePath
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  }
}) 