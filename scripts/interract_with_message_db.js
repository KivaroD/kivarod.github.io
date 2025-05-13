async function get_forum_messages(){
    return fetch("/example_dbs/messages.json")
        .then(resp => resp.json())
        .then(data => data)
        .catch((error) => {
            alert("Error in getting messages.");
            return undefined;
        });
}

async function write_messsage_forum(theme, title, message){

    return true;
}