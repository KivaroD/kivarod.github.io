// Getting of lesson data.
const current_lesson_data = get_current_lesson_data();
const user_preferences = get_learning_preferences();
let lesson_data = -1;
let current_panel_id = -1;
let min_panel_id = 0;
let lesson_panels_with_grade;
let exercices_scores;
let time_spent_per_panel = {};

// Getting of parameters in the URL.
const splitted_url = document.location.href.split("/");
const lesson_id = parseInt(splitted_url[splitted_url.length-2])
const is_review_mode = new URL(document.location.href).searchParams.get('review_mode') == "true" && lesson_id < current_lesson_data["current_lesson_id"];
const is_exercice_review = new URL(document.location.href).searchParams.get('exercice_review') == "true" && is_review_mode;


// Control of the lesson id and getting of the lesson data. => CONTROL ID
// Getting of data saved offline.
if(!is_review_mode){
    if(current_lesson_data["current_lesson_id"] != lesson_id){
        document.location.href = "/homepage.html";
    }
    let panel_id = parseInt(new URL(document.location.href).searchParams.get('panel_id'));
    if(is_review_mode && 0 <= panel_id && panel_id < current_lesson_data["current_lesson_content"]["lesson_chapters"].length){
        current_panel_id = panel_id;
        display_panel(current_lesson_data["current_lesson_content"],panel_id)
    }
    else{
        display_panel(current_lesson_data["current_lesson_content"],current_lesson_data["current_page_id"])
    }

}
// Getting of lesson data with online information.
else{
    get_lessons().then((lessons_data) => {
        let panel_id = parseInt(new URL(document.location.href).searchParams.get('panel_id'));
        if(0 <= panel_id && panel_id < lessons_data["lessons"][lesson_id]["lesson_chapters"].length){
            current_panel_id = panel_id;
            display_panel(lessons_data["lessons"][lesson_id],current_panel_id);
        }
        else{
            display_panel(lessons_data["lessons"][lesson_id],0);
        }
    });
}


// Display of the page.
function display_panel(data, panel_id, backward){
    if(lesson_data == -1){
        lesson_data = data;
    }
    panel_id = parseInt(panel_id);
    current_panel_id = panel_id;
    

    // Calculation of the panels with exercices containing grades.
    if(lesson_panels_with_grade == undefined){
        lesson_panels_with_grade = {};
        exercices_scores = {};
        for(let i=0; i<lesson_data["lesson_exercices"].length; i++){
            if(
                Object.keys(lesson_data["lesson_exercices"][i]).includes("required") && lesson_data["lesson_exercices"][i]["required"] && lesson_data["lesson_exercices"][i]["panel_id"] >= current_panel_id
            ){
                lesson_panels_with_grade[lesson_data["lesson_exercices"][i]["panel_id"]] = i;
            }
            exercices_scores[i] = [];
        }
    }

    // Skipping of panel depending on the preferences.
    if(!is_review_mode){
        const to_skip = is_panel_to_skip(lesson_data, current_panel_id, user_preferences);
        // console.log(`Panel id : ${current_panel_id}, to skip : ${to_skip}`);
        if(to_skip){
            if(backward){
                previous_panel();
                return;
            }
            else{
                next_panel();
                return;
            }
        }
    }

    // Adaptation of panel ids with preferences.
    const data_with_preferences = 0;
    let panel_id_filtered;
    let nb_panel_filtered;
    if(!is_review_mode){
        const lesson_stats_with_preferences = lesson_data_by_preferences_display(lesson_data,current_panel_id);
        // lesson_data, current_lesson_panel_id, nb_panels, first_panel_not_skipped
        panel_id_filtered = lesson_stats_with_preferences[1];
        nb_panel_filtered = lesson_stats_with_preferences[2];
        min_panel_id = lesson_stats_with_preferences[3];
    }
    else{
        panel_id_filtered = current_panel_id;
        nb_panel_filtered = lesson_data["lesson_chapters"].length;
    }

    start_learning_time_count(is_review_mode, time_spent_per_panel);

    // Update of the display.
    document.getElementById("panel_title").innerText = lesson_data["lesson_chapters"][panel_id]["name"];    // Title of the lesson.
    document.getElementById("current_panel_pos").innerText = (panel_id_filtered+1).toString() + "/" + nb_panel_filtered.toString(); 
    document.getElementById("panel"+current_panel_id.toString()).classList.remove("hidden");

    // Hiding of nav buttons in exercice review.
    if(is_exercice_review){
        const buttons_nav_container = document.getElementsByClassName("lesson_button_options")[0];
        buttons_nav_container.parentNode.removeChild(buttons_nav_container);
    }
}

function previous_panel(){
    if(current_panel_id > min_panel_id){
        document.getElementById("panel"+current_panel_id.toString()).classList.add("hidden");
        display_panel(lesson_data, current_panel_id - 1,true);
    }
}

function register_ex_error(){
    if(
        Object.keys(lesson_panels_with_grade).includes(current_panel_id.toString()) && lesson_panels_with_grade[current_panel_id] != -1 &&
        (!is_review_mode && !was_exercice_completed(lesson_id, lesson_panels_with_grade[current_panel_id]) || is_review_mode)
    ){
        exercices_scores[lesson_panels_with_grade[current_panel_id]].push(0);
    }
}

function validate_panel_exercice(){
    if(
        Object.keys(lesson_panels_with_grade).includes(current_panel_id.toString()) && lesson_panels_with_grade[current_panel_id] != -1 &&
        (!is_review_mode && !was_exercice_completed(lesson_id, lesson_panels_with_grade[current_panel_id]) || is_review_mode)
    ){
        exercices_scores[lesson_panels_with_grade[current_panel_id]].push(1);
        let time_spent_ex = time_spent_per_panel[current_panel_id];
        if(!is_review_mode){
            time_spent_ex = get_current_lesson_data()["learning_time_per_panel"][current_panel_id];
        }
        add_exercice_completed_today(lesson_id, lesson_panels_with_grade[current_panel_id], exercices_scores[lesson_panels_with_grade[current_panel_id]], time_spent_ex);
        // console.log(`Panel id ${current_panel_id}, exercice id ${lesson_panels_with_grade[current_panel_id]} validated`);
        if(is_exercice_review){
            const avg_score = Math.round(average(exercices_scores[lesson_panels_with_grade[current_panel_id]])*100);
            document.location.href = `/pages/lessons/lesson_completed.html?lesson_id=${lesson_id}&review_mode=true&lesson_completed=true&score=${avg_score}`;
        }
        lesson_panels_with_grade[current_panel_id] = -1;
    }
}

function next_panel(){
    // If the panel has a required exercice but not validated.
    if(Object.keys(lesson_panels_with_grade).includes(current_panel_id.toString()) && lesson_panels_with_grade[current_panel_id] != -1 && !was_exercice_completed(lesson_id, lesson_panels_with_grade[current_panel_id])){
        alert("Valider l'exercice pour pouvoir passer à la suite.");
        return;
    }
    
    if(current_panel_id < lesson_data["lesson_chapters"].length){
        document.getElementById("panel"+current_panel_id.toString()).classList.add("hidden");
        if(current_panel_id + 1 == lesson_data["lesson_chapters"].length){
            // Calculation of the time spent.
            let container_time = time_spent_per_panel
            if(!is_review_mode){
                container_time = get_current_lesson_data()["learning_time_per_panel"];
            }
            let time = 0;
            Object.keys(container_time).forEach(key => {time += container_time[key]});
            
            let avg_score=-1;
            if(!is_review_mode){
                // TODO : contrôler l'index.
                // TODO : sauvegarder la date de completion.
                avg_score = Math.round(calculate_exercice_first_completion_score(lesson_id, lesson_data["lesson_exercices"])*100);
                update_storage_key_json("current_lesson_data", {
                    "current_lesson_id" : lesson_id + 1,
                    "current_page_id" : -1,
                    "current_lesson_content" : {},
                    "learning_time_per_panel" : {}
                });
            }
            
            add_lesson_completed_today(lesson_id, time, false);
            document.location.href = `/pages/lessons/lesson_completed.html?lesson_id=${parseInt(lesson_id)}&review_mode=${is_review_mode}&lesson_completed=true&score=${avg_score}`;
        }
        else{
            if(current_panel_id == current_lesson_data["current_page_id"] && !is_review_mode){
                current_lesson_data["current_page_id"] = current_panel_id + 1;
                current_lesson_data["learning_time_per_panel"] = get_current_lesson_data()["learning_time_per_panel"];
                update_storage_key_json("current_lesson_data",current_lesson_data);
            }
            display_panel(lesson_data, current_panel_id + 1);    
        }
    }
}


// Buttons.
document.getElementById("homebutton").addEventListener("click", (event)=> {
    if(confirm("Êtes-vous sûr(e) de vouloir retourner au menu principal ?")){
        document.location.href = "/homepage.html";
    }
})

document.getElementById("previous_panel_button").addEventListener("click", previous_panel);

document.getElementById("next_panel_button").addEventListener("click", next_panel);
