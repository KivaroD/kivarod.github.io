// Audio play button.
const speak_buttons = document.getElementsByClassName("speak_button");
function play_audio_button(button){
    const audio_source = document.getElementById(button.children[0].getAttribute("audio_source"));
    if(audio_source.getAttribute("src") != ""){
        audio_source.play();
    }
}
for(let i=0; i<speak_buttons.length; i++){
    speak_buttons[i].onclick = () => {play_audio_button(speak_buttons[i])};
}


// Audio record button.
const register_buttons = document.getElementsByClassName("register_button");
for(let i=0; i<register_buttons.length; i++){   
    register_buttons[i].onclick = (event) => {record_mic_audio(register_buttons[i]);}
}

function record_mic_audio(register_button){
    navigator.getUserMedia({ audio: true }, (media_stream_obj) => {    
        // Starting of the record.  
        let audio = new Audio();
        if ("srcObject" in audio) {
          audio.srcObject = media_stream_obj;
        }
        else {
          audio.src = window.URL.createObjectURL(media_stream_obj);
        }
        let media_recorder = new MediaRecorder(media_stream_obj);
        media_recorder.start();

        // Storing of audio chuncks.
        let audio_chunks = [];
        media_recorder.ondataavailable = function (ev) {
          audio_chunks.push(ev.data);
        }
        
        // Stop event.
        const audio_player_object = document.getElementById(register_button.getAttribute("audio_player"));
        media_recorder.onstop = () => {
            // Creation of the audio file.
            let audio_data = new Blob(audio_chunks, { 'type': 'audio/mp3;' });
            audio_chunks = [];
            let audio_src = window.URL.createObjectURL(audio_data);
            audio_player_object.setAttribute("src", audio_src);
            
            // Stopping of the audio sources.
            media_stream_obj.getTracks().forEach(track => {
                track.stop()
                track.enabled = false
            })
            const context = new AudioContext()
            context.close
            const mic = context.createMediaStreamSource(media_stream_obj)
            mic.disconnect

            // Update of the click event.
            register_button.onclick = () => {record_mic_audio(register_button);}

            // Update of the display.
            register_button.classList.remove("register_button_recording");
            register_button.children[0].setAttribute("src", "/images/logos/mic-fill1.png");
            audio_player_object.parentElement.classList.remove("disabled_button");
            audio_player_object.parentElement.onclick = () => {play_audio_button(audio_player_object.parentElement);}
        }
        register_button.onclick = () => {
            media_recorder.stop();
        }

        // Update of the display.
        register_button.classList.add("register_button_recording");
        register_button.children[0].setAttribute("src", "/images/logos/square-fill.png");
        audio_player_object.parentElement.classList.add("disabled_button");
        audio_player_object.parentElement.onclick = () => {console.log("recording");}
    }, 
    (e) => {
        // Error
        console.log(e);
    });
}


// Letter caroussel.
function letter_carroussel_arrows(carroussel, n, letters){
    if(carroussel.children.length >= 3){
        let new_index;
        if(letters.includes(carroussel.children[1].innerText)){
            new_index = (letters.indexOf(carroussel.children[1].innerText) + n + letters.length) % letters.length;
        }
        else{
            new_index = 0;
        }
        carroussel.children[1].innerText = letters[new_index];
    }
}
const letter_carroussels = document.getElementsByClassName("letter_carroussel");
for(let i=0; i<letter_carroussels.length; i++){
    const letters = letter_carroussels[i].getAttribute("carroussel_letters").split(",");
    letter_carroussels[i].children[0].addEventListener("click", (event) => {letter_carroussel_arrows(letter_carroussels[i], -1, letters)});
    letter_carroussels[i].children[2].addEventListener("click", (event) => {letter_carroussel_arrows(letter_carroussels[i], 1, letters)});
}


// Writing area.
const eraze_area_buttons = document.getElementsByClassName("eraze_write_button");
for(let i=0; i<eraze_area_buttons.length; i++){
    eraze_area_buttons[i].addEventListener("click", () => {
        console.log(eraze_area_buttons[i].parentElement);
    });
}


// Letter quizz.
function array_shuffle(array, return_permutation){
    let shuffled_array = [];
    let permutation = {};

    // Copy of the array.
    let array_copy = [];
    for(let j=0; j<array.length; j++){
        array_copy.push(array[j]);
    }

    // Creation of the shuffled array.
    let nb_elts = array.length;
    for(let j=0; j<array.length; j++){
        const index = Math.floor(Math.random() * nb_elts);
        shuffled_array.push(array_copy[index]);
        permutation[array.indexOf(array_copy[index])] = j;
        array_copy.splice(index, 1); 
        nb_elts--;
    } 
    if(return_permutation == true){
        return [shuffled_array, permutation];
    }
    return shuffled_array;
}

const letter_quizz_containers = document.getElementsByClassName("letter_quiz_container");
for(let i=0; i<letter_quizz_containers.length; i++){
    // Getting of parameters.
    const awnsers = letter_quizz_containers[i].getAttribute("choices").split(",");
    const awnser_str = awnsers[0];
    const choices = array_shuffle(awnsers);
    
    // Calculation of the size of the div.
    const nbcols = parseInt(letter_quizz_containers[i].getAttribute("ncols"));
    let nbrows = Math.floor(choices.length/nbcols);
    if((choices.length + nbcols)%nbcols != 0){
        nbrows++;
    }

    // Creation of the form.
    for(let j=0; j<nbrows;j++){                             // Creation of the rows.
        let row = document.createElement("div");
        row.classList.add("awnser_row");
        letter_quizz_containers[i].appendChild(row);
    }
    for(let j=0; j<choices.length;j++){
        // Creation of the buttons.
        let letter_button = document.createElement("div");
        letter_button.setAttribute("value", j);
        letter_button.classList.add("letter_option");
        letter_button.classList.add("option_not_selected");
        letter_button.innerText = choices[j];
        letter_quizz_containers[i].children[Math.floor(j/nbcols)].appendChild(letter_button);
        
        // Letter button click.
        letter_button.addEventListener("click", () => {
            const previous_choice = parseInt(letter_quizz_containers[i].getAttribute("selected_option"))
            letter_quizz_containers[i].setAttribute("selected_option",j);
            if(previous_choice >= 0 && previous_choice < choices.length){
                letter_quizz_containers[i].children[Math.floor(previous_choice/nbcols)].children[previous_choice%nbcols].classList.remove("option_selected");
                letter_quizz_containers[i].children[Math.floor(previous_choice/nbcols)].children[previous_choice%nbcols].classList.add("option_not_selected");
            }
            letter_button.classList.add("option_selected");
            letter_button.classList.remove("option_not_selected");
            document.getElementById(letter_quizz_containers[i].getAttribute("resp_display_text_id")).innerText = "";
        });
    }

    // Validate button.
    document.getElementById(letter_quizz_containers[i].getAttribute("validate_button_id")).addEventListener("click", () => {
        if(parseInt(letter_quizz_containers[i].getAttribute("selected_option")) == choices.indexOf(awnser_str)){
            document.getElementById(letter_quizz_containers[i].getAttribute("resp_display_text_id")).innerText = "Bonne réponse !";
            document.getElementById(letter_quizz_containers[i].getAttribute("resp_display_text_id")).classList.add("right_awnser_text");
            document.getElementById(letter_quizz_containers[i].getAttribute("resp_display_text_id")).classList.remove("wrong_awnser_text");
            document.getElementById(letter_quizz_containers[i].getAttribute("validate_button_id")).classList.add("hidden_flex");
            validate_panel_exercice();
        }    
        else{
            document.getElementById(letter_quizz_containers[i].getAttribute("resp_display_text_id")).innerText = "Mauvaise réponse, réessayez.";
            document.getElementById(letter_quizz_containers[i].getAttribute("resp_display_text_id")).classList.remove("right_awnser_text");
            document.getElementById(letter_quizz_containers[i].getAttribute("resp_display_text_id")).classList.add("wrong_awnser_text");
            if(letter_quizz_containers[i].getAttribute("selected_option") != ""){
                register_ex_error();
            }
        }
    });
    letter_quizz_containers[i].setAttribute("awnser", " ");
}


// Connect exercice.
