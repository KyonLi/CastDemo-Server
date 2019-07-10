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
// 房间号
var room = getParams("room");
// 是否为管理员
var owner = getParams("owner") === 'true';
// 是否允许评论
var allowComment = true;

refreshCommentPermission();
screenFuc();

function screenFuc() {
    var topHeight = $(".chatBox-head").innerHeight()+$(".chatBox-head").position().top;//聊天头部高度
    //屏幕小于768px时候,布局change
    var winWidth = $(window).innerWidth();
    if (winWidth <= 768) {
        var totalHeight = $(window).height(); //页面整体高度
        $(".chatBox-info").css("height", totalHeight - topHeight);
        var infoHeight = $(".chatBox-info").innerHeight();//聊天头部以下高度
        //中间内容高度
        var sendHeight = allowComment?46:0;
        $(".chatBox-content").css("height", infoHeight - sendHeight);
        $(".chatBox-content-demo").css("height", infoHeight - sendHeight);
        $(".chatBox-kuang").css("height", totalHeight - topHeight);
        $(".div-textarea").css("width", winWidth - 86);
    } else {
        $(".chatBox-info").css("height", 495);
        $(".chatBox-content").css("height", 448);
        $(".chatBox-content-demo").css("height", 448);
        $(".chatBox-kuang").css("height", 495);
        $(".div-textarea").css("width", 260);
    }
}

function scrollToBottom() {
    // $("#chatBox-content-demo").animate({scrollTop: $("#chatBox-content-demo")[0].scrollHeight}, 200);
    $("#chatBox-content-demo").scrollTop($("#chatBox-content-demo")[0].scrollHeight);
}

(window.onresize = function () {
    screenFuc();
})();


//打开/关闭聊天框
$(".chatBtn").click(function () {
    $(".chatBox").toggle(10);
})
$(".chat-close").click(function () {
    $(".chatBox").toggle(10);
})

//      发送信息
$("#chat-fasong").click(function () {
    var textContent = $(".div-textarea").html().replace(/[\n\r]/g, '<br>')
    if (textContent != "") {
        sendText(textContent);
        //发送后清空输入框
        $(".div-textarea").html("");

        websocket.sendMsg({text:textContent})
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

        websocket.sendMsg({bq:bq})
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

        websocket.sendMsg({image:images})
    };
    reader.readAsDataURL(pic.files[0]);

}

$(".chatBox-head input").change(function () {
    allowComment = $(".chatBox-head input").prop('checked');
    var msg = {};
    msg.cmd = allowComment?1:2;
    var desc = allowComment?"已开启本次活动评论":"已关闭本次活动评论";
    sendCmd(desc);
    websocket.sendMsg(msg);
});

// 发送信息
function sendText(text) {
    // $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
    //     "<div class=\"right\"><div class=\"chat-message\">" + text + "</div>" +
    //     "<div class=\"chat-avatars\">" + nickName + "</div></div></div>");
    if (owner) {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars owner\">" + nickName + "</div>" +
            "<div class=\"chat-message\">" + text + "</div></div></div>");
    } else {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars\">" + nickName + "</div>" +
            "<div class=\"chat-message\">" + text + "</div></div></div>");
    }

    //聊天框默认最底部
    scrollToBottom();
}

// 发送表情
function sendBiaoqing(bq) {
    // $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
    //     "<div class=\"right\"><div class=\"chat-message\">" + bq + "</div>" +
    //     "<div class=\"chat-avatars\">" + nickName + "</div></div></div>");
    if (owner) {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars owner\">" + nickName + "</div>" +
            "<div class=\"chat-message\">" + bq + "</div></div></div>");
    } else {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars\">" + nickName + "</div>" +
            "<div class=\"chat-message\">" + bq + "</div></div></div>");
    }

    //聊天框默认最底部
    scrollToBottom();
}

// 发送图片
function sendPicture(images) {
    // $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
    //     "<div class=\"right\"><div class=\"chat-message\"><img src=\"" + images + "\" onload=\"scrollToBottom()\"></div>" +
    //     "<div class=\"chat-avatars\">" + nickName + "</div></div></div>");
    if (owner) {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars owner\">" + nickName + "</div>" +
            "<div class=\"chat-message\"><img src=\"" + images + "\" onload=\"scrollToBottom()\"></div></div></div>");
    } else {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars\">" + nickName + "</div>" +
            "<div class=\"chat-message\"><img src=\"" + images + "\" onload=\"scrollToBottom()\"></div></div></div>");
    }

    //聊天框默认最底部
    scrollToBottom();
}

// 发送指令
function sendCmd(desc) {

    $(".chatBox-content-demo").append("<div class=\"clearfloat\" style=\"background: linear-gradient(to right, pink , transparent);\">" +
        "<div class=\"left\"><div class=\"chat-avatars owner\">" + desc + "</div></div></div>");

    //聊天框默认最底部
    scrollToBottom();
}

// 接收信息
function receiveText(msg) {
    if (msg.owner) {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars owner\">" + msg.name + "</div>" +
            "<div class=\"chat-message\">" + msg.text + "</div></div></div>");
    } else {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars\">" + msg.name + "</div>" +
            "<div class=\"chat-message\">" + msg.text + "</div></div></div>");
    }

    //聊天框默认最底部
    scrollToBottom();
}

// 接收表情
function receiveBiaoqing(msg) {
    if (msg.owner) {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars owner\">" + msg.name + "</div>" +
            "<div class=\"chat-message\">" + msg.bq + "</div></div></div>");
    } else {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars\">" + msg.name + "</div>" +
            "<div class=\"chat-message\">" + msg.bq + "</div></div></div>");
    }

    //聊天框默认最底部
    scrollToBottom();
}

// 接收图片
function receivePicture(msg) {
    if (msg.owner) {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars owner\">" + msg.name + "</div>" +
            "<div class=\"chat-message\"><img src=\"" + msg.image + "\" onload=\"scrollToBottom()\"></div></div></div>");
    } else {
        $(".chatBox-content-demo").append("<div class=\"clearfloat\">" +
            "<div class=\"left\"><div class=\"chat-avatars\">" + msg.name + "</div>" +
            "<div class=\"chat-message\"><img src=\"" + msg.image + "\" onload=\"scrollToBottom()\"></div></div></div>");
    }

    scrollToBottom();
}

// 接收指令
function receiveCmd(msg) {
    var desc = msg.cmd === 1 ? "已开启本次活动评论" : "已关闭本次活动评论";
    $(".chatBox-content-demo").append("<div class=\"clearfloat\" style=\"background: linear-gradient(to right, pink , transparent);\">" +
        "<div class=\"left\"><div class=\"chat-avatars owner\">" + desc + "</div></div></div>");

    scrollToBottom();
}

// 刷新是否允许评论
function refreshCommentPermission() {
    if (owner) {
        $(".chatBox-head input").css('display','block');
        $(".chatBox-head label").css('display','block');
        $(".chatBox-head input").prop("checked",allowComment);
    } else {
        console.log(allowComment?"显示输入框":"隐藏输入框");
        if (allowComment) {
            $(".chatBox-send").css('display','block');
        } else {
            $(".chatBox-send").css('display','none');
        }
        screenFuc();
    }
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
    new_uri += loc.pathname + "/../ws?room=" + room;
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
            if (msg.hasOwnProperty("cmd")) {
                allowComment = msg.cmd === 1;
                refreshCommentPermission();
                receiveCmd(msg);
            }
            else if (msg.hasOwnProperty("text")) {
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
            msg.name = nickName;
            msg.room = room;
            msg.owner = owner;
            this.ws.send(JSON.stringify(msg));
        }
    }
}

// 生成演示消息
// receiveText({name:"王德发",text:"给你看张图"});
// receivePicture({name:"王德发",image:"img/1.png"});
// sendText("嗯，适合做壁纸");
// 初始化ws
websocket.init();
