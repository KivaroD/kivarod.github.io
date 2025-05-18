let statistics = get_statistics();
if(statistics == undefined){
    document.location.href = "/homepage.html";
}

// Display of week data.
document.getElementById("time_worked_text").innerText = get_time_worked_week();
document.getElementById("ex_worked_text").innerText = get_nb_exercices_completed_week();

// Calculation of week objective.
const time_objective = parseInt(get_learning_preferences()["time_per_day"]);
if(is_daily_objective_accomplished(false)){
    document.getElementById("daily_objective").parentElement.classList.add("time_worked_objective_validated");
    document.getElementById("daily_objective").innerText = `Objectif du jour atteint (${time_objective}mn)`;
    document.getElementById("daily_objective").parentElement.children[0].setAttribute("src", "/images/logos/check-circle-fill 1.png");
}
else{
    document.getElementById("daily_objective").innerText = `Objectif du jour : ${get_time_worked_day()}/${time_objective}mn`;
}


// TODO : commentaire dynamique.


// List of lessons to review.
function review_button_function(lesson_id){
    document.location.href = `/pages/lessons/lesson_homepage.html?lesson_id=${lesson_id}&review_mode=true`;
}

// TODO : meilleur calcul des leçons à reviser.
// TODO : sort level by urgency.
// TODO : adapt to the level given in preferences.
// TODO : grouper quand il y a plsr motifs
function calculate_lessons_to_review(lessons_data){
    let lessons_review = {};
    const user_preferences = get_learning_preferences();
    Object.keys(statistics["lessons_history"]).forEach(lesson_id => {
        // If the lesson was skipped.
        if(statistics["lessons_history"][lesson_id]["skipped"]){
            if(is_lesson_to_skip(user_preferences, lessons_data, lesson_id)){
                lessons_review[lesson_id] = {
                    "type" : "skipped preferences",
                    "urgency" : "low",
                    "nb" : 1    
                }
            }
            else{
                lessons_review[lesson_id] = {
                    "type" : "skipped",
                    "urgency" : "high",
                    "nb" : 1    
                }
            }
        }
        // If many mistakes.

        // If the lesson was completed long time ago.
        // TODO : adapter niveau urgence au nombre de jours + niveau de départ + nb révisions (éventuellement enlever des trucs à réviser).
        const nb_validations = statistics["lessons_history"][lesson_id]["completions_dates"].length;
        const last_completion_date = new Date(statistics["lessons_history"][lesson_id]["completions_dates"][statistics["lessons_history"][lesson_id]["completions_dates"].length - 1]);
        const nb_days_last_completion = Math.floor(Math.abs(new Date() - last_completion_date)/(24*60*60*1000));
        if(nb_days_last_completion >= 10){
                lessons_review[lesson_id] = {
                "type" : "last review",
                "urgency" : "high",
                "nb" : nb_days_last_completion    
            }
        }
        else if(nb_days_last_completion >= 3){
                lessons_review[lesson_id] = {
                "type" : "last review",
                "urgency" : "medium",
                "nb" : nb_days_last_completion    
            }
        }
        // console.log(statistics["lessons_history"][lesson_id]);
    });
    return lessons_review;
}

function display_lessons_to_review(lessons_data,lessons_to_review){
    const keys = Object.keys(lessons_to_review);
    if(keys.length == 0){
        let no_review_text = document.createElement("a");
        no_review_text.classList.add("small");
        no_review_text.style.fontStyle = "italic";
        no_review_text.innerText = "Réviser des exercices";
        no_review_text.href = "/pages/homepage_panels/exercices_list.html";
        document.getElementById("lessons_to_review_section").appendChild(no_review_text);
        return;
    }
    const logo_colors = {"low" : "lesson_to_review_low", "medium" : "lesson_to_review_medium", "high" : "lesson_to_review_high"};
    for(let i=0; i<keys.length; i++){
        let lesson = lessons_data["lessons"][keys[i]];
        let lesson_to_review_div = document.createElement("div");
        
        // Logo.
        let lesson_image = document.createElement("img");
        lesson_image.src = lesson["lesson_logo"];
        lesson_to_review_div.appendChild(lesson_image);

        // Titles div.
        let titles_div = document.createElement("div");
        titles_div.classList.add("lesson_review_text");

        // Titles.
        let title_container = document.createElement("div");
        title_container.classList.add("lesson_to_review_title");
        titles_div.appendChild(title_container);
        lesson_to_review_div.appendChild(titles_div);
        let lesson_title = document.createElement("p");
        lesson_title.classList.add("small");
        lesson_title.classList.add("lesson_to_review_title_lesson");
        lesson_title.innerText = "Leçon " + (parseInt(keys[i])+1).toString() + " : ";
        let error_content = document.createElement("p");
        if(lessons_to_review[keys[i]]["type"] == "skipped"){
            error_content.innerText = "passée";
        }
        if(lessons_to_review[keys[i]]["type"] == "skipped preferences"){
            error_content.innerText = "à découvrir";
        }
        else if(lessons_to_review[keys[i]]["type"] == "errors"){
            if(lessons_to_review[keys[i]]["nb"] == 1){
                error_content.innerText = "1 erreur";
            }
            else{
                error_content.innerText = lessons_to_review[keys[i]]["nb"]  + " erreurs";
            }
        }
        else if(lessons_to_review[keys[i]]["type"] == "last review"){
            error_content.innerText = "terminée il y a " + lessons_to_review[keys[i]]["nb"];
            // TODO : meilleur affichage (calcul nb mois, nb semaines)
            if(lessons_to_review[keys[i]]["nb"] == 1){
                error_content.innerText += " jour";
            }
            else{
                error_content.innerText += " jours";
            }
        }
        lesson_image.classList.add(logo_colors[lessons_to_review[keys[i]]["urgency"]]);
        error_content.classList.add("small");
        title_container.appendChild(lesson_title);
        title_container.appendChild(error_content);

        // Review button.
        let review_button = document.createElement("div");
        review_button.classList.add("secondary_button");
        review_button.innerText = "Réviser";
        review_button.addEventListener("click", ()=> {
            review_button_function(keys[i]);
        });
        titles_div.appendChild(review_button);

        lesson_to_review_div.classList.add("lesson_to_review");
        document.getElementById("lessons_to_review_section").appendChild(lesson_to_review_div);
    }    
}
get_lessons().then((data) => {
    const lessons_to_review = calculate_lessons_to_review(data["lessons"]);
    display_lessons_to_review(data, lessons_to_review);
})


// Graph.
function update_graph_content(content_type){
    // Getting of data.
    const fetched_data = get_data_graph(content_type);
    let labels = fetched_data[0];
    let data = fetched_data[1];

    // Creation of graph.
    ctx = document.createElement("canvas");
    ctx.id = "graph";
    document.getElementById("graph_div").innerHTML = "";
    document.getElementById("graph_div").appendChild(ctx);

    // Display of graph.
    new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
              label: '',
            data: data,
            borderWidth: 1
          }]
        },
      });      
}
update_graph_content(document.getElementById("statistic_graph_select").value);
document.getElementById("statistic_graph_select").addEventListener("change", (event)=>{
    update_graph_content(event.target.value);
});
