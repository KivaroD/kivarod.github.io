document.getElementById("write_message_button").addEventListener("click", (event)=>{
    let title = document.getElementById("title_input").value;
    let message = document.getElementById("new_message").value;
    if(title == ""){
        document.getElementById("title_input").classList.remove("normal_textarea");
        document.getElementById("title_input").classList.add("invalid_textarea");
        document.getElementById("error_message").classList.remove("hidden"); 
        document.getElementById("error_message").innerText = "Title empty.";
    }
    else if(message == ""){
        document.getElementById("new_message").classList.remove("normal_textarea");
        document.getElementById("new_message").classList.add("invalid_textarea");
        document.getElementById("error_message").classList.remove("hidden");
        document.getElementById("error_message").innerText = "Message empty.";
    }
    else{
        let theme = document.getElementById("message_filter_select").value;
        write_messsage_forum(theme, title, message).then((state)=>{
            if(state){
                document.location.href = "/pages/homepage_panels/community.html";
            }
            else{
                alert("Error in the sending of message.");
            }
        });
    }
});


function update_textboxes_display(event){
    let message = event.target.value;
    if(message == ""){
        let error_message = "Message empty.";
        if(event.target.id == "title_input"){
            error_message = "Title empty.";
        }
        event.target.classList.remove("normal_textarea");
        event.target.classList.add("invalid_textarea");
        document.getElementById("error_message").classList.remove("hidden");
        document.getElementById("error_message").innerText = error_message;
    }
    else{
        event.target.classList.add("normal_textarea");
        event.target.classList.remove("invalid_textarea");
        document.getElementById("error_message").classList.add("hidden");
    }
}
document.getElementById("title_input").addEventListener("change", update_textboxes_display);
document.getElementById("new_message").addEventListener("change", update_textboxes_display);

document.getElementById("new_message").addEventListener("focus", (event)=>{
    event.target.classList.add("normal_textarea");
    event.target.classList.remove("invalid_textarea");
    document.getElementById("error_message").classList.add("hidden");
});
document.getElementById("title_input").addEventListener("focus", (event)=>{
    event.target.classList.add("normal_textarea");
    event.target.classList.remove("invalid_textarea");
    document.getElementById("error_message").classList.add("hidden");
});