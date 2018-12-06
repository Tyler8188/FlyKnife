/**
 * 需要保存的 配置文件
 */
var Config = new Object()

Config.init = function(){
    var confJsonStr = cc.sys.localStorage.getItem("config")
    if (confJsonStr){
        this.m_conf = JSON.parse(confJsonStr)
    } else {
        this.m_conf = {
            musicEnabled:true,
            effectEnabled:true,
        }

        cc.sys.localStorage.setItem("config", JSON.stringify(this.m_conf))
    }
}

Config.save = function(){
    cc.sys.localStorage.setItem("config", JSON.stringify(this.m_conf))
}

Config.getConf = function(){
    return this.m_conf
}

Config.init()

module.exports = Config