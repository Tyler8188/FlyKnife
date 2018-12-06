/**
 * 圆盘
 * author tyler
 */
var DiskType = cc.Enum({
    None: 0,
    SmallDisk: 1,
    BigDisk: 2,
});


cc.Class({
    extends: cc.Component,

    properties:
    {
        wSpeed:120,
        diskOfType:
        {
            default:DiskType.None,
            type:DiskType,
        },
    },

    start()
    {
        this.nowDegree = 0;
    },

    update(dt)
    {
        this.nowDegree += this.wSpeed * dt;
        while (this.nowDegree >= 360)
        {
            this.nowDegree -= 360;
        }
        this.node.rotation = 360 - this.nowDegree;
    },
});