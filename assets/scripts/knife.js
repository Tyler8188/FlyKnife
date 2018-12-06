/**
 * 刀
 * author tyler
 */

var State = {
    Idle: 0,
    Moving: 1,
    Around: 2,
    Back:3,
}


cc.Class({
    extends: cc.Component,

    properties: {
        moveSpeed: 500,
    },

    isShoot:false,

    knifeBackPos:0,//刀反弹的方向  -1为左，1为右

    onLoad () 
    {
        this.state = State.Idle;
    },

    setDisk(gameMgr, disk, moveSpeed) 
    {
        this.moveSpeed = moveSpeed;
        this.gameMgr = gameMgr;
        this.centerPos = disk.getPosition();
        this.aroundR = disk.width * 0.5;
        this.disk = disk.getComponent("disk");
    },

    stop_around() 
    {
        this.state = State.Idle;
    }, 

    moveAround() 
    {
        this.nowDegree = 270;
        this.state = State.Around;

        var v = this.body.linearVelocity;
        v.y = 0;
        this.body.linearVelocity = v;

        this.gameMgr.initKnifeNode();
    },

    start () 
    {
        this.body = this.node.getComponent(cc.RigidBody);

        this.node.on(cc.Node.EventType.TOUCH_START, function(e) {
            this.moveKnife();
        }.bind(this), this);
    },

    off()
    {
        this.node.off(cc.Node.EventType.TOUCH_START, this);
    },

    moveKnife() 
    {
        this.state = State.Moving;
        this.velocity = this.body.linearVelocity;
        this.velocity.y = this.moveSpeed;
        this.body.linearVelocity = this.velocity;
    },

    onBeginContact(contact, selfCollider, otherCollider) 
    {
        if (this.state != State.Moving) {
            return;
        }

        if (otherCollider.node.groupIndex == 1 && otherCollider.node.name === "knife") 
        {
            this.gameMgr.bornNewKnife();
            var v = selfCollider.body.linearVelocity;
            v.y -= this.moveSpeed;
            selfCollider.body.linearVelocity = v;
            this.state = State.Back; 

            this.knifeRotateDir = (Math.random() < 0.5) ? -1 : 1;
            if (selfCollider.node.x < otherCollider.node.x)
            {
                this.knifeBackPos = -1;
            }
            else if (selfCollider.node.x > otherCollider.node.x)
            {
                this.knifeBackPos = 1;
            }
            else
            {
                this.knifeBackPos = 0;
            }
        }
        else if (otherCollider.node.groupIndex == 2) 
        {
            this.gameMgr.knifeCount++;
            this.moveAround();    
            this.isShoot = true;
            this.off();
        }
    },

    moveUpdate(dt) 
    {
        if (this.state != State.Moving) return;

        this.node.y += this.moveSpeed * dt;
    },

    backUpdate(dt)
    {
        if (this.state != State.Back) return;

        this.node.y -= this.moveSpeed * dt;

        let distanceX = Math.floor(Math.random() * 50 + 50);

        let rotateB = cc.rotateBy(0.5, this.knifeRotateDir * 540);
        let moveB = cc.moveBy(1, cc.v2(this.knifeBackPos * distanceX, 0));

        let spawnAction = cc.spawn(rotateB, moveB);
        this.node.runAction(spawnAction);
    },

    aroundUpdate(dt) 
    {
        if (this.state != State.Around) return;
        this.nowDegree += (this.disk.wSpeed * dt);

        var r = this.nowDegree * Math.PI / 180;
        var pos = cc.p(this.centerPos.x, this.centerPos.y)
        pos.x += (this.aroundR * Math.cos(r));
        pos.y += (this.aroundR * Math.sin(r));

        this.node.setPosition(pos);

        var degree = this.nowDegree;
        degree = 360 - this.nowDegree;
        this.node.rotation = degree + 90 + 180;
    },

    update (dt) 
    {
        if (this.state === State.Idle) 
        {
            return;
        }
        else if(this.state === State.Moving) 
        {
            this.moveUpdate(dt);
        }
        else if(this.state === State.Around) 
        {
            this.aroundUpdate(dt);
        }
        else if(this.state === State.Back) 
        {
            this.backUpdate(dt);
        }
    },
});
