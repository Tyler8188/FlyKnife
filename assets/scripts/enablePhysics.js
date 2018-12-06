cc.Class({
    extends: cc.Component,
    properties:{
        isDebug:false,
        gravity:cc.p(0, -320),
    },

    
    onLoad()
    {
        cc.director.getPhysicsManager().enabled = true;

        if (this.isDebug)
        {
            let Bits = cc.PhysicsManager.DrawBits;
            cc.director.getPhysicsManager().debugDrawFlags = Bits.e_jointBit | Bits.e_shapeBit;
        }
        else
        {
            cc.director.getPhysicsManager().debugDrawFlags = 0;
        }
        cc.director.getPhysicsManager().gravity = this.gravity;
    },
});
