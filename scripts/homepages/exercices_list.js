// Custom training inputs.
function incr_lesson_duration(event, incr){
    let score_value = Math.max(1, parseInt(event.target.parentElement.getAttribute("value")) + incr);
    event.target.parentElement.setAttribute("value", score_value);
    event.target.parentElement.children[1].innerText = (score_value).toString()+"mn";
}

for(let i=0; i<2; i++){
    document.getElementsByClassName("custom_duration_div")[i].children[0].addEventListener("click", (event) => {
        incr_lesson_duration(event, -1);
    });
    document.getElementsByClassName("custom_duration_div")[i].children[2].addEventListener("click", (event) => {
        incr_lesson_duration(event, 1);
    });
}

document.getElementById("revise_difficulties").addEventListener("click", (event) => {
    alert("revise difficulties");
});
document.getElementById("revise_finished").addEventListener("click", (event) => {
    alert("revise finished");
});


// Getting of exercice data.
let exercices_list = [];
let lessons = [];
let exercices_by_type = {};
let exercices_by_lesson = {};
get_lessons().then((data) => {
    for(let i=0; i<data["lessons"].length; i++){
        let lesson = data["lessons"][i];
        lessons.push(lesson);
        exercices_by_lesson[i] = [];
        for(let j=0; j<lesson["lesson_exercices"].length; j++){
            let exercice = lesson["lesson_exercices"][j];
            if(Object.keys(exercices_by_type).includes(exercice["type"])){
                exercices_by_type[exercice["type"]].push([i,j]);
            }
            else{
                exercices_by_type[exercice["type"]] = [[i,j]];
            }
            exercices_by_lesson[i].push(exercice);
        }
    }
    update_filter_elements();
    list_of_exercices_by_lesson();
})


// Filter inputs
document.getElementById("filter_div_header").addEventListener("click", (event) => {
    if(document.getElementById("filter_div_header").getAttribute("state") == "close"){
        // alert("open");
        document.getElementById("filter_div_header").setAttribute("state","open");
        document.getElementById("filter_header_arrow").classList.add("filter_header_arrow_rotated");
        document.getElementById("filter_div_options").classList.remove("hidden");
    }
    else{
        // alert("close");
        document.getElementById("filter_div_header").setAttribute("state","close");
        document.getElementById("filter_header_arrow").classList.remove("filter_header_arrow_rotated");
        document.getElementById("filter_div_options").classList.add("hidden");
    }
});

function update_filter_elements(){
    let exs_types = Object.keys(exercices_by_type);
    for(let i=0; i< exs_types.length; i++){
        let element_div = document.createElement("div");
        element_div.classList.add("filter_ex_type_elem");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.id = "type_" + i.toString();
        element_div.appendChild(checkbox);
        let label = document.createElement("label");
        label.setAttribute("for", checkbox.id);
        label.innerText = exs_types[i];
        label.classList.add("small_small");
        label.classList.add("no_underline");
        element_div.appendChild(label);
        element_div.setAttribute("type_id",i);
        document.getElementById("filter_ex_types_div").appendChild(element_div);
        checkbox.addEventListener("change", update_exercices_list_filter);
    }
}

function list_of_exercices_by_lesson(){
    for(let i=0; i < get_current_lesson_data()["current_lesson_id"]; i++){
        let lesson = lessons[i];
        let lesson_exs_section = document.createElement("div");
        
        let title_header = document.createElement("div");
        title_header.classList.add("exercices_lesson_header");
        
        let logo_url = lesson["lesson_logo"];
        let lesson_logo = document.createElement("img");
        lesson_logo.src = logo_url;
        title_header.appendChild(lesson_logo);
            
        let lesson_title = document.createElement("p");
        lesson_title.innerText = (i+1).toString() + ") \"" + lesson["lesson_title"]+ "\"";
        title_header.appendChild(lesson_title);
        lesson_exs_section.appendChild(title_header);
        document.getElementById("exercice_by_lesson_div").appendChild(lesson_exs_section);
        
        let exs_list = document.createElement("div");
        exs_list.classList.add("lesson_exercices_list");
        if(lesson["lesson_exercices"].length == 0){
            let no_ex_text = document.createElement("p");
            no_ex_text.innerText = "Pas d’exercice";
            no_ex_text.classList.add("small_small");
            exs_list.appendChild(no_ex_text);
        }
        for(let j=0; j<lesson["lesson_exercices"].length; j++){
            let ex_element = document.createElement("p");

            const ex_avg_score = calculate_exercice_average_score(i, j);
            if(ex_avg_score < 0){
                ex_element.innerText = lesson["lesson_exercices"][j]["name"];
            }
            else{
                ex_element.innerText = `${lesson["lesson_exercices"][j]["name"]} (score moyen : ...)`;
            }
            ex_element.classList.add("small");
            ex_element.classList.add("lesson_element");
            ex_element.id = "lesson_" + i.toString() + "_ex_" + j.toString();
            exs_list.appendChild(ex_element);
            ex_element.addEventListener("click", (event) => {
                document.location.href = `/pages/lessons/${i}/lesson${i}.html?review_mode=true&panel_id=${lesson["lesson_exercices"][j]["panel_id"]}&exercice_review=true`;
            });
        }
        lesson_exs_section.appendChild(exs_list);
    }
}

function update_exercices_list_filter(event){
    let type_id = (parseInt(event.target.parentElement.getAttribute("type_id")));  
    if(type_id < Object.keys(exercices_by_type).length){
        let lessons_to_process = exercices_by_type[Object.keys(exercices_by_type)[type_id]];
        let action ="hide";
        if(event.target.checked){
            action = "show";
        }
        for(let i=0; i<lessons_to_process.length; i++){
            let lesson_id = "lesson_" + lessons_to_process[i][0].toString() + "_ex_" + lessons_to_process[i][1].toString();
            if(action == "hide"){
                document.getElementById(lesson_id).classList.add("hidden");
            }
            else{
                document.getElementById(lesson_id).classList.remove("hidden");
            }
        }
    }
}
