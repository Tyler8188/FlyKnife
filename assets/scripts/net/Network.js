var NetCommand = require('NetCommand')

window.NetTarget = null;

window.revFrameData = new Array();
window.revFrameIndex = 0;
var  old=0;
var instance = null;
var Network = cc.Class({
    properties: {
        data: 1000,
        isInit: false,
    },

    ctor() {
        NetTarget = new cc.EventTarget();
        this.dataMsg = {
            msg: "",
            from_frame: 0,
        }
    },
    
    /**
     * 初始化
     */
    initNetwork: function (msg) {
        cc.log('Network initSocket...');
        
        DaShSDK.config({
            Debug: true,
            screenType: 0
        });
        
        /**
         * gameInit 
         * fps 大于0 启动帧同步
         * send_empty 0 空针不发  1空针发
         */
        DaShSDK.ready(()=>{
            this.isInit = true;
            DaShSDK.onSend(DaShSDK.game2Room.gameInit, { fps: 15, send_empty: 1}, null);
        });
        
        DaShSDK.onMessage((msgType, data) => {
            switch (msgType) {
                case DaShSDK.room2Game.channelCreated:
                    console.log('pk双方通信建立，游戏获得用户信息，可以开始透传消息');
                    NetTarget.emit(NetCommand.gameEvent.CHANNEl_CREATED, data);
                    break;
                case DaShSDK.room2Game.gameStart:
                    console.log('可以开始游戏')
                    NetTarget.emit(NetCommand.gameEvent.GAME_START, data);
                    break;
                case DaShSDK.room2Game.gameData:
                    console.log('收到游戏透传消息')
                    NetTarget.emit(NetCommand.gameEvent.GAME_DATA, data);
                    break;
                case DaShSDK.room2Game.gameFrameData:
                    // console.log('游戏帧同步广播消息')
                
                    revFrameIndex = data.frame_index;
                  
                    revFrameData[data.frame_index] = data;

               
                    break;
                case DaShSDK.room2Game.gameNetworkState:
                    console.log('只有当网络状态发生变化时响应')
                    break;
                case DaShSDK.room2Game.gameLeave:
                    console.log('用户离开游戏')
                    break;
                case DaShSDK.room2Game.gameReset:
                    console.log('游戏回到最初始状态，然后给大厅发送gameInit')
                    break;
                case DaShSDK.room2Game.microphoneStatus:
                    console.log('麦克风状态', data);
                    NetTarget.emit(NetCommand.gameEvent.GAME_MICROPHONESTATUS, data);
                    break;
                case DaShSDK.room2Game.musicStatus:
                    console.log('声音播放变化', data);
                    NetTarget.emit(NetCommand.gameEvent.GAME_MUSICSTATUS, data);
                    break;
            }
        })
    },

    /**
     *  游戏资源等加载完毕，向服务器发送gameReady
     *  服务器收到双方gameReady命令，下发gameStart开始游戏
     *  发送gameReady
     */
    sendGameReady: function () {
        DaShSDK.onSend(DaShSDK.game2Room.gameReady, {}, null);
    },

    /**
     * 帧同步命令发送
     */
    sendFrameData: function (data) {
        if (!this.isInit){
            cc.log('Network is not inited...');
        } else {
            this.dataMsg.msg = JSON.stringify(data);
            // console.log(this.dataMsg)
            DaShSDK.onSend(DaShSDK.game2Room.gameFrameData, this.dataMsg, null);
        };
    },

    /**
     * 数据发送
     */
    sendGameData: function (data) {
        DaShSDK.onSend(DaShSDK.game2Room.gameData, data, null);
    },
    
    /**
     * 发送游戏结果
     */
    sendGameResutl: function (type1,score1,code1) {
        DaShSDK.onSend(DaShSDK.game2Room.gameResult, {
            type: type1,
            score: score1,
            result: code1,
            other: {}
        }, null);
    },

    //分发收到的数据
    dispatchMsg: function (data) {

    },
});

var net = instance ? instance : new Network();
window.Network = net;