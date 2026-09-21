// ------------------------------------
// DOM ACCESS
// ------------------------------------

let schedules =
    document.querySelectorAll(".schedule");

let saved =
    document.getElementById("saved");

let clearBtn =
    document.getElementById("clearBtn");


// ------------------------------------
// LOAD SAVED PREFERENCE
// ------------------------------------

let savedSchedule =
    localStorage.getItem("selectedSchedule");


if (savedSchedule != null) {

    saved.classList.add("active");
    saved.textContent =
        "Saved Schedule: " +
        savedSchedule;

    schedules.forEach(function(row) {
        if (row.getAttribute("data-info") === savedSchedule) {
            row.classList.add("selected");
        }
    });

}


// ------------------------------------
// CLICK EVENT
// ------------------------------------

schedules.forEach(function(row) {

    row.setAttribute("tabindex", "0");
    row.setAttribute("role", "button");

    function chooseSchedule() {

        let schedule =
            row.getAttribute("data-info");

        localStorage.setItem(
            "selectedSchedule",
            schedule
        );

        sessionStorage.setItem(
            "currentSchedule",
            schedule
        );

        saved.classList.add("active");
        saved.textContent =
            "Selected Schedule: " +
            schedule;

        schedules.forEach(function(item) {
            item.classList.remove("selected");
        });

        row.classList.add("selected");
    }

    row.addEventListener(
        "click",
        function() {
            chooseSchedule();

        }
    );

    row.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            chooseSchedule();
        }
    });

});


// ------------------------------------
// CLEAR BUTTON
// ------------------------------------

clearBtn.addEventListener(
    "click",
    function() {


        // Remove localStorage

        localStorage.removeItem(
            "selectedSchedule"
        );


        // Remove sessionStorage

        sessionStorage.removeItem(
            "currentSchedule"
        );


        // Clear message

        saved.classList.remove("active");
        saved.textContent =
            "Saved preferences cleared.";


        // Remove row highlight

        schedules.forEach(
            function(row) {

                row.classList.remove("selected");

            }
        );

    }
);