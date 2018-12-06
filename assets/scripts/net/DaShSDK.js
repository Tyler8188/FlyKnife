var window = window || {};
; (function (window) {
	'use strict'
	function _SDK() {

		var _this = this;
		// 游戏到大厅
		_this.game2Room = {
			gameInit: 14,				//游戏初始化
			gameReady: 11,				//游戏通知服务端可以开始游戏
			gameData: 8,				//自定义消息透传
			gameFrameData: 16,			//帧同步
			gameResult: 102,				//游戏成绩上报
			gamePropUse: 106				//道具使用		
		};

		// 大厅到游戏
		_this.room2Game = {
			channelCreated: 24,		    //pk双方通信建立，游戏获得用户信息，可以开始透传消息
			gameStart: 12,				//可以开始游戏了
			gameData: 10,				//接收到来自对手的自定义消息
			gameFrameData: 17,			//接收到帧同步数据
			gameNetworkState: 100,		//网络状态
			gameLeave: 104,		        //玩家离开游戏
			gameReset: 105,				//游戏回到最初始状态，然后给大厅发送gameInit
			gamePropUseCallback: 107,	//道具使用回调
			musicStatus: 108,			//h5音效状态
			microphoneStatus: 109,		//玩家麦克风状态
		};

		// sdk初始化基本配置方法
		_this.config = _config;

		// 初始化完成方法
		_this.ready = _ready;

		// 发送消息方法
		_this.onSend = _onSend;

		// 接收消息方法
		_this.onMessage = _onMessage;

		//平台环境
		_this.platform = _platform;

		// sdk基本配置
		var _SDKconfig = {
			debug: true
		};

		var _SDKGlobal = {
			isReady: false,									//是否初始化完毕
			isGetInfo: false,								//是否获取过信息
			isGameInit: false,								//游戏是否发送gameInit
			isAppPlatform: false,							//平台环境，true,app平台内部内
			wsUrl: '',										//ws链接url
			hostUrl: '',										//接口域名
			isValidate: false,								//是否init验证成功
			sendMsgList: {},									//发送消息队列
			sendMsgSeq: 0,									//发送消息序列号
			againSendTimer: null,							//消息补发定时器
			againSendMaxSpaceTime: 60000,					//补发最大间隔时间，超过删除，单位毫秒
			getMsgList: {},									//已收到消息队列
			delGetMsgListTimer: null,						//删除收到消息队列定时器
			sendMsgConfirm: 20,								//发送确认收到透传消息ID
			getMsgConfirm: 23,								//收到服务端消息确认ID
			loginValidate: 15,								//登陆验证
			loginData: {										//渠道登陆验证所需信息
				game_id: '',
				pk_id: '',
				token: '',
				fps: 0,
				send_empty: 0
			},
			userinfo: {},									//用户信息	
			isGamePropUse: false,							//是否发起道具使用
			currNetworkStatus: 'offline',					//当前网络状态
			networkBeatTimer: null,							//发送心跳时间戳
			networkStatusTimer: null,						//网络状态时间戳
			getCurrUserNetworkTime: new Date().getTime(),	//获取当前玩家网络离线时间戳
			getPkUserNetWorkTime: new Date().getTime(),		//获取对手玩家网络时间戳
			maxSpacetime: 20000,								//最大间隔时间，判对手离线，单位毫秒
			isInit: false,									//是否发起gameInit
			isChannelCreated: false,							//是否创建过渠道
			isStart: false,									//是否发起gameStart
			againConnectTime: null,							//重连定时器
			isAgainConnect: false,						    //ws是否重连				
			isGameResult: false,								//是否已提交游戏结果
			historyRecordData: {								//历史战绩
				won: 0,										//赢的次数
				lost: 0,										//输的次数
				total: 0,									//
				add_bonus: 0,								//获得金币
				add_experience: 0,							//获得经验
				consecutive_wins: 0,							//当场获胜的话连胜次数
				win_text: '',								//连胜文案
				is_first: 0,									//是否首次连胜，0：否，1：是
				fee: 0										//乱斗入场费						
			},
			gameResultData: {								//游戏结果上报数据
				type: 1,										//1正常结果上报，2主动退出游戏结果上报
				score: 0,									//分数
				result: 0,									//输赢：1获胜，2失败，3平局
				other: {},									//游戏上报的其他数据
				game_id: '',
				pk_id: ''
			},
			musicStatusData: {
				status: 1
			}
		}

		var testTime = new Date().getTime();

		_SDKlog('执行js时间戳:' + testTime)

		_SDKInit();

		// sdk初始化基本配置
		function _config(options) {
			if (options && Object.prototype.toString.call(options) === '[object Object]') {
				for (var key in options) {
					_SDKconfig[key] = options[key]
				}
			} else {
				_SDKlog('config传入参数错误！');
			}
		};

		// sdk初始化
		function _SDKInit() {

			// 客户端内
			_appInit();

			// 机器人模式
			_getRequest().robot == 'true' && _robotInit();

			// 浏览器调式
			(_getRequest().user && _SDKconfig.debug) ? _browserDebugInit() : (_SDKGlobal.isAppPlatform = true);
		};

		function _appInit() {
			connectWebViewJavascriptBridge(function (bridge) {
				_SDKGlobal.isAppPlatform = true;

				if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1) {
					bridge.init(function (message, responseCallback) {
						responseCallback({ 'Javascript Responds': 'Wee!' });
					});
				}
				// 从客户端获取用户信息和登陆信息
				bridge.registerHandler('mkSdkUserInfo', function (baseInfo, responseCallback) {
					baseInfo = (typeof baseInfo === "object") ? baseInfo : JSON.parse(baseInfo);
					_SDKlog('获取到用户信息所需时间:' + (new Date().getTime() - testTime), baseInfo);
					if (_SDKGlobal.isGetInfo) return;
					_SDKGlobal.isGetInfo = true;
					responseCallback('success');
					baseInfo.is_mall = baseInfo.is_mall || 1;
					_dataInit(baseInfo)
				})

				// 关闭/开启h5音效
				bridge.registerHandler('mkSDKMusicSwitch', function (res, responseCallback) {
					res = (typeof res === "object") ? res : JSON.parse(res);
					console.log('h5音效状态', res)
					responseCallback('mkSDKMusicSwitch success');
					_SDKGlobal.musicStatusData = res
					_this.msgCallBack && _this.msgCallBack(_this.room2Game.musicStatus, res);
				})

				// 玩家麦克风状态
				bridge.registerHandler('mkSDKMicrophoneSwitch', function (res, responseCallback) {
					res = (typeof res === "object") ? res : JSON.parse(res);
					console.log('玩家麦克风状态', res)
					responseCallback('mkSDKMicrophoneSwitch success');
					_this.msgCallBack && _this.msgCallBack && _this.msgCallBack(_this.room2Game.microphoneStatus, res);
				})
			});
		};

		function _robotInit() {
			var baseInfo = {
				game_id: 0,
				room_id: 0,
				pk_id: 0,
				fight_id: 0,
				game_token: null,
				trans_addr: null,
				position: 1,
				own: {
					uid: 1000001,
					nick: "大圣用户1",
					photo_url: "https://img.dasheng.tv/img/740a1cfbdb1d209f1d6029149e208abb89504e470d0a1a0a0000000d49484452.png",
					level: 1,
					sex: 2,
				},
				pk_user: {
					uid: 1000002,
					nick: '大圣用户2',
					photo_url: 'https://img.dasheng.tv/img/740a1cfbdb1d209f1d6029149e208abb89504e470d0a1a0a0000000d49484452.png',
					level: 0,
					sex: 0,
				}
			}
			for (var key in _getRequest()) {
				if (key in baseInfo) {
					baseInfo[key] = _getRequest()[key]
				}
			}
			_getRequest().uid && (baseInfo.own.uid = _getRequest().uid);
			_getRequest().pk_uid && (baseInfo.pk_user.uid = _getRequest().pk_uid);

			_dataInit(baseInfo);
		};

		function _browserDebugInit() {
			_loadJs('https://ttt.web.dasheng.tv/v1.0.0/js/debug.js', function () {
				_debugUserInfo(function (baseInfo) {
					if (_getRequest().game_id) {
						baseInfo.own.uid = 10000892;
						baseInfo.is_mall = 1;
						baseInfo.game_id = _getRequest().game_id;
					}
					_dataInit(baseInfo)
				})
			})
		};

		function _dataInit(baseInfo) {
			_SDKGlobal.gameResultData.game_id = baseInfo.game_id;
			_SDKGlobal.gameResultData.pk_id = baseInfo.pk_id;
			_SDKGlobal.wsUrl = baseInfo.trans_addr;
			_SDKGlobal.hostUrl = baseInfo.hostUrl;

			// 登陆验证所需数据
			_SDKGlobal.loginData.game_id = baseInfo.game_id;
			_SDKGlobal.loginData.pk_id = baseInfo.pk_id;
			_SDKGlobal.loginData.token = baseInfo.game_token;

			// 获取用户当前比赛成绩
			// 获取用户信息
			_getUserInfo(baseInfo);

			!_getRequest().robot && _getGameResultData(baseInfo);

			if (_this.readyCallback) {
				_this.readyCallback();
			} else {
				_SDKGlobal.isReady = true;
			}

			// 游戏发送gameInit时，SDK未初始化完毕，再补发
			if (_SDKGlobal.isGameInit) {
				_this.onSend(_this.game2Room.gameInit, _SDKGlobal.loginData);
			}
		};

		// 获取用户比赛成绩记录和赢该获得金币经验
		function _getGameResultData(baseInfo) {
			_ajax({
				url: baseInfo.hostUrl + 'v1/pk/info',
				data: {
					fight_id: baseInfo.fight_id,
					pk_uid: baseInfo.pk_user.uid,
					pk_id: baseInfo.pk_id
				},
				headers: {
					'Game-Token': baseInfo.game_token
				},
				success: function (res) {
					if (res.code == 0) {
						for (var k in res.data) {
							_SDKGlobal.historyRecordData[k] = res.data[k]
						}
						_sdk2roomHistoryRecord()
					}
				}
			})
		};

		// 获取用户信息
		function _getUserInfo(baseInfo) {
			_SDKGlobal.userinfo.own = baseInfo.own;
			_SDKGlobal.userinfo.pk_user = baseInfo.pk_user;
			_SDKGlobal.userinfo.propList = [];
			if (baseInfo.position == 1) {
				_SDKGlobal.userinfo.own.seat = 1;
				_SDKGlobal.userinfo.pk_user.seat = 2;
			} else if (baseInfo.position == 2) {
				_SDKGlobal.userinfo.own.seat = 2;
				_SDKGlobal.userinfo.pk_user.seat = 1;
			}
			// 获取用户道具
			if (_getRequest().robot) return;
			_ajax({
				method: 'GET',
				url: _SDKGlobal.hostUrl + 'v1/game-prop-sdk/my',
				data: { uid: baseInfo.own.uid, game_id: baseInfo.game_id },
				async: false,
				success: function (res) {
					if (res.code == 0) {
						_SDKGlobal.userinfo.propList = res.data;
					}
				}
			})
		};

		// 初始化完成
		function _ready(cb) {
			cb && typeof cb === 'function' && (_SDK.prototype.readyCallback = cb);
			if (_SDKGlobal.isReady) {
				_this.readyCallback && _this.readyCallback();
			}
		};

		// 游戏到大厅（发送消息）
		function _onSend(msgType, params, cb) {
			// 验证msgType
			if (msgType !== 20) {
				var isValidate = false;
				for (var key in _this.game2Room) {
					if (typeof msgType === 'number' && msgType === _this.game2Room[key]) {
						isValidate = true;
						break;
					}
				}
				if (!isValidate) return console.error('发送消息类型不正确~');
			};

			// 登录验证
			if (msgType === _this.game2Room.gameInit) {
				if (_SDKGlobal.currNetworkStatus == 'online') {
					return
				}
				for (var key in params) {
					if (key === 'fps') {
						_SDKGlobal.loginData.fps = params.fps;
					}
					if (key === 'send_empty') {
						_SDKGlobal.loginData.send_empty = params.send_empty;
					}
				}
				params = _SDKGlobal.loginData;
				if (!_SDKGlobal.isAgainConnect) {
					_SDKlog('游戏发送init耗时:' + (new Date().getTime() - testTime) + ' ' + params.fps);
				} else {
					_SDKlog('发起ws重连：' + (new Date().getTime() - testTime))
				}
				// SDK初始化未完成
				if (!_SDKGlobal.wsUrl) {
					_SDKGlobal.isGameInit = true;
					_SDKlog('游戏发送gameInit时，SDK初始化未完成~');
					return
				}
				_connect(_SDKGlobal.wsUrl, function () {
					_SDKGlobal.isAgainConnect = false;
					_SDKlog('建立ws耗时:' + (new Date().getTime() - testTime));
					var obj = {
						msg_id: msgType,
						msg_data: params
					}
					_this._ws.readyState == 1 && _this._ws.send(JSON.stringify(obj));
				})
				return
			};

			if (msgType === _this.game2Room.gameReady) {
				_SDKlog('游戏发送开始耗时:' + (new Date().getTime() - testTime) + ' ' + msgType + ' ' + params)
			}
			// 发送消息透传处理
			if (msgType === _this.game2Room.gameData) {
				params = {
					time: new Date().getTime(),
					seq_c: _SDKGlobal.sendMsgSeq,
					msg: params
				}
				_SDKGlobal.sendMsgSeq++;
			}

			var o = {
				msg_id: msgType,
				msg_data: params
			};

			if (msgType === _this.game2Room.gameReady && !!_getRequest().user) {
				var musicStatus = 1
				setInterval(function () {
					musicStatus == 1 ? (musicStatus = 0) : (musicStatus = 1);
					_this.msgCallBack && _this.msgCallBack(_this.room2Game.musicStatus, { status: musicStatus });
					_this.msgCallBack && _this.msgCallBack(_this.room2Game.microphoneStatus, { status: musicStatus, isSelf: 1 });
				}, 10000)
			}

			// 游戏上报，直接发给客户端
			if (msgType === _this.game2Room.gameResult) {
				if (_SDKGlobal.isGameResult) {
					return
				}
				for (var k in o.msg_data) {
					_SDKGlobal.gameResultData[k] = o.msg_data[k];
				}
				if (_SDKGlobal.gameResultData.score == null || isNaN(_SDKGlobal.gameResultData.score)) {
					_SDKGlobal.gameResultData.score = 0;
				}

				_SDKlog(msgType, _SDKGlobal.gameResultData);
				return cb && typeof cb === 'function' ? _gameResult(_SDKGlobal.gameResultData, cb) : _gameResult(_SDKGlobal.gameResultData)
			};

			// 道具使用
			if (msgType === _this.game2Room.gamePropUse) {
				if (!_SDKGlobal.hostUrl) {
					_SDKGlobal.isGamePropUse = true;
					_SDKlog('使用道具时，SDK初始化未完成~');
					return
				}
				_ajax({
					method: 'POST',
					url: _SDKGlobal.hostUrl + 'v1/game-prop-sdk/use',
					data: { uid: _SDKGlobal.userinfo.own.uid, prop_id: params.prop_id },
					success: function (res) {
						_this.msgCallBack && _this.msgCallBack(_this.room2Game.gamePropUseCallback, res);
					}
				})
				return
			}

			if (!_this._ws) {
				return void console.error('尚未建立WebSocket通信！');
			};

			if (msgType === _this.game2Room.gameData && params.msg._networkState !== 'online') {
				_SDKlog('发送消息：' + ' ' + msgType + ' ' + params);
			};

			_this._ws.readyState == 1 && _this._ws.send(JSON.stringify(o));

			cb && typeof cb === 'function' && cb();

			// 消息补发,屏蔽心跳补发
			if (msgType === _this.game2Room.gameData && !o.msg_data.msg.hasOwnProperty('_networkState')) {
				_SDKGlobal.sendMsgList[o.msg_data.seq_c] = o;
				if (!_SDKGlobal.againSendTimer) {
					_SDKGlobal.againSendTimer = setInterval(function () {
						var sendMsgList = _deepCopy(_SDKGlobal.sendMsgList);
						for (var key in sendMsgList) {
							if (new Date().getTime() - sendMsgList[key].msg_data.time > _SDKGlobal.againSendMaxSpaceTime) {
								delete _SDKGlobal.sendMsgList[key];
							} else {
								_SDKlog('消息补发序列号：', sendMsgList[key].msg_data);
								_SDKGlobal.isValidate && _this._ws.send(JSON.stringify(sendMsgList[key]));
							}
						}
					}, 3000)
				}
			}
		};

		// 大厅到游戏（接收消息）
		function _onMessage(cb) {
			cb && typeof cb === 'function' && (_SDK.prototype.msgCallBack = cb);
		};

		// ws创建方法
		function _connect(url, cb) {
			if (!window.WebSocket) {
				return void console.error('Your browser does not support WebSocket!');
			}
			_SDK.prototype._ws && (_SDK.prototype._ws.close(), _SDK.prototype._ws = null);
			_SDK.prototype._ws = new WebSocket(url);

			_this._ws.onopen = function () {
				_SDKlog('WebSocket onopen-------------');

				_SDKGlobal.currNetworkStatus = 'online';
				cb && typeof cb === 'function' && cb();
			};

			_this._ws.onmessage = function (evt) {
				//_SDKlog('原始信息',evt.data)
				var jsonData = JSON.parse(evt.data), msgType = jsonData.msg_id, data = jsonData.msg_data;
				// 登陆验证成功
				if (msgType === _SDKGlobal.loginValidate) {
					if (data.code != 0) {
						_SDKlog('渠道gameInit验证失败~')
					} else {
						_SDKGlobal.isValidate = true;
						_SDKlog('验证成功:' + (new Date().getTime() - testTime))
					}
					return
				}

				// 双方可以通信
				if (msgType === _this.room2Game.channelCreated) {

					if (_SDKGlobal.isChannelCreated) return;
					_SDKGlobal.isChannelCreated = true;

					_this.onSend(_SDKGlobal.sendMsgConfirm, { seq: data.seq });
					_SDKlog('可以通信耗时：' + (new Date().getTime() - testTime) + ' ' + { seq: data.seq });
					data = _SDKGlobal.userinfo;
					console.log(data)
				}

				if (msgType === _this.room2Game.gameStart) {
					// 服务端通知开始,如果收到通知，不在通知
					if (_SDKGlobal.isStart) return;

					_SDKGlobal.isStart = true;

					_SDKlog('收到服务器通知开始耗时：' + ' ' + msgType, (new Date().getTime() - testTime))
					_SDKGlobal.getPkUserNetWorkTime = new Date().getTime();

					// 通知客户端关闭loading
					_sdk2roomGameReady();

					// 获取网络状态
					_getNetWorkState();
				}

				// 消息透传处理
				if (msgType === _this.room2Game.gameData) {
					// 回复服务端收到此消息
					_this.onSend(_SDKGlobal.sendMsgConfirm, { seq: data.seq });
					if (_SDKGlobal.getMsgList.hasOwnProperty(data.seq_c)) {
						return
					}
					if (!data.msg.hasOwnProperty('_networkState')) {
						_SDKGlobal.getMsgList[data.seq_c] = { time: new Date().getTime() };
					}

					//定时删除收到消息队列
					if (!_SDKGlobal.delGetMsgListTimer) {
						_SDKGlobal.delGetMsgListTimer = setInterval(function () {
							var delMsgList = _deepCopy(_SDKGlobal.getMsgList);
							for (var k in delMsgList) {
								// 删除30秒前的消息
								if (new Date().getTime() - delMsgList[k].time > 30000) {
									delete _SDKGlobal.getMsgList[k];
								}
							}
						}, 5000);
					}

					data = data.msg;
				}

				// 收到服务端信息确认，从补发消息队列删除
				if (msgType === _SDKGlobal.getMsgConfirm) {
					if (_SDKGlobal.sendMsgList.hasOwnProperty(data.seq_c)) {
						delete _SDKGlobal.sendMsgList[data.seq_c];
					}
					return
				}

				// 离开游戏
				if (msgType === _this.room2Game.gameData && data._gameLeave && data._gameLeave === 'leave') {
					msgType = _this.room2Game.gameLeave;
					data = { isSelf: 2 };
				}

				// 对手网络状态
				if (msgType === _this.room2Game.gameData && data._networkState && data._networkState === 'online') {
					_SDKGlobal.getPkUserNetWorkTime = new Date().getTime();
					return
				}

				_this.msgCallBack && _this.msgCallBack(msgType, data);
				if (msgType === _this.room2Game.channelCreated) {
					_this.msgCallBack && _this.msgCallBack(_this.room2Game.musicStatus, _SDKGlobal.musicStatusData);
				}
			};

			_this._ws.onerror = function () {
				_SDKlog('WebSocket onerror-------------');
				_SDKGlobal.isValidate = false;
				if (_SDKGlobal.currNetworkStatus == 'online') {
					_SDKGlobal.getCurrUserNetworkTime = new Date().getTime();
				}
				_SDKGlobal.isAgainConnect = true;
				_SDKGlobal.currNetworkStatus = 'offline';
				_againConnect();
			};

			_this._ws.onclose = function () {
				_SDKlog('WebSocket onclose-------------');
				_SDKGlobal.isValidate = false;
				if (_SDKGlobal.currNetworkStatus == 'online') {
					_SDKGlobal.getCurrUserNetworkTime = new Date().getTime();
				}
				_SDKGlobal.isAgainConnect = true;
				_SDKGlobal.currNetworkStatus = 'offline';
				_againConnect();
			};
		};

		// ws离线重连
		function _againConnect() {
			if (!_SDKGlobal.againConnectTime && _SDKGlobal.isAgainConnect) {
				_SDKGlobal.againConnectTime = setTimeout(function () {
					_SDKGlobal.againConnectTime = null;
					_this.onSend(_this.game2Room.gameInit, { fps: _SDKGlobal.loginData.fps });
				}, 3000)
			}
		};

		// Jsbridge初始化
		function connectWebViewJavascriptBridge(callback) {
			if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1) {
				if (window.WebViewJavascriptBridge) {
					callback(WebViewJavascriptBridge);
				} else {
					document.addEventListener('WebViewJavascriptBridgeReady', function () {
						callback(WebViewJavascriptBridge);
					}, false);
				}
			} else {
				if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
				if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
				window.WVJBCallbacks = [callback];
				var WVJBIframe = document.createElement('iframe');
				WVJBIframe.style.display = 'none';
				WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
				document.documentElement.appendChild(WVJBIframe);
				setTimeout(function () {
					document.documentElement.removeChild(WVJBIframe);
				}, 0);
			}
		};

		// 获取网络状态
		function _getNetWorkState() {
			// 发送心跳
			if (_SDKGlobal.networkBeatTimer != null) {
				return
			}
			_SDKGlobal.networkBeatTimer = setInterval(function () {
				if (_SDKGlobal.currNetworkStatus == 'online') {
					_this.onSend(_this.game2Room.gameData, { _networkState: 'online' })
				}
			}, 5000);

			// 通知游戏双方网络状况
			/*_SDKGlobal.networkStatusTimer = setInterval(function(){

				if( _SDKGlobal.currNetworkStatus == 'offline' && 
		        	(new Date().getTime()-_SDKGlobal.getCurrUserNetworkTime) > _SDKGlobal.maxSpacetime
		        ){
		        	_this.msgCallBack(_this.room2Game.gameNetworkState,{isSelf:1,status:'offline'});
		        	clearInterval(_SDKGlobal.networkStatusTimer)
		        }

				if( _SDKGlobal.currNetworkStatus == 'online' && 
					(new Date().getTime()-_SDKGlobal.getPkUserNetWorkTime) > _SDKGlobal.maxSpacetime
				){
	        		_this.msgCallBack(_this.room2Game.gameNetworkState,{isSelf:2,status:'offline'});
	        		clearInterval(_SDKGlobal.networkStatusTimer)
		        }

	        },1000);*/
		};

		// 游戏结果上报
		function _gameResult(obj, cb) {
			var cb = cb || function () { };
			_SDKGlobal.isGameResult = true;
			if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1) {
				window.androidObj && window.androidObj.mkSdkGameResult && window.androidObj.mkSdkGameResult(JSON.stringify(obj))
				return
			}
			connectWebViewJavascriptBridge(function (bridge) {
				bridge.callHandler('mkSdkGameResult', obj, cb);
			});
		};

		// 通知客户端可以开始了,关闭loading
		function _sdk2roomGameReady() {
			if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1) {
				_SDKlog('通知客户端关闭loading:' + (new Date().getTime() - testTime))
				window.androidObj && window.androidObj.mkSdkReady && window.androidObj.mkSdkReady(JSON.stringify(_SDKGlobal.historyRecordData))
				return
			}
			connectWebViewJavascriptBridge(function (bridge) {
				_SDKlog('通知客户端关闭loading:' + (new Date().getTime() - testTime))
				bridge.callHandler('mkSdkReady', _SDKGlobal.historyRecordData, function (response) { });
			});
		};

		// 历史战绩,避免异步
		function _sdk2roomHistoryRecord() {
			if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1) {
				window.androidObj && window.androidObj.mkSdkHistoryRecord && window.androidObj.mkSdkHistoryRecord(JSON.stringify(_SDKGlobal.historyRecordData))
				return
			}
			connectWebViewJavascriptBridge(function (bridge) {
				bridge.callHandler('mkSdkHistoryRecord', _SDKGlobal.historyRecordData, function (response) { });
			});
		};

		// 客户端离开游戏被调用
		connectWebViewJavascriptBridge(function (bridge) {
			bridge.registerHandler('mkSdkGameLeave', function (data, responseCallback) {
				_SDKGlobal.isGameResult = true;
				_this.msgCallBack && _this.msgCallBack(_this.room2Game.gameLeave, {
					isSelf: 1
				})
				_this.onSend(_this.game2Room.gameData, {
					_gameLeave: 'leave'
				})
				var resultData = _SDKGlobal.gameResultData;
				resultData.type = 2;
				resultData.result = 2;
				responseCallback(resultData);
			})
		});

		//平台环境
		function _platform() {
			return _SDKGlobal.isAppPlatform
		};

		// ajxa封装
		function _ajax(opt) {
			opt = opt || {};
			opt.method = (opt.method && opt.method.toUpperCase()) || 'GET';
			opt.url = opt.url || '';
			opt.async = opt.async || true;
			opt.data = opt.data || null;
			opt.headers = opt.headers || {};
			opt.success = opt.success || function () { };

			var xmlHttp = null;
			if (XMLHttpRequest) {
				xmlHttp = new XMLHttpRequest();
			}
			else {
				xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
			}
			var params = [];
			for (var key in opt.data) {
				params.push(key + '=' + opt.data[key]);
			}

			var postData = params.join('&');
			if (opt.method.toUpperCase() === 'POST') {
				xmlHttp.open(opt.method, opt.url, opt.async);
				xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
				for (var key in opt.headers) {
					xmlHttp.setRequestHeader(key, opt.headers[key]);
				}
				xmlHttp.send(postData);
			}
			else if (opt.method.toUpperCase() === 'GET') {
				xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
				for (var key in opt.headers) {
					xmlHttp.setRequestHeader(key, opt.headers[key]);
				}
				xmlHttp.send(null);
			}
			xmlHttp.onreadystatechange = function () {
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
					opt.success(JSON.parse(xmlHttp.responseText));
				}
			};
		};

		// 动态加载js方法
		function _loadJs(url, callback) {
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;
			if (typeof (callback) == 'function') {
				script.onload = script.onreadystatechange = function () {
					if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
						callback();
						script.onload = script.onreadystatechange = null;
					}
				};
			}
			head.insertBefore(script, head.childNodes[0]);
		};

		// 获取路由参数
		function _getRequest() {
			var url = location.search;
			var theRequest = new Object();
			if (url.indexOf("?") != -1) {
				var str = url.substr(1), strs = str.split("&");
				for (var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
				}
			}
			return theRequest;
		};
		

		// 对象深拷贝
		function _deepCopy(p, c) {
			var c = c || {};
			for (var i in p) {
				if (typeof p[i] === 'object') {
					c[i] = (p[i].constructor === Array) ? [] : {};
					_deepCopy(p[i], c[i]);
				} else {
					c[i] = p[i];
				}
			}
			return c;
		};

		function _SDKlog() {
			if (!_SDKconfig.debug) return;
			for (var i = 0; i < arguments.length; i++) {
				console.log(arguments[i])
			}
		}
	};

	window.DaShSDK = new _SDK();
})(window)  
