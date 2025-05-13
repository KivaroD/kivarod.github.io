// Adaptation of display for the PWA.
const is_pwa = new URL(document.location.href).searchParams.get('source') == "pwa";

if(!is_pwa){
    document.getElementById("begin_button").addEventListener("click", (event) => {
        if(deferredPrompt == undefined){
            document.getElementById("install_app_popup").classList.remove("hidden");
            document.getElementById("install_app_popup").style.opacity = 1;
        }
        else{
            deferredPrompt.prompt().then((res) => {
                if(res.outcome == "accepted"){              // "accepted", "dismissed"
                    alert("Installation intallée avec succès sur votre bureau.");
                }
            });
        }
    });
}
else{
    document.getElementById("begin_button").parentNode.removeChild(document.getElementById("begin_button"));
    document.getElementById("online_version_button").children[0].innerText = "Débuter votre aventure";
    document.getElementById("online_version_button").style.marginTop = "32px";
}
document.getElementById("close_app_install_tutorial").addEventListener("click", () => {
    document.getElementById("install_app_popup").classList.add("hidden");
});
document.getElementById("back_popup_button").addEventListener("click", () => {
    document.getElementById("install_app_popup").classList.add("hidden");
});

document.getElementById("online_version_button").addEventListener("click", () => {
    if(is_pwa){
        document.location.href="/pages/preferences_config_form/welcome_pref_choice.html?source=pwa";
    }
    else{
        document.location.href="/pages/preferences_config_form/welcome_pref_choice.html";
    }
});
/*
// Button event listener.
document.getElementById("lang_button").addEventListener("click", (event) => {
    alert("lang");
});

document.getElementById("help_button").addEventListener("click", (event) => {
    alert("help");
});
*/

// Auto redirection if register already done.
learning_preferences = get_learning_preferences();
if(learning_preferences != undefined && is_pwa){
    document.location.href = "/homepage.html?source=pwa"
}
else if(learning_preferences != undefined){
    document.location.href = "/homepage.html"
}

// Registering of Service Worker
window.addEventListener("load", () => {
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("/sw.js");
    }
});
