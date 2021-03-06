var socket = null;

let user = {
    user_id: null,
    user_name: null
};

let connected = false;

$(function() {
    $("form#formLogin").submit(e => {
        formHandleConnect(e);
    });

    $("form#formMensagem").submit(e => {
        formHandleSubmit(e);
    });

    if(localStorage.getItem("user_name"))
    {
        formHandleConnect(null, localStorage.getItem("user_name"));
    }
    else
    {
        $(".loading").attr("hidden", true);
        $(".login").removeAttr("hidden");
    }
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

    if (!message) {
        return;
    }

    socket.emit("send_message", message);

    return false;
}

function clearChat()
{
    $("#mensagens").html('');
}

function logout() {

    localStorage.removeItem('user_name');

    socket && socket.disconnect();

    location.reload();

}

function formHandleConnect(e, userName = null) {

    $(".login").attr("hidden", true);
    $(".loading").removeAttr("hidden");
    
    e && e.preventDefault();

    let user_name = userName || $('[name="username"]').val();

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
        $(".loading").attr("hidden", true);
        $(".chat").removeAttr("hidden");

        socket.emit('user_list', { ownerId: socket.id }, populateUserList);

        setInterval(() => {

            if(!connected)
            {
                return;
            }
            
            socket.emit('last_seen', { ownerId: socket.id,  });

            socket.emit('user_list', { ownerId: socket.id }, populateUserList);
            
        }, 5000);

    });

    socket.on('user_list', populateUserList);

    socket.on("received_message", function(content) {

        if (!content.msg) {
            return;
        }


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
}

function populateUserList(responseData) {

    if(responseData.users && responseData.users.length > 0)
    {
        $("#users").html("");

        responseData.users.forEach(item => {
            $("#users").append( $('<li>').text(item.name) );
        })
    }
}