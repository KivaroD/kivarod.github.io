// Check if learning preferences were set.
if(get_learning_preferences() == undefined){
    document.location.href = "/welcome.html";
}


// Getting of learning data.
let curr_learning_data = get_current_lesson_data();
if(curr_learning_data == undefined){
    initialize_current_lesson_data();
    curr_learning_data = get_current_lesson_data();
}


// Display of the information about the lesson.
function customize_lessons(data, lesson_id){
    // Update of information header.
    let learning_state_header_text = "";
    let learning_state_header_logo = "";
    let learning_state_header_class = "";
    if(curr_learning_data["current_lesson_id"] == lesson_id && curr_learning_data["current_page_id"] == -1){
        learning_state_header_text = "Leçon non débutée";
        learning_state_header_logo = "info-circle-fill_blue.png";
        learning_state_header_class = "not_started";
        // alert("Current lesson not started");
    }
    else if(curr_learning_data["current_lesson_id"] == lesson_id && curr_learning_data["current_page_id"] != -1){
        learning_state_header_text = "En cours";
        learning_state_header_logo = "award-orange.png";
        learning_state_header_class = "in_progress";
        document.getElementById("start_lesson_button").innerText = "Continuer";
        // alert("Current lesson started.")
    }
    else if(curr_learning_data["current_lesson_id"] > lesson_id){
        learning_state_header_text = "Terminé";
        learning_state_header_logo = "check-circle-fill 1.png";
        learning_state_header_class = "finished";
        document.getElementById("start_lesson_button").innerText = "Réviser";
        // alert("Finished");
    }
    else{
        learning_state_header_text = "Bloqué";
        learning_state_header_logo = "x-circle-fill 1.png";
        learning_state_header_class = "blocked";
        document.getElementById("start_lesson_button").innerText = "Démarrer";
        // alert("not unlocked");
    }
    document.getElementById("state_header").children[1].innerText = learning_state_header_text;
    document.getElementById("state_header").classList.add(learning_state_header_class);
    document.getElementById("state_header").children[0].src = "/images/logos/"+learning_state_header_logo;

    // Lesson information header.
    document.getElementById("lesson_logo_div").children[0].classList.add("logo_"+learning_state_header_class);
    let current_lesson_data = data["lessons"][lesson_id];
    document.getElementById("start_lesson_button").addEventListener("click", () => {start_lesson_button(current_lesson_data)});
    document.getElementById("lesson_names_texts_div").children[0].innerText = "Chapitre " + (current_lesson_data["chapter"]+1).toString();
    document.getElementById("lesson_names_texts_div").children[1].innerText = "Leçon " + (lesson_id+1).toString() + " : \"" + current_lesson_data["lesson_title"] + "\"";
    document.getElementById("start_lesson_button").classList.add("logo_"+learning_state_header_class);
    let logo_url = current_lesson_data["lesson_logo"];
    document.getElementById("lesson_logo").src = logo_url;

    // Presentation.
    document.getElementById("description").children[1].innerText = current_lesson_data["lesson_description"];

    // Content.
    // TODO : a adapter avec préférences (enlever éléments, ajouter éléments).
    let content_list_div = document.getElementById("content").children[1];
    for(let i=0; i<current_lesson_data["lesson_chapters"].length; i++){
        let content_element = document.createElement("p");
        content_element.classList.add("small");
        content_element.classList.add("content_list_element");
        if(curr_learning_data["current_page_id"] + 1 > i && lesson_id == curr_learning_data["current_lesson_id"] || lesson_id < curr_learning_data["current_lesson_id"]){
            content_element.classList.add("content_list_element_underline");
            content_element.addEventListener("click", (event) => {content_list_element(lesson_id, i)});
        }
        content_element.innerText =  "- " + current_lesson_data["lesson_chapters"][i]["name"];
        content_list_div.appendChild(content_element);
    }
}


// Getting of lesson id from GET parameter.
get_parameters_list = new URLSearchParams(window.location.search) 
let lesson_id = parseInt(get_parameters_list.get("lesson_id"));
if(lesson_id == null || isNaN(lesson_id)){
    document.location.href = "/pages/homepage_panels/lessons_list.html";
}
get_lessons().then((data) => {
    if(lesson_id >= data["lessons"].length){
        document.location.href = "/pages/homepage_panels/lessons_list.html";
    }
    customize_lessons(data, lesson_id);
})


// Start lesson button.
function start_lesson_button(lesson){
    // Current lesson but not started.
    if(curr_learning_data["current_lesson_id"] == lesson_id && curr_learning_data["current_page_id"] == -1){
        document.location.href = document.location.href = "/pages/lessons/lesson_homepage.html?lesson_id="+parseInt(curr_learning_data["current_lesson_id"]);
    }
    // Current lesson and already started.
    else if(curr_learning_data["current_lesson_id"] == lesson_id && curr_learning_data["current_page_id"] != -1){
        document.location.href = document.location.href = "/pages/lessons/lesson_homepage.html?lesson_id="+parseInt(curr_learning_data["current_lesson_id"]);
    }
    // Lesson previously validated.
    else if(curr_learning_data["current_lesson_id"] > lesson_id){
        document.location.href = document.location.href = "/pages/lessons/lesson_homepage.html?lesson_id="+lesson_id+"&review_mode=true";
    }
    // Lesson locked.
    else{
        alert("Leçon non débloquée.");      // TODO : message ?
        learning_state_header_text = "Bloqué";
    }
}


// Content list element.
function content_list_element(lesson_id, part_id){
    if(lesson_id == curr_learning_data["current_lesson_id"]){
        document.location.href = `/pages/lessons/${lesson_id}/lesson${lesson_id}.html?panel_id=${part_id}`;
    }
    else{
        document.location.href = `/pages/lessons/${lesson_id}/lesson${lesson_id}.html?review_mode=true&panel_id=${part_id}`;
    }
}