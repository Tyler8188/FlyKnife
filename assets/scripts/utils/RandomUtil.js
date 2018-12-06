/**
 * 随机数工具类
 * by yanlc
 */
var instance = null;
var RandomUtil = cc.Class({
    properties: { 
        //设置用于随机数生成器的种子，如果不设置则实际是取当前时间毫秒数
        seed: 0,
    },
    
    /**
     * 设置随机种子
     * @param {*} seek 种子
     */
    setSeed(seek) {
        this.seed = seek;
    },

    /**
     * 返回一个随机数，在0.0～1.0之间
     */
    random() {
        return this.range(0, 1);
    },
    /**
     * 返回一个随机数，在-1.0～1.0之间
     */
    random1to1() {
        return this.range(-1,1);
    },

    /**
     * 返回一个在min和max之间的随机浮点数
     * @param {*} min 
     * @param {*} max 
     */
    range(min, max) {
        if (!this.seed && this.seed != 0) {
            this.seed = new Date().getTime();
        }
        max = max || 1;
        min = min || 0;
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var rnd = this.seed / 233280.0;
        return min + rnd * (max - min);
    }
});




var random = instance ? instance : new RandomUtil();
window.RandomUtil = random;
