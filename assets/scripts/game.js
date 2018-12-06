/**
 * 游戏入口
 */

var Constants = require('Constants');
var NetCommand = require('NetCommand');


var DiskType = cc.Enum({
    None: 0,
    SmallDisk: 1,
    BigDisk: 2,
});

cc.Class({
    extends: cc.Component,

    properties: {

        nodePool:
        {
            type:cc.Node,
            default:null,
        },

        knifePrefab: {
            type: cc.Prefab,
            default: null,
        },

        fallKnifePrefab: {
            type: cc.Prefab,
            default: null,
        },

        knifeRoot: {
            type: cc.Node,
            default: null,
        },

        fallKnifeRoot: {
            type: cc.Node,
            default: null,
        },

        disk: {
            type: cc.Node,
            default: null,
        },

        diskBigFrame:[cc.SpriteFrame],
        diskSmallFrame:[cc.SpriteFrame],

        maxKnife: 12,

        knifeMoveSpeed: 1500,

        newKnifeNodesArr:[],//存放碰撞到盘子上的刀
    },


    // onLoad () {},

    start () {
        this.nodePool.getComponent("nodePool").initPool();
        this.knifeCount = 0;
        this.initKnifeNode();

        NetTarget.on(NetCommand.gameEvent.GAME_MICROPHONESTATUS, this.microphoneStatusChange, this);
        NetTarget.on(NetCommand.gameEvent.GAME_DATA, this.updateOtherGameData, this);
    },

    /**
     * 麦克风变化
     * {
        status:0/1,  //0-关闭 1-开启
        isSelf:0/1   //0-对手 1-自己
        }
     */
    microphoneStatusChange(event) {
        
        let data = event.detail;
        console.log("aaaaaaaaa:", data.status);
        // if(data){
        //     let headItem0 = this.headItem0.getComponent('HeadItem');
        //     let headItem1 = this.headItem1.getComponent('HeadItem');
        //     headItem1.microphoneStatusChange(0);
        //     if(data.isSelf == 1){
        //         headItem0.microphoneStatusChange(data.status);
        //     } else {
        //         headItem1.microphoneStatusChange(data.status);
        //     }
        // }
    },

    updateOtherGameData(event)
    {
        this.otherScore = event.detail;
        console.log("updateOtherGameData:", this.otherScore);
    },

    initKnifeNode()
    {
        if (this.disk.getComponent("disk").diskOfType == DiskType.SmallDisk)
        {
            this.maxKnife = 8;
        }
        else if (this.disk.getComponent("disk").diskOfType == DiskType.BigDisk)
        {
            this.maxKnife = 10;
        }

        if (this.knifeCount >= this.maxKnife)
        {
            this.newKnifeNodes();
            this.knifeCount = 0;
            this.diskShow(false);
            return;
        }
        this.bornNewKnife();
    },

    diskShow(isShow, diskSkin, diskType)
    {   
        this.disk.active = isShow;
        if (diskType == DiskType.BigDisk)
        {
            this.disk.getComponent(cc.Sprite).spriteFrame = this.diskBigFrame[diskSkin];
        }
        else
        {
            this.disk.getComponent(cc.Sprite).spriteFrame = this.diskSmallFrame[diskSkin];
        }
    },
    
    

    knifeNodePool()
    {
        let knife = this.nodePool.getComponent("nodePool").alloc_node();
        this.knifeRoot.addChild(knife);
        knife.setPosition(0, -400);
        knife.getComponent("knife").setDisk(this, this.disk, this.knifeMoveSpeed);
    },

    bornNewKnife()
    {
        this.knifeNodePool();
        // var knife = cc.instantiate(this.knifePrefab);
        // this.knifeRoot.addChild(knife);
        // knife.setPosition(0, -400);
        // knife.getComponent("knife").setDisk(this, this.disk, this.knifeMoveSpeed);
    },

    /**
     * 生成新刀，然后实现爆炸
     */
    newKnifeNodes()
    {
        for(var i = 0; i < this.knifeRoot.childrenCount; i ++) {
            var knife = this.knifeRoot.children[i];
            knife.active = false;

            var fallKnife = cc.instantiate(this.fallKnifePrefab);
            fallKnife.rotation = knife.rotation;
            fallKnife.setPosition(knife.x, knife.y);
            this.fallKnifeRoot.addChild(fallKnife);
            this.newKnifeNodesArr.push(fallKnife);
        }

        let isBlast = false;
        let  children = this.newKnifeNodesArr;
        for (var i = 0; i <  children.length; ++i) {
            let  knifeNode = children[i];
            let randomNumX = Math.floor(Math.random() * 500 + 150);
            let randomNumY = Math.floor(Math.random() * 300 + 100);
            
            let callback = cc.callFunc(function(){
                i = i - 1;
                this.isResetBoard = false;
            }.bind(this));
            
            let randomTime = Math.random() + 0.3;
            let directionX = randomTime > 0.7? 1:-1;

            let randomY = Math.random();
            let directionY = randomY > 0.5? 1:-1;

            let randomPos = cc.moveBy(1.2, cc.v2( directionX * randomNumX, directionY * randomNumY));
            let seq  = cc.sequence(randomPos,  cc.delayTime(0.2),  callback );
            let angle = Math.floor(Math.random() * 360 + 90);
            let rotate = cc.rotateBy(2, directionX * angle);


            let fallCallback = cc.callFunc(function(){
                if (isBlast == false)
                {
                    isBlast = true;//确保只释放一次
                    this.fallCallbackHandle();
                }
                
            }.bind(this));

            let seq2 = cc.spawn( rotate, seq);
            knifeNode.runAction(cc.sequence(seq2, cc.delayTime(0.1), fallCallback));
        }
    }, 
    

    fallCallbackHandle(knifeNode)
    {
        this.newKnifeNodesArr = [];
        this.nodePool.getComponent("nodePool").free_node(knifeNode);
        this.knifeRoot.removeAllChildren();

        this.newRound();
    },

    /**
     * 新的回合
     */
    newRound()
    {
        let randomId = Math.floor(Math.random() * 5);
        console.log("tttttttttttttt:", randomId);
        this.diskShow(true, randomId, 2);
        this.bornNewKnife();
    }
});
