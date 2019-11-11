var socket = null;

let user = {
    user_id: null,
    user_name: null
};

$(function() {
    $("form#formLogin").submit(e => {
        formHandleConnect(e);
    });

    $("form#formMensagem").submit(e => {
        formHandleSubmit(e);
    });

    console.log(localStorage.getItem("user_name"));

    localStorage.getItem("user_name") &&
        formHandleConnect(null, localStorage.getItem("user_name"));
});

function formHandleSubmit(e) {
    e.preventDefault(); // prevents page reloading

    sendMessage(e);
}

function sendMessage(e) {
    if (!connected) {
        alert("Você precisa se conectar antes de enviar mensagens...");

        return;
    }

    let message = $("#message").val();

    $("#message").val("");

    if (!content.msg) {
        return;
    }

    console.log("sending message: " + message);

    socket.emit("send_message", message);

    return false;
}

let connected = false;

function formHandleConnect(e, userName = null) {
    e && e.preventDefault();

    let user_name = userName || $('[name="username"]').val();

    console.log("connecting as: " + user_name);

    let channelName =
        //'';
        "/brazil";

    socket = io(channelName, {
        query: { user_name }
    });

    localStorage.setItem("user_name", user_name);

    socket.on("connect", function(content) {
        user.user_id = channelName + "#" + socket.id;
        user.user_name = user_name;

        connected = true;

        $("#message").val("");

        let msg = $('<li class="system">');

        $(msg)
            .append('<div "content">')
            .text("Connected!");

        $("#mensagens").append(msg);

        $(".login").attr("hidden", true);
        $(".chat").removeAttr("hidden");
    });

    socket.on("received_message", function(content) {
        if (!content.msg) {
            return;
        }

        console.log(content);

        let msg = $(
            `<li class="${
                content.user_id
                    ? content.user_id == user.user_id
                        ? "mine"
                        : ""
                    : "system"
            }">`
        );

        $(msg)
            .append(`<div "content">`)
            .text(
                `${content.user_name ? content.user_name + ":" : ""} ${
                    content.msg
                }`
            );

        $("#mensagens").append(msg);
    });

    socket.on("disconnect", function() {
        console.log("Disconnected!", socket);
    });
}
