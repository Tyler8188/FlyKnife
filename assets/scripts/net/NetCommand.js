
var NetCommand = new Object()

NetCommand.gameEvent = {
    GAME_START: 'gameStart',
    CHANNEl_CREATED: 'channelCreated',
    GAME_FRAME_UPDATE: 'frameUpdate',  //逻辑更新
    GAME_DATA: 'gameData',
    GAME_MICROPHONESTATUS: 'microphoneStatus',
    GAME_MUSICSTATUS: 'musicStatus',
    GAME_FLYKNIFE:'game_flyknife',
    SHOOT: '1', // 发射飞刀
}

NetCommand.sendShoot = function (uid1,cmd1,rotation,preRotation) {
    Network.sendFrameData({cmd:cmd1,uid:uid1,rotation:rotation,preRotation:preRotation});
}

module.exports = NetCommand