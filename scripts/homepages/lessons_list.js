// Check if learning preferences were set.
if(get_learning_preferences() == undefined){
    document.location.href = "/welcome.html";
}


// Opening/closing of accordeon.
function update_accordeon_state(accordeon_id){
    let accordeon_header = document.getElementById("accordeon_header_"+accordeon_id.toString());
    let accordeon_opened = accordeon_header.children[1].innerText == "-";
    if(accordeon_opened){
        accordeon_header.children[1].innerText = "+";
        document.getElementById(accordeon_header.getAttribute("lessons_list_id")).classList.add("hidden_flex");
    }
    else {
        accordeon_header.children[1].innerText = "-";
        document.getElementById(accordeon_header.getAttribute("lessons_list_id")).classList.remove("hidden_flex");
    }
}

// Creation of the list of lessons.
get_lessons().then((data) => {
    // Creation list of chapters.
    let chapters = data["chapters"];
    for(let i=0; i < chapters.length; i++){
        // Creation of element for chapter list.
        let accordeon_chapter = document.createElement("div");
        accordeon_chapter.classList.add("accordeon_chapter");
        accordeon_chapter.setAttribute("id", "accordeon_chapter_"+i.toString());
        
        // Header for chapter list.
        let accordeon_header = document.createElement("div");
        accordeon_header.classList.add("accordeon_chapter_header");
        accordeon_header.setAttribute("lessons_list_id", "lessons_list_"+i.toString());
        accordeon_header.setAttribute("id", "accordeon_header_"+i.toString());
        let chapter_title = document.createElement("p");
        chapter_title.innerText = "Chapitre " + (i+1).toString() +" : " + chapters[i];
        let plus_button = document.createElement("p");
        plus_button.innerText = "+";
        accordeon_header.appendChild(chapter_title);
        accordeon_header.appendChild(plus_button);
        accordeon_header.addEventListener("click", (event) => {
            update_accordeon_state(i);
        });
        accordeon_chapter.appendChild(accordeon_header);
        
        // Creation of list of lessons.
        let lessons_list = document.createElement("div");
        lessons_list.classList.add("accordeon_chapter_content");
        lessons_list.classList.add("hidden_flex");
        lessons_list.setAttribute("id","lessons_list_"+i.toString());
        accordeon_chapter.appendChild(lessons_list);
        document.getElementById("accordeons_container").appendChild(accordeon_chapter);
    }
    // Activation of the current accordeon.
    // accordeon_header_0
    const curr_lesson_id = get_current_lesson_data()["current_lesson_id"];
    if(curr_lesson_id < data["lessons"].length){
        document.getElementById("accordeon_header_"+data["lessons"][curr_lesson_id]["chapter"].toString()).click();
    }

    // List of lessons.
    let lessons = data["lessons"];
    for(let i=0; i < lessons.length; i++){
        // Creation of an element for the lesson and adding to list.
        let lesson = lessons[i];
        let lesson_list_element = document.createElement("a");
        lesson_list_element.href = "/pages/homepage_panels/lesson_details.html?lesson_id="+i.toString();
        lesson_list_element.innerText = "Leçon " + (i+1).toString() + " : \"" + lesson["lesson_title"] +"\"";
        lesson_list_element.style.fontFamily = "Inter";
        
        let lessons_list_id = "lessons_list_"+lesson["chapter"];
        document.getElementById(lessons_list_id).appendChild(lesson_list_element);
    }
})
