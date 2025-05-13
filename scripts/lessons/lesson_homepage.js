// Getting of the parameters in the URL.
const url_params = new URL(document.location.href).searchParams;
const lesson_id = parseInt(url_params.get('lesson_id'));
const is_review_mode = url_params.get('review_mode') == "true" ;
const lesson_completed = url_params.get('lesson_completed') == "true" ;


// Buttons.
document.getElementById("homebutton").addEventListener("click", (event) => {
    document.location.href = "/homepage.html";
});

if(!lesson_completed){
    document.getElementById("next_button").addEventListener("click", (event) => {
        if(!is_review_mode){
            if(current_lesson_data["current_page_id"] == -1){
                current_lesson_data["current_page_id"] = 0;
                update_storage_key_json("current_lesson_data", current_lesson_data);
            }
        }
        document.location.href = `/pages/lessons/${parseInt(lesson_id)}/lesson${parseInt(lesson_id)}.html?review_mode=${is_review_mode}`;
    });

    document.getElementById("back_button").addEventListener("click", (event) => {
        document.location.href = "/homepage.html";
    });
}


// Control of the id of the lesson, getting of the data.
let current_lesson_data = get_current_lesson_data();
try{
    get_lessons()
    .then((lessons_data) => {
        // Control of the parameters and update of the display with lesson data.
        if(lesson_id  != current_lesson_data["current_lesson_id"] && !(is_review_mode && lesson_id < lessons_data["lessons"].length) && !lesson_completed){
            stop_learning_time_count();
            document.location.href = "/homepage.html";    
        }
        // Save of the data and update of the display.
        else{
            const lesson_data = lessons_data["lessons"][lesson_id];
            if(!is_review_mode && Object.keys(current_lesson_data["current_lesson_content"]).length == 0 && !lesson_completed){
                // Saving of the lesson data in the local storage.
                current_lesson_data["current_lesson_content"] = lesson_data;
                update_storage_key_json("current_lesson_data",current_lesson_data);        
    
                // Saving of the lesson homepage data.
                lesson_homepage_to_save.forEach((link) => {
                    save_in_cache(SW_VERSION+"_lesson_ressources",link).then();
                });
                // TODO : saving of html pages and data (imgs, css,...) of the lesson and lesson homepage data.
                console.log("Lesson data saved");
            }
            // Updating of the data (with data fetched online).
            update_display_lesson_data(lesson_data, false);
        }
    })
}
catch(e){
    // Fetching of data with localstorage.
    try {
        // CONTROL OF THE LESSON ID AND THE REVIEW MODE
        if(Object.keys(current_lesson_data["current_lesson_content"]).length > 0 && !is_review_mode && lesson_id  == current_lesson_data["current_lesson_id"]){
            update_display_lesson_data(current_lesson_data["current_lesson_content"],true);
        }
        else{
            throw "Data not available";    
        }
    }
    catch{
        alert("ERROR FETCHING DATA");
        // TODO : MESSAGE D'ERREUR + REDIRECTION
    }
}


// Update of the display with lesson data.
function update_display_lesson_data(lesson_data,is_offline){
    if(!is_offline){
        document.getElementById("lesson_logo").src = lesson_data['lesson_logo'];        // TODO : import of url safe ???
    }
    else{

    }
    // Filtering with preferences
    let current_lesson_panel_id;
    let nb_panels;
    if(!is_review_mode){
        const lessons_data_with_preferences = lesson_data_by_preferences_display(lesson_data);
        current_lesson_panel_id = lessons_data_with_preferences[1];
        nb_panels = lessons_data_with_preferences[2];
    }
    else{
        current_lesson_panel_id = current_lesson_data["current_page_id"];
        nb_panels = lesson_data["lesson_chapters"].length;
    }

    // Display
    document.getElementById("lesson_title").innerText = `"${lesson_data['lesson_title']}"`;
    if(!lesson_completed){
        
        document.getElementById("lesson_summary").innerText = lesson_data['lesson_summary'];
        document.getElementById("nb_page_red").innerText = (current_lesson_panel_id+1).toString()+"/"+nb_panels.toString();
        if(lesson_data["lesson_exercices"].length == 0){
            document.getElementById("nb_ex_completed").parentElement.classList.add("hidden");
        } 
        else{
            document.getElementById("nb_ex_completed").innerText = get_exercices_compelted_lesson_homepage(lesson_data, current_lesson_panel_id).toString()+"/"+lesson_data["lesson_exercices"].length.toString();
        }
        if(is_review_mode){
            document.getElementById("next_button_text").innerText = "Réviser";
            document.getElementById("nb_page_red").innerText = nb_panels;
            document.getElementById("nb_page_red").parentElement.children[1].innerText = "partie(s)";
            document.getElementById("nb_ex_completed").innerText = lesson_data["lesson_exercices"].length.toString();
            document.getElementById("nb_ex_completed").parentElement.children[1].innerText = "exercice(s)";

        }
        else if(current_lesson_data["current_page_id"] == -1){
            document.getElementById("next_button_text").innerText = "Démarrer";
        }
        else{
            document.getElementById("next_button_text").innerText = "Continuer";
        }
    }
}


// TODO : control when url is used in another page.
