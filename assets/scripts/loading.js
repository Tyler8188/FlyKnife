var NetCommand = require('NetCommand')
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {       
        if (!Network.isInit) {
            Network.initNetwork();
        }
        //添加监听
        NetTarget.on(NetCommand.gameEvent.CHANNEl_CREATED, this.channelCreated, this);
        NetTarget.on(NetCommand.gameEvent.GAME_START, this.gameStart, this);
        NetTarget.on(NetCommand.gameEvent.GAME_DATA, this.gameData, this);
    },

    start () {
        
    },
    
    /**
     * 消息传送
     */
    gameData(event){
       let data = event.detail;
       let datas = data.toString().split("|");
       if(datas[0] == 'rand'){
           if (this.seed > parseInt(datas[1])) {
               RandomUtil.setSeed(parseInt(this.seed));
           } else {
               RandomUtil.setSeed(parseInt(datas[1]));
           }
       }
    },
    
    /**
     * 对战双方通道建立
     * @param {*} data 用户双方信息
     */
    channelCreated(event){
        let data = event.detail;
        UserCenter.setOwnUser(data.own);
        UserCenter.setPkUser(data.pk_user);
        this.seed = new Date().getTime();
        Network.sendGameData("rand|" + this.seed);
        Network.sendGameReady();
    },

    /**
     * 对战双方准备完毕，可以开始游戏
     */
    gameStart(data){
        cc.director.preloadScene('game', function () {
            cc.director.loadScene('game');
        });
    },

    onDestroy(){
        //取消监听
        NetTarget.off(NetCommand.gameEvent.CHANNEl_CREATED, this.channelCreated, this);
        NetTarget.off(NetCommand.gameEvent.GAME_START, this.gameStart, this);
        NetTarget.off(NetCommand.gameEvent.GAME_DATA, this.gameData, this);
    }

    // update (dt) {},
});
