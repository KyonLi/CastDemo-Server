// 获取参数
function getParams(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');

    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}

// 用户昵称
var nickName = getParams("nickname");

screenFuc();

function screenFuc() {
    var topHeight = $(".chatBox-head").innerHeight();//聊天头部高度
    //屏幕小于768px时候,布局change
    var winWidth = $(window).innerWidth();
    if (winWidth <= 768) {
        var totalHeight = $(window).height(); //页面整体高度
        $(".chatBox-info").css("height", totalHeight - topHeight);
        var infoHeight = $(".chatBox-info").innerHeight();//聊天头部以下高度
        //中间内容高度
        $(".chatBox-content").css("height", infoHeight - 46);
        $(".chatBox-content-demo").css("height", infoHeight - 46);
        $(".chatBox-kuang").css("height", totalHeight - topHeight);
        $(".div-textarea").css("width", winWidth - 106);
    } else {
        $(".chatBox-info").css("height", 495);
        $(".chatBox-content").css("height", 448);
        $(".chatBox-content-demo").css("height", 448);
        $(".chatBox-kuang").css("height", 495);
        $(".div-textarea").css("width", 260);
    }
}

(window.onresize = function () {
    screenFuc();
})();
//未读信息数量为空时
var totalNum = $(".chat-message-num").html();
if (totalNum == "") {
    $(".chat-message-num").css("padding", 0);
}
$(".message-num").each(function () {
    var wdNum = $(this).html();
    if (wdNum == "") {
        $(this).css("padding", 0);
    }
});


//打开/关闭聊天框
$(".chatBtn").click(function () {
    $(".chatBox").toggle(10);
})
$(".chat-close").click(function () {
    $(".chatBox").toggle(10);
})
//进聊天页面
$(".chat-list-people").each(function () {
    $(this).click(function () {
        var n = $(this).index();
        $(".chatBox-head-one").toggle();
        $(".chatBox-head-two").toggle();
        $(".chatBox-list").fadeToggle();
        $(".chatBox-kuang").fadeToggle();

        //传名字
        $(".ChatInfoName").text($(this).children(".chat-name").children("p").eq(0).html());

        //传头像
        $(".ChatInfoHead>img").attr("src", $(this).children().eq(0).children("img").attr("src"));

        //聊天框默认最底部
        $(document).ready(function () {
            $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
        });
    })
});

//返回列表
$(".chat-return").click(function () {
    $(".chatBox-head-one").toggle(1);
    $(".chatBox-head-two").toggle(1);
    $(".chatBox-list").fadeToggle(1);
    $(".chatBox-kuang").fadeToggle(1);
});

//      发送信息
$("#chat-fasong").click(function () {
    var textContent = $(".div-textarea").html().replace(/[\n\r]/g, '<br>')
    if (textContent != "") {
        sendText(textContent);
        //发送后清空输入框
        $(".div-textarea").html("");

        websocket.sendMsg({name:nickName,text:textContent})
    }
});

//      发送表情
$("#chat-biaoqing").click(function () {
    $(".biaoqing-photo").toggle();
});
$(document).click(function () {
    $(".biaoqing-photo").css("display", "none");
});
$("#chat-biaoqing").click(function (event) {
    event.stopPropagation();//阻止事件
});

$(".emoji-picker-image").each(function () {
    $(this).click(function () {
        var bq = $(this).parent().html();
        console.log(bq)
        sendBiaoqing(bq)
        //发送后关闭表情框
        $(".biaoqing-photo").toggle();

        websocket.sendMsg({name:nickName,bq:bq})
    })
});

$(".div-textarea").blur(function () {
    window.parent.scrollTo(0, 0);
});

//      发送图片
function selectImg(pic) {
    if (!pic.files || !pic.files[0]) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (evt) {
        var images = evt.target.result;
        sendPicture(images)

        websocket.sendMsg({name:nickName,image:images})
    };
    reader.readAsDataURL(pic.files[0]);

}

// 发送信息
function sendText(text) {
    $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
        "<div class=\"right\"><div class=\"chat-message\">" + text + "</div>" +
        "<div class=\"chat-avatars\">" + nickName + "</div></div></div>");
    //聊天框默认最底部
    $(document).ready(function () {
        $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
    });
}

// 发送表情
function sendBiaoqing(bq) {
    $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
        "<div class=\"right\"><div class=\"chat-message\">" + bq + "</div>" +
        "<div class=\"chat-avatars\">" + nickName + "</div></div></div>");
    //聊天框默认最底部
    $(document).ready(function () {
        $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
    });
}

// 发送图片
function sendPicture(images) {
    $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
        "<div class=\"right\"><div class=\"chat-message\"><img src=" + images + "></div>" +
        "<div class=\"chat-avatars\">" + nickName + "</div></div></div>");
    //聊天框默认最底部
    $(document).ready(function () {
        $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
    });
}

// 接收信息
function receiveText(msg) {
    $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
        "<div class=\"left\"><div class=\"chat-avatars\">" + msg.name + "</div>" +
        "<div class=\"chat-message\">" + msg.text + "</div></div></div>");
    //聊天框默认最底部
    $(document).ready(function () {
        $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
    });
}

// 接收表情
function receiveBiaoqing(msg) {
    $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
        "<div class=\"left\"><div class=\"chat-avatars\">" + msg.name + "</div>" +
        "<div class=\"chat-message\">" + msg.bq + "</div></div></div>");
    //聊天框默认最底部
    $(document).ready(function () {
        $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
    });
}

// 接收图片
function receivePicture(msg) {
    $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
        "<div class=\"left\"><div class=\"chat-avatars\">" + msg.name + "</div>" +
        "<div class=\"chat-message\"><img src=" + msg.image + "></div></div></div>");
    //聊天框默认最底部
    $(document).ready(function () {
        $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
    });
}

// WebSocket相关
function wsURI() {
    var loc = window.location, new_uri;
    if (loc.protocol === "https:") {
        new_uri = "wss:";
    } else {
        new_uri = "ws:";
    }
    new_uri += "//" + loc.host;
    console.log(new_uri + loc.pathname);
    new_uri += loc.pathname + "/../ws";
    return new_uri;
}

var websocket = {
    ws:null,
    init:function () {
        this.ws = new WebSocket(wsURI());
        this.ws.onopen = function() {
            console.log("websocket已连接上");
        };

        this.ws.onmessage = function (evt) {
            var received_msg = evt.data;
            console.log(received_msg);
            msg = JSON.parse(received_msg);
            if (msg.hasOwnProperty("text")) {
                receiveText(msg);
            }
            else if (msg.hasOwnProperty("bq")) {
                receiveBiaoqing(msg);
            }
            else if (msg.hasOwnProperty("image")) {
                receivePicture(msg);
            }
        };

        this.ws.onclose = function() {
            // 关闭 websocket
            console.log("连接已关闭...")
        };
    },
    sendMsg:function (msg) {
        if (this.ws != null) {
            this.ws.send(JSON.stringify(msg));
        }
    }
}

// 生成演示消息
receiveText({"name":"王德发","text":"给你看张图"});
receivePicture({"name":"王德发","image":"img/1.png"});
sendText("嗯，适合做壁纸");
// 初始化ws
websocket.init();