/////////////////////////
// Local storage keys  //
/////////////////////////

// learning_prefs -> preferences in learning (for custom program).
// current_lesson_data -> data of the current lesson.
// learning_statistics -> statistics about activity.

function initialize_all_data(force){
    if(get_current_lesson_data() == undefined || force == true){
        initialize_current_lesson_data();
    }
    if(get_statistics() == undefined || force == true){
        initialize_statistics();
    }
}

function update_storage_key_json(key,data){
    localStorage[key] = JSON.stringify(data);   
}


///////////////////////////
// Learning preferences  //
///////////////////////////

function get_learning_preferences(){
    // TODO : test validity of object.
    /*
    {
        "current_level" : undefined, 
        "objectives" : [], 
        "time_per_day" : ...mn
    }
    */
   if(localStorage["learning_prefs"] != undefined){
        return JSON.parse(localStorage["learning_prefs"]);
   }
   return undefined;
}

function save_learning_preferences(preferences){
    update_storage_key_json("learning_prefs", preferences);
}


////////////////////////////////
// Data about current lesson  //
////////////////////////////////

function get_current_lesson_data(){
    // TODO : test validity of object.
    /*
    {
        "current_lesson_id" : ...,
        "current_page_id" : -1,...,
        "current_lesson_content" : {},
    }
    */
    if(localStorage["current_lesson_data"] != undefined){
        return JSON.parse(localStorage["current_lesson_data"]);
    }
    return undefined;
}


function initialize_current_lesson_data(){
    update_storage_key_json("current_lesson_data", {
        "current_lesson_id" : 0,
        "current_page_id" : -1,
        "current_lesson_content" : {},
        "learning_time_per_panel" : {}
    });
}



//////////////////
// Statistics  //
/////////////////

// Initialization of structures.
function initialize_statistics(){
    update_storage_key_json("learning_statistics",
        {
            "exercices_history" : {
            },

            "lessons_history" : {

            },

            "activity_history" : {
                
            },

            "notification_history" : {
                "daily_objective_completed" : []
            }
        }
    );
}

// Getters.
function get_statistics(){
    // TODO : test validity of object.
    /*
        {
            -> dates with exercices realized and detailed data.
            "lessons_history" : {
                <lesson_id> : {
                    "date_of_first_completion" : <date_str>,
                    "completions_dates" : [<date str>,...],
                    "time_spent" : [],
                    "skipped" : true/false
                }
            }

            -> dates with exercices realized and detailed data.
            "exercices_history" : [
                "lesson_id-ex_id" : {
                    "date_of_first_completion" : <date_str>,
                    "completions_dates" : [<date str>,...],
                    "time_spent" : [],
                    "score" : []
                }
                ...
            ],

            -> time spent learning by day. 
            "activity_history" : {
                <date> : <time in second>
            }
        }
    */
    if(localStorage["learning_statistics"] != undefined){
        return JSON.parse(localStorage["learning_statistics"]);
   }
   return undefined;
}

//////////////////////////////////////////
// Management learning time

// Data about activity history.
function date_to_iso_str(date){
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = date.getFullYear();
    return yyyy + "-" + mm + "-" + dd;

}

function get_today_date_str(){
    let date = new Date();
    return date_to_iso_str(date);
}

function get_dates_of_week_iso(date){  
    // Calculation of closest monday.
    let nb_previous_day = (date.getDay() - 1)
    if(nb_previous_day < 0 ){
        nb_previous_day += 7;    
    }
    increment_date(date, -nb_previous_day);
    
    // Iteration of all the days.
    let dates = [];
    for(let i=0; i<7; i++){
        let date_str = date_to_iso_str(date);
        dates.push(date_str);
        increment_date(date, 1);
    }
    return dates;
}

function increment_date(date,incr){
    date.setTime(date.getTime() + incr * 86400000);
}


// Getting of time worked per week.
function format_time_learned(seconds_learned){
    if(seconds_learned < 60){                                   // s.
        return seconds_learned.toString() + "s";
    }
    else if(seconds_learned >= 60 && seconds_learned<3600){     //mn.
        let nb_mins = Math.trunc(seconds_learned/60).toString();
        let nb_seconds = (seconds_learned-60*nb_mins).toString().padStart(2, '0');
        return nb_mins+"mn"+nb_seconds+"s";
    }
    else{                                                       // h.
        let nb_hours = Math.trunc(seconds_learned/3600).toString();
        let nb_mins = Math.trunc((seconds_learned - 3600*nb_hours)/60).toString().padStart(2, '0');
        return nb_hours+"h"+nb_mins+"mn";
    }
}


function get_time_worked_week(return_as_int){
    // Getting of time worked.
    let days_week = get_dates_of_week_iso(new Date(get_today_date_str()));
    let stats_activity_hist = get_statistics()["activity_history"];
    let keys = Object.keys(stats_activity_hist);
    let seconds_learned = 0;
    for(let i=0; i<7; i++){
        if(keys.includes(days_week[i])){
            seconds_learned += stats_activity_hist[days_week[i]];
        }
    }
    if(return_as_int == true){
        return seconds_learned;
    }

    // Formatting as string.
    return format_time_learned(seconds_learned);
}

function get_time_worked_day(return_as_int){
    // Getting of time worked.
    let stats_activity_hist = get_statistics()["activity_history"];
    let keys = Object.keys(stats_activity_hist);
    let seconds_learned = 0;
    const day = get_today_date_str();
    if(keys.includes(day)){
        seconds_learned += stats_activity_hist[day];
    }
    if(return_as_int == true){
        return seconds_learned;
    }

    // Formatting as string.
    return format_time_learned(seconds_learned);
}

// Increasing daily learning time.
function update_daily_activity(nb_seconds, is_review, container){
    let date_str = get_today_date_str();
    let statistics = get_statistics();
    let days_of_hist = Object.keys(statistics["activity_history"]);
    if(!days_of_hist.includes(date_str)){
        statistics["activity_history"][date_str] = 0;
    }
    statistics["activity_history"][date_str] = statistics["activity_history"][date_str] +  nb_seconds;

    if(!is_review){
        let stats = get_current_lesson_data();
        if(Object.keys(stats["learning_time_per_panel"]).includes(current_panel_id.toString())){
            stats["learning_time_per_panel"][current_panel_id] = stats["learning_time_per_panel"][current_panel_id] + nb_seconds;
        }
        else{
            stats["learning_time_per_panel"][current_panel_id] =  nb_seconds;
        }
        update_storage_key_json("current_lesson_data", stats);
    }
    else{
        if(Object.keys(container).includes(current_panel_id.toString())){
            container[current_panel_id] = container[current_panel_id] + nb_seconds;
        }
        else{
            container[current_panel_id] =  nb_seconds;
        }
    }

    update_storage_key_json("learning_statistics", statistics);
}


let learning_time_interval = null;
function start_learning_time_count(is_review, container){
    if(learning_time_interval == null){
        learning_time_interval = setInterval(() => {
            update_daily_activity(1, is_review, container);
        }, 1000);
    }
}
function stop_learning_time_count(){
    clearInterval(learning_time_interval);
    learning_time_interval = null;
}


//////////////////////////////////////////
// Management nb exercices done

function add_exercice_completed_today(lesson_id, exercice_id, score, time_spent){
    const date_str = get_today_date_str();
    const ex_stats = get_statistics();
    get_lessons().then((lessons_data) => {
        lesson_id = parseInt(lesson_id);
        exercice_id = parseInt(exercice_id);
        if(lesson_id < lessons_data["lessons"].length && exercice_id < lessons_data["lessons"][lesson_id]["lesson_exercices"].length){
            let key = lesson_id.toString() + "-" + exercice_id.toString();
            if(Object.keys(ex_stats["exercices_history"]).includes(key)){
                ex_stats["exercices_history"][key]["completions_dates"].push(date_str);
                ex_stats["exercices_history"][key]["time_spent"].push(time_spent);
                ex_stats["exercices_history"][key]["score"].push(score);
            }
            else{
                ex_stats["exercices_history"][key] = { 
                    "date_of_first_completion" : date_str,
                    "completions_dates" : [date_str],
                    "time_spent" : [time_spent],
                    "score" : [score]
                }
            }
            update_storage_key_json("learning_statistics", ex_stats);
        }
        else{
            console.log("invalid parameters");
        }
    });
}


function get_exercices_completed_per_day(return_numbers, week_str){
    /*
    {
        "date_str" : [
            ["lesson_id-ex_id", id dans liste completion index],
            ...
        ]
    }
    */
    let ex_data = get_statistics()["exercices_history"];
    let exercices_keys = Object.keys(ex_data);
    let nb_exs_completed = {};
    for(let i=0; i<exercices_keys.length; i++){
        // { date_of_first_completion: "...", completions_dates: ["...",...], time_spent: [...,...], score: [...,...] }
        let data = ex_data[exercices_keys[i]];
        for(let j=0; j<data["completions_dates"].length; j++){
            if(week_str == undefined || (week_str[0] <= data["completions_dates"][j] && week_str[6] >= data["completions_dates"][j])){
                if(Object.keys(nb_exs_completed).includes(data["completions_dates"][j])){
                    if(!return_numbers){
                        nb_exs_completed[data["completions_dates"][j]].push([exercices_keys[i],j]);
                    }
                    else{
                        nb_exs_completed[data["completions_dates"][j]] = nb_exs_completed[data["completions_dates"][j]] + 1;
                    }
                }
                else{
                    if(!return_numbers){
                        nb_exs_completed[data["completions_dates"][j]] = [[exercices_keys[i],j]];
                    }
                    else{
                        nb_exs_completed[data["completions_dates"][j]] = 1;
                    }
                }
            }
        }
    }
    return nb_exs_completed;
}


function get_nb_exercices_completed_week(date_str, return_as_int){
    if(date_str == undefined){
        date_str = get_today_date_str();
    }
    let days_week = get_dates_of_week_iso(new Date(date_str));
    let ex_completed = get_exercices_completed_per_day(true, days_week);
    let nb_exs = 0;
    let keys = Object.keys(ex_completed);
    for(let i=0; i<keys.length; i++){
        nb_exs += ex_completed[keys[i]];
    }
    if(return_as_int != undefined){
        return nb_exs;
    }
    if(nb_exs >= 99){
        return nb_exs.toString()+"+";
    }
    return nb_exs.toString();
}

function was_exercice_completed(lesson_id, exercice_id){
   return Object.keys(get_statistics()["exercices_history"]).includes(lesson_id.toString()+"-"+exercice_id.toString());
}

function average(list_scores){
    if(list_scores.length == 0){
        return 0;
    }
    let sum = 0;
    list_scores.forEach(elem => {sum+=elem});
    return sum / list_scores.length;
}

function calculate_exercice_first_completion_score(lesson_id, lesson_exercices,is_review){
    const exercices_stats = get_statistics()["exercices_history"];
    const exercice_keys = Object.keys(exercices_stats);
    let sum_average_by_exercice = 0;
    let nb_exercices = 0;
    for(let i=0; i<lesson_exercices.length; i++){
        const key = lesson_id.toString()+"-"+i.toString();
        if(exercice_keys.includes(key)){
            if(Object.keys(exercices_stats[key]).includes("score") && exercices_stats[key]["score"].length > 0){
                if(is_review){
                    sum_average_by_exercice += average(exercices_stats[key]["score"][exercices_stats[key]["score"].length - 1]);
                }
                else{
                    sum_average_by_exercice += average(exercices_stats[key]["score"][0]);
                }
                nb_exercices ++;
            }
        }
    }
    if(nb_exercices == 0){
        return 0;
    }
    return sum_average_by_exercice / nb_exercices;
}

function calculate_exercice_average_score(lesson_id, exercice_id){
    return -1;
}


//////////////////////////////////////////
// Management lessons completed

function add_lesson_completed_today(lesson_id, time_spent, skipped){
    let statistics = get_statistics();
    if(Object.keys(statistics["lessons_history"]).includes(lesson_id.toString()) && !statistics["lessons_history"][lesson_id]["skipped"]){    // Ex already completed.
        statistics["lessons_history"][parseInt(lesson_id)]["completions_dates"].push(get_today_date_str());
        statistics["lessons_history"][parseInt(lesson_id)]["time_spent"].push(time_spent);
        statistics["lessons_history"][parseInt(lesson_id)]["skipped"] = skipped;
    }
    else{                                               // First completion.
        const date = get_today_date_str();
        statistics["lessons_history"][parseInt(lesson_id)] = {
            "date_of_first_completion" : date,
            "completions_dates" : [date],
            "time_spent" : [time_spent],
            "skipped" : skipped
        };
    }
    update_storage_key_json("learning_statistics", statistics);
}

function get_new_lessons_completed(only_new_lesson){
    // TODO compte nouvelles leçons complétées (warning ne pas compter skips)
    const learning_stats = get_statistics()["lessons_history"];
    
    let lessons_per_day = {};
    Object.keys(learning_stats).keys().forEach(lesson_id => {
        let completion_dates = [];
        if(only_new_lesson && (!learning_stats[lesson_id]["skipped"] || learning_stats[lesson_id]["skipped"])){
            completion_dates = [learning_stats[lesson_id]["date_of_first_completion"]];           
        }
        else if(!only_new_lesson && !learning_stats[lesson_id]["skipped"]){
            completion_dates =  learning_stats[lesson_id]["completions_dates"];
        }
        else{
            completion_dates = [];
        }
        completion_dates.forEach(date => {
            if(Object.keys(lessons_per_day).includes(date)){
                lessons_per_day[date].push(lesson_id);
            }
            else{
                lessons_per_day[date] = [lesson_id];
            }
        });
    });
    return lessons_per_day;
}

function get_nb_new_lessons_completed(only_new_lesson){
    const dates_and_lessons_completed = get_new_lessons_completed(only_new_lesson);
    let sorted_dates = Object.keys(dates_and_lessons_completed);
    sorted_dates.sort();

    let results = {};
    sorted_dates.forEach(date => {
        results[date] =  dates_and_lessons_completed[date].length;
    })
    return results;
}


//////////////////////////////////////////
// Management of notifications


function save_notification_daily_objective(stats,date){
    if(stats == undefined){
        stats = get_statistics();
    }
    if(date == undefined){
        date = get_today_date_str();
    }
    if(!stats["notification_history"]["daily_objective_completed"].includes(date)){
        stats["notification_history"]["daily_objective_completed"].push(date);
    }
    update_storage_key_json("learning_statistics", stats);
}

function is_daily_objective_accomplished(send_notif){
    const statistics = get_statistics();
    const activity_stats = get_statistics()["activity_history"];
    const today_date = get_today_date_str();
    if(Object.keys(activity_stats).includes(today_date) && (!send_notif || !statistics["notification_history"]["daily_objective_completed"].includes(today_date))){
        return activity_stats[today_date] >= get_learning_preferences()["time_per_day"]*60;
    }
    return false;
}


//////////////////////////////////////////
// Graph data


function get_data_graph(content_type){
    let stats;
    if(content_type == "nb_lessons"){
        stats = get_nb_new_lessons_completed(true);
    }
    else if(content_type == "nb_exs"){
        stats = get_exercices_completed_per_day(true);
    }
    else if(content_type == "learning_time"){
        stats = get_statistics()["activity_history"];
    }
    else{
        return [[],[]];
    }
    let days = Object.keys(stats);
    days.sort();
    let dates = [];
    let values = [];
    // TODO : complete dates between with 0.
    // TODO : adapt the period plotted (ex : each week, month,... depending on the day) => adapt filling of 0.
    // TODO : modify date format.
    if(days.length > 0){
        let min_date = new Date(days[0]);
        let max_date = new Date(days[days.length-1]);
        let nb_days_diff = Math.round((max_date-min_date)/(3600*24*1000));
        dates.push(days[0]);
        values.push(stats[days[0]]);
        for(let i=1; i<nb_days_diff; i++){
            increment_date(min_date, 1);
            let str_min_date = date_to_iso_str(min_date);
            if(days.includes(str_min_date)){
                dates.push(days[i]);
                values.push(stats[days[i]]);
            }
            else{
                dates.push(str_min_date);
                values.push(0);
            }
        }
        dates.push(days[days.length-1]);
        values.push(stats[days[days.length-1]]);    
    } 
    return [dates, values];
}
