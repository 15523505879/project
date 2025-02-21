<template>
  <view>
    <view class="content">
    </view>
    <view class="uni-list">
      <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(item, index) in news" :key="item.post_id" @tap="openinfo" :data-newsid="item.post_id">
        <view class="uni-media-list">
          <image class="uni-media-list-logo" :src="item.author_avatar"></image>
          <view class="uni-media-list-body">
            <view class="uni-media-list-text-top">{{ item.title }}</view>
            <view class="uni-media-list-text-bottom uni-ellipsis">{{ item.created_at }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      news: []
    };
  },
  onLoad: function() {
    uni.showLoading({
      title: "加载中..."
    });
    uni.request({
      url: 'https://unidemo.dcloud.net.cn/api/news',
      method: 'GET',
      data: {},
      success: res => {
        this.news = res.data;
        uni.hideLoading();
      },
      fail: () => {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
        uni.hideLoading();
      },
      complete: () => {}
    });
  },
  methods: {
    openinfo(e) {
      const newsid = e.currentTarget.dataset.newsid;
      uni.navigateTo({
        url: '../info/info?newsid=' + newsid
      });
    }
  }
};
</script>

<style>
.uni-media-list {
  display: flex;
  align-items: center;
}

.uni-media-list-logo {
  width: 50px; /* 设置一个固定的宽度 */
  height: 50px; /* 设置一个固定的高度 */
  margin-right: 10px; /* 添加一些右边距 */
}

.uni-media-list-body {
  flex: 1;
}

.uni-media-list-text-top {
  font-size: 16px;
  font-weight: bold;
}

.uni-media-list-text-bottom {
  font-size: 12px;
  color: #999;
}
</style>