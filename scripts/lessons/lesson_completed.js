// Buttons.
document.getElementById("end_button").addEventListener("click", () => {
    document.location.href = "/homepage.html";
});
document.getElementById("next_lesson_button").addEventListener("click", () => {
    document.location.href = "/pages/lessons/lesson_homepage.html?lesson_id="+get_current_lesson_data()["current_lesson_id"].toString();
});
document.getElementById("revise_button").addEventListener("click", () => {
    // TODO
    alert("revise button");
});

// Adaptation of the display for review mode.
if(is_review_mode){
    document.getElementById("next_lesson_button").classList.add("hidden_flex");
    document.getElementById("revise_button").children[0].innerText = "Faire un exercice de révision";
}

// Update of score.
const score = parseInt(new URL(document.location.href).searchParams.get('score'));
if(score >= 0){
    document.getElementById("exercice_note").innerText = `Note exercices : ${score.toString()}%`;
}
else{
    document.getElementById("exercice_note").classList.add("hidden");
}
