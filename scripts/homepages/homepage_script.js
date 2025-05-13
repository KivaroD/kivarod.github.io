// Registering of Service Worker
window.addEventListener("load", () => {
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("/sw.js");
    }
});


// Check if learning preferences were set.
if(get_learning_preferences() == undefined){
    const is_pwa = new URL(document.location.href).searchParams.get('source') == "pwa";
    if(is_pwa){
        document.location.href = "/index.html?source=pwa";
    }
    else{
        document.location.href = "/index.html";
    }
}


// Customization of homepage.
initialize_all_data()
let curr_lesson_data = get_current_lesson_data();

function customize_homepage(current_lesson_data){
    // Lesson id.
    let lesson_id = current_lesson_data["current_lesson_id"];
    get_lessons().then((data) => {
        data = data["lessons"];

        if(Array.isArray(data) && lesson_id < data.length){
            // Adaptation of data depending on preferences.
            const user_preferences = get_learning_preferences();
            
            // Skip of the lesson depending on preferences.
            if(is_lesson_to_skip(user_preferences, data, lesson_id)){
                // console.log(`Skip lesson ${lesson_id}`);
                next_lesson_button_func(false,lesson_id);
            }

            // Lesson id.
            const lesson_id_display = lesson_id_by_preferences_display(data, lesson_id, user_preferences) + 1;
            document.getElementById("lesson_number").innerText = "Leçon "+lesson_id_display.toString()+" :";

            // Lesson name.
            let data_with_preferences = lesson_data_by_preferences_display(data[lesson_id]);
            const lesson = data_with_preferences[0];
            document.getElementById("lesson_name").innerText = "\"" + lesson["lesson_title"] +"\""
            
            // Progression ( TODO : à adapter en fonction de préférences apprentissage).
            let current_page = data_with_preferences[1]+1;
            let nb_pages = data_with_preferences[2]
            document.getElementById("progress").innerText = "Progression : "+current_page.toString()+"/"+nb_pages.toString();
        
            // Next lesson button.
            if(lesson_id + 1 < data.length){
                document.getElementById("next_lesson_button").innerText = "Prochaine leçon : " + data[lesson_id+1]["lesson_title"];
                document.getElementById("next_lesson_button").addEventListener("click", (event) => next_lesson_button_func(true, lesson_id));
            }
            else{
                // TODO : delete game object instead of hidding it.
                document.getElementById("next_lesson_button").parentNode.removeChild(document.getElementById("next_lesson_button"));
            }

            let logo_url = lesson["lesson_logo"];
            document.getElementById("lesson_logo").src = lesson["lesson_logo"];
        }
        else if(Array.isArray(data) && lesson_id >= data.length){
            document.getElementById("next_lesson_button").parentNode.removeChild(document.getElementById("next_lesson_button"));
            document.getElementById("progress").parentNode.removeChild(document.getElementById("progress"));
            document.getElementById("details_button").parentNode.removeChild(document.getElementById("details_button"));
            document.getElementById("begin_button").children[0].innerText = "Réviser";
            document.getElementById("begin_button").removeEventListener("click", begin_button_function);
            document.getElementById("begin_button").addEventListener("click", ()=>{
                document.location.href = "/pages/homepage_panels/exercices_list.html";
            }); 
            document.getElementById("lesson_number").innerText = "Plus de leçons";
            document.getElementById("lesson_name").innerText = "à venir";
        }
        else{
            alert("Error in the data.");
        }
    })
}
customize_homepage(curr_lesson_data);


// Buttons.
function begin_button_function(){
    document.location.href = "pages/lessons/lesson_homepage.html?lesson_id="+parseInt(curr_lesson_data["current_lesson_id"]);
}
document.getElementById("begin_button").addEventListener("click", begin_button_function);
document.getElementById("details_button").addEventListener("click", (event) => {
    document.location.href = `/pages/homepage_panels/lesson_details.html?lesson_id=${parseInt(curr_lesson_data["current_lesson_id"])}`;
});

function next_lesson_button_func(display_confirm, lesson_id){
    if(!display_confirm || confirm("Sure ?")){  // TODO : message de confirmation.
        add_lesson_completed_today(lesson_id, -1, true);
        curr_lesson_data["current_lesson_id"] = lesson_id + 1;
        curr_lesson_data["current_page_id"] = -1;
        curr_lesson_data["current_lesson_content"] = {};
        curr_lesson_data["learning_time_per_panel"] = {};

        // TODO : cleaning of lesson data in cache.
        update_storage_key_json("current_lesson_data", curr_lesson_data);
        document.location.href = "";
    }
}


// Calculate of daily objective.
if(is_daily_objective_accomplished(true)){
    alert("Objectif d'apprentissage du jour atteint, bravo !");
    save_notification_daily_objective();
}
