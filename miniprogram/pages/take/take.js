//index.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database({
  env: "ersoncloudtest-183adf"
})

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin: false,
    isAll: false,
    wx_name: '',
    items: [{
      name: '1.',
      value: '同意开通微信自动支付'
    },
    {
      name: '2.',
      value: '同意自动获取您的地理位置'
    },
    ],
    result: '',
    up_subname: '',
    down_subname: '',
    up_down: 1,
    allCost:'',
    cost:'',
    costData:[]
  },

  checkboxChange(e) {
    var that = this;
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    console.log('长度', e.detail.value.length);
    if (e.detail.value.length == 2) {
      that.setData({
        isAll: true
      })
    }
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  addPassenger: function () {
    var that = this;
    that.setData({
      isLogin: true,
      wx_name: that.data.userInfo.nickName
    })
    db.collection('passenger').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: app.globalData.openid,
        wx_name: this.data.wx_name,
        isLogin: true,
        cost: 0,
        start_end: [{
          start: null,
          end: null
        }],
      },
      success(res) {
        console.log(res)
      },
      fail(res) {
        console.log("失败！！！");
      }
    })
  },

  getScancode: function () {
    var that = this;
    var up_down = that.data.up_down;
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
       
        var result = parseInt(res.result);
        that.setData({
          result: result,
        })
        wx.showModal({
          title: '提示',
          content: '扫码成功',
          showCancel:false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              //将扫描的二维码出来的序号信息（字符串类型）转换为数字
              var namelala = that.data.result;
              db.collection('subway').doc(namelala).get().then(res => {
                if (that.data.up_down == 1) {
                  that.setData({
                    up_subname: res.data.subname,
                    up_down: 2
                  })
                  up_down = that.data.up_down;
                }//if
                else if (that.data.up_down == 2) {
                  that.setData({
                    down_subname: res.data.subname,
                    up_down: 1
                  })
                  up_down = that.data.up_down;
                  db.collection('costData').where({
                    start:that.data.up_subname,
                    end:that.data.down_subname
                  }).get().then(res => {
                    that.setData({
                      costData:res.data
                    })
                    var cost = that.data.costData[0].cost;
                    that.setData({
                      cost:cost
                    })
                  })//成功获到数据库中数据

                }//elif
              })//读取数据库成功
            }//点击确定按钮的if
          }//success
        })
      }
    })

    
  },

  onLoad: function () {
    var that = this
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          })
        }
      })
    } //else

    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    //读取数据库中的isLogin
    db.collection('passenger').doc(app.globalData.openid)
      .get({
        success(res) {
          console.log("该用户的数据", res.data.isLogin),
            that.setData({
              isLogin: res.data.isLogin,
              allCost:res.data.cost
            })
          console.log(that.data.isLogin);
          console.log("用户的总消费",that.data.allCost);
        },
        fail(res) {
          console.log("没读取成功…")
        }
      })

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
})