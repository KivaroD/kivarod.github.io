// TODO : getting of messages

let forum_messages;

// Display of messages and filtering.
function display_message(messages, filter_option){
    document.getElementById("messages_list").innerHTML = "";
    let all_options = (filter_option == "all");
    if(messages.length == 0){
        let no_message_text = document.createElement("p");
        no_message_text.classList.add("no_mesages");
        no_message_text.innerText = "Pas de message."
        document.getElementById("messages_list").appendChild(no_message_text);
    }
    for(let i=0; i<messages.length; i++){
        let message = messages[i];
        if(all_options || message["category"] == filter_option){
            // Message container.
            let message_container = document.createElement("div");
            message_container.classList.add("message_container");
            document.getElementById("messages_list").appendChild(message_container);

            // Message header.
            message_header = document.createElement("div");
            message_header.classList.add("message_header");
            //      Logo.
            message_type_logo = document.createElement("img");
            // TODO : changer logo en fonction type.
            message_type_logo.src="/images/logos/info-circle-fill_blue.png";
            message_header.appendChild(message_type_logo);
            message_container.appendChild(message_header);
            
            // Message header texts.
            message_header_texts = document.createElement("div");
            message_header_texts.classList.add("message_header_texts");
            message_header.appendChild(message_header_texts);
            //      Title.
            message_title = document.createElement("p");
            message_title.classList.add("message_title");
            message_title.innerText = message["title"];
            message_header_texts.appendChild(message_title);
            //      Username.
            message_username = document.createElement("p");
            message_username.classList.add("message_username");
            message_username.innerText = message["username"];
            message_header_texts.appendChild(message_username);

            // Message content.
            let message_content = document.createElement("div");
            message_content.classList.add("message_content");
            message_content.innerText = message["content"];
            message_container.appendChild(message_content);
        }
    }
}
document.getElementById("message_filter_select").addEventListener("change", (event) =>{
    display_message(forum_messages,event.target.value);
});
get_forum_messages()
    .then((messages) => {
        forum_messages = messages;
        display_message(messages, document.getElementById("message_filter_select").value);
    })
