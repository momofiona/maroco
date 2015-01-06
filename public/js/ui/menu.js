/**
 * 小型menu
 * @param  {Object} config [description]
 * @return {String}      
 */
"use strict";
define(function(require, exports, module) {
    var loader=UI.loader;
    var node={
        pid:'root',//父节点ID
        icon:'节点图片，带后缀视为图片，否则为class',
        name:'实际名称',
        childNodes:[]
    }
    //数据排序
    var dataManager=function(){

    }
    $.fn.cmenu=function(config){
        var container=this,
        cache={};//节点索引
        if(!config.data){

        }

        //监控tbody事件
        if(config.events){
            $.each(config.events,function(k,v){
                var s=k.indexOf(' ');
                if(s<2) return;
                container.on(k.substr(0,s),k.substr(s+1),function(event){
                    var li=$(this).closest('li');
                    var index=li.attr('data-index');
                    var data=cache[index];
                    if(v.call(this,event,li,data,config)===false) return false;
                }); 
            })
        }

    }
});
