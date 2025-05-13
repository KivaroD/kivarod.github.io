function get_lessons_data_url(){
    // TODO : customize url with lang
    return "/learning_databases/fr/lesson_base.json";
}

async function get_lessons(customize_with_learning_preferences){
    const db_url = get_lessons_data_url();
    return fetch(db_url)
        .then((resp) => resp.json())
        .then((data) => {
            return data
        })
        .catch((error) => {
            alert("Error");
            return undefined;
        })
}

function is_panel_to_skip(lesson_data, panel_id, learning_prefs){
    // TODO : skip depending on current level.

    // {"name": '...', "level_range": [0, 5], "preferences" : [...]}
    if(
        learning_prefs["current_level"] != -1 &&
        Object.keys(lesson_data["lesson_chapters"][panel_id]).includes("level_range") &&
        (learning_prefs["current_level"] < lesson_data["lesson_chapters"][panel_id]["level_range"][0] || learning_prefs["current_level"] > lesson_data["lesson_chapters"][panel_id]["level_range"][1])
    ){
        return true;
    }
    

    // Skip of panels depending on preferences.
    if(!Object.keys(lesson_data["lesson_chapters"][panel_id]).includes("preferences") || learning_prefs["objectives"].length == 0){
        return false;
    }
    else{
        for(let i=0; i < lesson_data["lesson_chapters"][panel_id]["preferences"].length; i++){
            if(learning_prefs["objectives"].includes(lesson_data["lesson_chapters"][panel_id]["preferences"][i])){
                return false;
            }
        }
    }
    return true;

    // default lesson preferences : []
    // default level : -1

}

function lesson_data_by_preferences_display(lesson_data, current_lesson_panel_id){
    // Getting of data.
    if(current_lesson_panel_id == undefined){
        current_lesson_panel_id = get_current_lesson_data()["current_page_id"];
    }
    let nb_panels = lesson_data["lesson_chapters"].length;
    
    // Skip if preferences are not set.
    const user_preferences = get_learning_preferences();
    const panels_types_preferences = user_preferences["objectives"];
    if(panels_types_preferences.length == 0){
        return [lesson_data,current_lesson_panel_id,nb_panels,0];
    }

    // Initialisation of variables.
    let panel_id_adapted = current_lesson_panel_id;
    let nb_panels_adapted = nb_panels;
    let first_panel_not_skipped = 0;
    for(let panel_id=0; panel_id < nb_panels; panel_id++){
        if(is_panel_to_skip(lesson_data, panel_id, user_preferences)){
            nb_panels_adapted --;
            if(panel_id < current_lesson_panel_id){
                panel_id_adapted--;
            }
            if(panel_id == first_panel_not_skipped){
                first_panel_not_skipped++;
            }
        }
    }
    // Filtered data for lessons, current index, nb pages.
    return [lesson_data,panel_id_adapted,nb_panels_adapted,first_panel_not_skipped];
}

function is_lesson_to_skip(user_preferences, data, lesson_id){
    // Skip of the lesson if level is too low or high.
    if(
        user_preferences["current_level"] != -1 && Object.keys(data[lesson_id]).includes(("level_range")) &&
        (user_preferences["current_level"] < data[lesson_id]["level_range"][0] || user_preferences["current_level"] > data[lesson_id]["level_range"][1])
    ){
        return true;
    }

    // Skip of lesson depending on preferences.
    if(
        user_preferences["objectives"].length > 0 && Object.keys(data[lesson_id]).includes(("preferences"))
    ){
        let preference_present = false;
        let i = 0;
        while(!preference_present && i < data[lesson_id]["preferences"].length){
            if(user_preferences["objectives"].includes(data[lesson_id]["preferences"][i])){
                preference_present = true;
            }
            i++;
        }
        if(preference_present){
            return false;
        }
        return true;
    }
    return false;
}

function lesson_id_by_preferences_display(lesson_data, current_lesson_panel_id, user_preferences){
    for(let i=0;i<current_lesson_panel_id; i++){
        if(is_lesson_to_skip(user_preferences, lesson_data, i)){
            current_lesson_panel_id--;
        }
    }
    return current_lesson_panel_id;
}

function get_exercices_compelted_lesson_homepage(lesson_data, current_panel_id){
    // Calculation of panel_ids with an exercice.
    let nb_exercices_passed = 0;
    for(let i=0; i < lesson_data["lesson_exercices"].length; i++){
        if(lesson_data["lesson_exercices"][i]["panel_id"] < current_panel_id){
            nb_exercices_passed++;
        }
    }
    return nb_exercices_passed;
}