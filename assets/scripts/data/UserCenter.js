function User(uid, nick, photo_url, sex, level, seat) {
    this.uid = uid;
    this.nick = nick;
    this.photo_url = photo_url;
    this.sex = sex;
    this.level = level;
    this.seat = seat;

    this.allScore = 0;

    this.knifeImg = 0;
}

/**
 * 用户中心
 */
var userCenter = cc.Class({

    properties: {
        own: null,
        pkUser: null,
    },

    ctor() {
        
    },

    /**
     * 设置自己的用户数据
     * @param {*} user 
     */
    setOwnUser(user) {
        this.own = new User(user.uid, user.nick, user.photo_url, user.sex, user.level, user.seat);
    },

    /**
     * 设置对手用户数据
     * @param {*} user 
     */
    setPkUser(user) {
        this.pkUser = new User(user.uid, user.nick, user.photo_url, user.sex, user.level, user.seat);
    },

    /**
     * 获取自己所在的方向
     * 方向由座位号判断，座位号大的在左边
     */
    getDirec() {
        if (this.own.seat > this.pkUser.seat) {
            return 'left';
        }
        return 'right';
    },

    /**
     * 判断自己是否是主机，主机负责生成地图或者随机种子
     * 主机有座位号判断，座位号大的为主机
     */
    isMaster() {
        if (this.own.seat > this.pkUser.seat) {
            return true;
        }
        return false;
    },

    /**
     *  自己是否获胜
     *  1胜 2 负 3平局 
     */
    ownIsWin() {
        if (this.own.allScore == this.pkUser.allScore) {
            return 3;
        } else if (this.own.allScore > this.pkUser.allScore) {
            return 1;
        } else if (this.own.allScore < this.pkUser.allScore) {
            return 2;
        }
    }
});

window.UserCenter = new userCenter();