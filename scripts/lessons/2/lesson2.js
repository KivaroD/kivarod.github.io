// Audio linked with letter carroussel.
const carr = document.getElementsByClassName("letter_carroussel")[0];
const audio_per_letter = {"بَ" : "ba.mp3", "بُ" : "bo.mp3", "بِ" : "bi.mp3"};         // TODO : update audios with right values.
function update_audio(){
    document.getElementById("panel5_audio").setAttribute("src", "/audios/lessons/1/" + audio_per_letter[carr.children[1].innerText]);
}
carr.children[0].addEventListener("click", update_audio);
carr.children[2].addEventListener("click", update_audio);

// Validate draw button.
document.getElementById("validate_quizz_panel6").addEventListener("click", () => {
    alert("validate");
});