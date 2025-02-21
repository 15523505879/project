const app = getApp()

Component({
  data: {
    form: {
      name: '',
      members: '',
      contact: '',
      description: '',
      coverUrl: '',
      videoUrl: ''
    }
  },

  lifetimes: {
    attached() {
      if (!app.checkLogin()) return
    }
  },

  pageLifetimes: {
    show() {
      if (!app.checkLogin()) return
      
      // 设置底部导航栏选中状态
      if (typeof this.getTabBar === 'function') {
        this.getTabBar().setData({
          selected: 1  // 1 对应报名页面的索引
        })
      }
      
      // 确保导航栏颜色正确
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#4a6feb',
        animation: {
          duration: 0,
          timingFunc: 'linear'
        }
      })
    }
  },

  methods: {
    // 处理输入
    onInput(e) {
      const { field } = e.currentTarget.dataset
      const { value } = e.detail
      this.setData({
        [`form.${field}`]: value
      })
    },

    // 上传封面图片
    async uploadCover() {
      try {
        // 选择图片
        const { tempFilePaths } = await wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        })

        wx.showLoading({ 
          title: '上传中...',
          mask: true  // 防止重复点击
        })

        try {
          // 上传到云存储
          const { fileID } = await wx.cloud.uploadFile({
            cloudPath: `covers/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`,
            filePath: tempFilePaths[0]
          })

          // 更新表单数据
          this.setData({
            'form.coverUrl': fileID
          })

          wx.showToast({ title: '上传成功' })
        } catch (err) {
          console.error('上传封面失败:', err)
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        } finally {
          wx.hideLoading()
        }
      } catch (err) {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    },

    // 选择并上传视频
    async chooseVideo() {
      try {
        // 统一使用 60 秒限制，确保在所有环境下都能正常工作
        const res = await wx.chooseVideo({
          sourceType: ['album', 'camera'],
          maxDuration: 60,
          camera: 'back',
          compressed: true
        })

        // 检查视频时长
        if (res.duration > 60) {
          wx.showToast({
            title: '视频时长不能超过1分钟',
            icon: 'none'
          })
          return
        }

        wx.showLoading({ 
          title: '上传中...',
          mask: true
        })

        try {
          // 直接上传到云存储
          const { fileID } = await wx.cloud.uploadFile({
            cloudPath: `videos/${Date.now()}-${Math.random().toString(36).substr(2)}.mp4`,
            filePath: res.tempFilePath
          })

          // 更新表单数据
          this.setData({
            'form.videoUrl': fileID
          })

          wx.showToast({ title: '上传成功' })
        } catch (err) {
          console.error('上传视频失败:', err)
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        } finally {
          wx.hideLoading()
        }
      } catch (err) {
        console.error('选择视频失败:', err)
        wx.showToast({
          title: '选择视频失败',
          icon: 'none'
        })
      }
    },

    // 测试视频是否可以播放
    async testVideoPlayback(videoUrl) {
      return new Promise((resolve, reject) => {
        const video = wx.createVideoContext('test-video')
        const testVideo = wx.createVideo({
          src: videoUrl,
          success: () => {
            console.log('视频创建成功')
            resolve(true)
          },
          fail: (err) => {
            console.error('视频创建失败:', err)
            reject(err)
          }
        })

        // 5秒后销毁测试视频
        setTimeout(() => {
          testVideo.destroy()
        }, 5000)
      })
    },

    // 提交表单
    async onSubmit() {
      try {
        const { name, members, contact, description, coverUrl, videoUrl } = this.data.form
        
        // 表单验证
        if (!name || !members || !contact || !description || !coverUrl || !videoUrl) {
          wx.showToast({
            title: '请填写完整信息',
            icon: 'none'
          })
          return
        }

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(contact)) {
          wx.showToast({
            title: '请输入正确的手机号',
            icon: 'none'
          })
          return
        }

        wx.showLoading({ 
          title: '提交中...',
          mask: true
        })

        try {
          const { result } = await wx.cloud.callFunction({
            name: 'signup',
            data: this.data.form
          })

          if (result && result.success) {
            wx.showToast({ title: '报名成功' })
            
            // 清空表单数据
            this.setData({
              form: {
                name: '',
                members: '',
                contact: '',
                description: '',
                coverUrl: '',
                videoUrl: ''
              }
            })
            
            // 设置需要刷新的标记
            app.globalData.needRefreshIndex = true
            
            // 延迟2秒后返回首页，给数据库足够的写入时间
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/index/index'
              })
            }, 2000)
          } else {
            throw new Error(result.error)
          }
        } catch (err) {
          console.error('提交报名失败:', err)
          wx.showToast({
            title: err.message || '提交失败，请重试',
            icon: 'none'
          })
        } finally {
          wx.hideLoading()
        }
      } catch (err) {
        console.error('表单提交错误:', err)
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}) 