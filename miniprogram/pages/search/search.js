var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'K3GBZ-PFA3G-XUSQ2-IHZB5-OQUHV-2VFHI'
}); //实体化api核心类

Page({
  data: {
    keyword: '',
    searchData: [], //“模糊搜索”出来的地址
    startLat: '', //默认是本地
    startLng: '',
    endLat: '',
    endLng: '',
    startAddress: '',
    endAddress: '',
    markers: [],
    showFrom: true,
    showTo: true,
    openNav: true,
    searchBus: false,
    latitude: '',
    longitude: '',
  },

  onLoad: function() {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        console.log("成功获取当前位置：", res.latitude, "##", res.longitude);
        that.setData({
          startLng: res.longitude,
          startLat: res.latitude
        })
      },
    })
  },

  getStart: function(e) {
    if (e.detail.value != '') {
      var that = this;
      that.setData({
        keyword: e.detail.value,
        searchBus: false,
        showFrom: false,
      })
      console.log("keyword", that.data.keyword);
      qqmapsdk.search({
        keyword: that.data.keyword,
        page_size: 20,
        region: location,
        success: function(res) {
          that.setData({
            searchData: res.data,
          })
          console.log("成功", that.data.searchData);
        },
        fail: function(res) {
          console.log("查询失败", res);
          that.setData({
            searchData: '',
          })
        },
      })
    }
  },

  getEnd: function(e) {
    if (e.detail.value != '') {
      var that = this;
      that.setData({
        keyword: e.detail.value,
        showTo: false,
        searchBus: false,
      })
      console.log("keyword", that.data.keyword);
      qqmapsdk.search({
        keyword: that.data.keyword,
        page_size: 20,
        region: location,
        success: function(res) {
          that.setData({
            searchData: res.data
          })
          console.log("成功", that.data.searchData);
        },
        fail: function(res) {
          console.log("查询失败", res);
          that.setData({
            searchData: '',
          })
        },
      })
    }
  },

  fromWhere: function(e) {
    var that = this;
    var index = e.currentTarget.id;
    var item = this.data.searchData[index];
    console.log("地址：", item.address)
    var startLat = item.location.lat;
    var startLng = item.location.lng;
    that.setData({
      startLat: startLat,
      startLng: startLng,
      showFrom: true,
      startAddress: item.title + "(" + item.address + ")"
    })
    console.log("起点位置", startLat, startLng);
  },

  toWhere: function(e) {
    var that = this;
    var index = e.currentTarget.id;
    var item = this.data.searchData[index];
    var endLat = item.location.lat;
    var endLng = item.location.lng;
    that.setData({
      endLat: endLat,
      endLng: endLng,
      showTo: true,
      openNav: false,
      endAddress: item.title + "(" + item.address + ")"
    })
    console.log("终点位置", endLat, endLng);
  },

  searchRoad: function() {
    let _page = this;
    // 起点经纬度
    let latStart = _page.data.startLat;
    let lngStart = _page.data.startLng;
    // 终点经纬度
    let latEnd = _page.data.endLat;
    let lngEnd = _page.data.endLng;

    _page.setData({
      searchBus: true,
      latitude: latStart,
      longitude: lngStart,
      markers: [{
          id: 0,
          latitude: latStart,
          longitude: lngStart,
          width: 30,
          height: 30,
          iconPath: '/images/location.png'
        },
        {
          id: 1,
          latitude: latEnd,
          longitude: lngEnd,
          width: 30,
          height: 30,
          iconPath: '/images/location.png'
        },
      ]
    });

    //网络请求设置
    let opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: `https://apis.map.qq.com/ws/direction/v1/transit/?from=${latStart},${lngStart}&to=${latEnd},${lngEnd}&policy=LEAST_TIME&output=jsonp&callback=callback_function&key=${qqmapsdk.key}`,
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success: function(res) {
        let ret = res.data;
        console.log("返回来的路线规划的数据", res.data.result);
      }
    };
    wx.request(opt);
  },

  onShow: function() {}

})