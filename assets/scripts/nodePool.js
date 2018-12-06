cc.Class({
    extends: cc.Component,

    properties: {

        cache_num: 20,
        item_prefab: {
            type: cc.Prefab,
            default: null,
        },

        pool_name: "",
    },

    start () {
        
    },

    initPool()
    {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaa");
        
        this.pools = new cc.NodePool(this.pool_name);
        if (this.item_prefab === null) {
            return;
        }

        for(var i = 0; i < this.cache_num; i ++) {
            var item = cc.instantiate(this.item_prefab);
            item.pools = this;

            this.pools.put(item);
        }
    },

    alloc_node() {
        console.log("bbbbbbbbbbbbbbbbbb");

        var item = this.pools.get();
        if (item === null) {
            var item = cc.instantiate(this.item_prefab);
            item.pools = this;
        }
        return item;
    },

    free_node(node) {
        console.log("bbbbbbbbbbbbbbbbbb");
        this.pools.put(node);
    },
});
