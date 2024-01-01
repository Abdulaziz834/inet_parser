const placer = document.querySelector(".placer"),
    inputsObj = Object.values(document.querySelectorAll("input[type=radio]")),
    template = document.querySelector("template#lesson");
let previousRadio = document.querySelector("input[type=radio]:checked"),
    weekNumber = 0,
    touchStart;

function changePlacer(target) {
    placer.style.width = target.offsetWidth + "px"
    placer.style.height = target.offsetHeight + "px"
    placer.style.top = target.offsetTop + "px"
    placer.style.left = target.offsetLeft + "px"
}
let currentWeekStartDate = getCurrentWeekStartDate();

function getCurrentWeekStartDate() {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1)
    const difference = currentDate.getDay();
    const firstDay = new Date();
    firstDay.setDate(firstDay.getDate() - difference);
    return firstDay;
}


function updateWeekDisplay() {
    const startDate = new Date(currentWeekStartDate),
        labels = document.querySelectorAll("label[data-date]");
    if (getCurrentWeekStartDate().toLocaleDateString() == startDate.toLocaleDateString()) {
        let thisDay = new Date()
        thisDay.setDate(thisDay.getDate() - 1)
        const todayInput = labels[thisDay.getDay()].previousSibling;
        todayInput.classList.add("today")
    }
    else {
        const todayInput = document.querySelector("input[type=radio].today")
        if (todayInput) {
            todayInput.classList.remove("today")
        }
    }

    labels.forEach(label => {
        label.querySelector("span.date").textContent = startDate.getDate()
        startDate.setDate(startDate.getDate() + 1);
    })
}

function changeLessons(input) {
    const sequence = Number(input.id.slice(-1)) - 1;
    document.querySelector(".lessons.show")?.classList.remove("show")
    let thisLesson = document.querySelectorAll(".lessons")[sequence]
    thisLesson.classList.add("show")
    thisLesson.querySelectorAll(".lesson").forEach((lesson, index) => {
        lesson.animate([
            { opacity: "0" },
            { opacity: "1" },
        ], {
            duration: 200,
            iterations: 1,
            delay: index * 100,
            fill: "both",
            easing: "ease-in-out",
        })
    })

}

function changeDate(step) {
    const title = document.querySelector("main h2.title")
    let diff = Number(title.dataset.diff) + step
    title.textContent = "Schedule " + new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diff, "day")
    title.dataset.diff = diff
}

updateWeekDisplay()


function sorted(objects, attribute = "dayNumber") {
    return objects.reduce((grouped, obj) => {
        const key = obj[attribute];
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(obj);
        return grouped;
    }, {});
}

function formatTime(time) {
    return new Date(`2023-12-01T${time}`).toLocaleTimeString("en-uk", { hour: "2-digit", minute: "2-digit" })
}


function fetchLessons(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const startDateFormat = startDate.toLocaleDateString("fr-ca"),
        endDateFormat = endDate.toLocaleDateString("fr-ca");
    fetchData(`https://inet.mdis.uz/api/v1/education/student/view/schedules?from=${startDateFormat}&to=${endDateFormat}`).then(data => {
        const lessons = document.querySelectorAll(".lessons")
        lessons.forEach(lessonsElem => {
            lessonsElem.innerHTML = ""
            lessonsElem.classList.remove("day-off")
        })
        if (!data) return
        if (data.data.length) {
            let timetable = sorted(data.data)

            for (let i = 1; i <= 7; i++) {
                if (timetable[i]) {
                    let table = timetable[i].sort((a, b) => a.startTime.localeCompare(b.startTime))
                    table.forEach(lesson => {
                        let content = template.content.cloneNode(true)
                        content.querySelector("h2.name").textContent = lesson.moduleName;
                        content.querySelector("span.type").textContent = lesson.lessonTypeName;
                        content.querySelector("span.type").setAttribute("type", lesson.lessonTypeName.toLowerCase());
                        content.querySelector("time.medium").textContent = `${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}`
                        let checkIn = content.querySelector(".check > span.in"),
                            checkOut = content.querySelector(".check > span.out")
                        if (lesson.checkIn) {
                            checkIn.classList.add("green")
                        }
                        if (lesson.checkInDate) {
                            checkIn.textContent = new Date(lesson.checkInDate).toLocaleTimeString("en-uk")
                        }
                        if (lesson.checkOut) {
                            checkOut.classList.add("green")
                        }
                        if (lesson.checkOutDate) {
                            checkOut.textContent = new Date(lesson.checkOutDate).toLocaleTimeString("en-uk")
                        }
                        if (lesson.cancelReason) {
                            let cancel = document.createElement("div");
                            cancel.classList.add("cancel");
                            cancel.innerHTML = `<object data="./assets/icons/ios-alert.svg" style="width: 20px; aspect-ratio: 1;"></object> Cancelled: ${lesson.cancelReason}`;
                            content.querySelector(".data").appendChild(cancel);
                            content.querySelector(".check").style.display = "none";
                            content.querySelector(".lesson").classList.add("cancel")
                        }
                        content.querySelector("h3.teacher").textContent = lesson.lecturerName.replaceAll("null", "").trim()
                        content.querySelector("span.room").textContent = lesson.venueName
                        document.querySelector(`.lessons[day="${i}"]`).appendChild(content)
                    })
                }
                else {
                    let dayOff = lessons[i - 1]
                    dayOff.classList.add("day-off")
                    dayOff.innerHTML = '<h3 class="alert-h3">This day is your day off.</h3><p class="text-center">Welcome to your well-deserved day off! Take this opportunity to relax, rejuvenate, and indulge in activities that bring you joy. Enjoy your day!</p>'
                }
            }
        }
        else {
            lessons.forEach(lessonContainer => {
                lessonContainer.classList.add("no-data")
                lessonContainer.innerHTML = '<h3 class="alert-h3">No further data is available.</h3><p class="text-center">Sorry pal, we didn\'t recieved any lessons for further dates. Maybe they are not scheduled yet.</p>'
            })
        }
    })
}


function userNavigate(direction) {
    let checkedRadioIndex = inputsObj.indexOf(document.querySelector("input[type=radio]:checked")),
        followingRadio = inputsObj[checkedRadioIndex + direction]
    if (followingRadio) { followingRadio.click() }
    else {
        let viceInput = inputsObj[inputsObj.length + direction]
        if (direction == 1) {
            viceInput = inputsObj[0]
        }
        viceInput.click()
        changeDate(direction * 7)
        currentWeekStartDate.setDate(currentWeekStartDate.getDate() + direction * 7)
        document.querySelectorAll(".lessons").forEach(lessonsElem => {
            lessonsElem.innerHTML = '<div class="loader"><div class="bouncer" style="--i: 1"></div><div class="bouncer" style="--i: 2"></div><div class="bouncer" style="--i: 3"></div></div>'
            lessonsElem.classList.remove("day-off")
        })
        fetchLessons(currentWeekStartDate)
        updateWeekDisplay()
    }
}


document.querySelectorAll("button[data-nav-dir]").forEach(btn => {
    btn.onclick = () => {
        userNavigate(Number(btn.dataset.navDir))
    }
})




inputsObj.forEach(input => {
    input.onchange = e => {
        let diff = 0;
        if (previousRadio) {
            diff = inputsObj.indexOf(e.target) - inputsObj.indexOf(previousRadio)
        }
        changeDate(diff)
        changeLessons(e.target)
        previousRadio = e.target
        setTimeout(() => {
            changePlacer(e.target.parentElement)
        }, 25)
    }
})

window.onresize = () => {
    const checkedRadio = document.querySelector("input[type=radio]:checked")
    if (!checkedRadio) return
    changePlacer(checkedRadio.parentElement)
}


window.addEventListener("touchstart", e => {

    e.preventDefault()
    touchStart = e.touches[0].clientX
})

window.addEventListener("touchend", e => {
    if(e.touches.length != 0) return
    let action = (touchStart - e.changedTouches[0].clientX) / 100;
    if (action > 0) {
        if (!Math.floor(action)) return
        userNavigate(1)
    }
    else if (action < 0) {
        if (!Math.ceil(action)) return
        userNavigate(-1)
    }
})


window.addEventListener("keydown", e => {
    if (e.keyCode == 37 || e.keyCode == 39) {
        e.preventDefault()
        userNavigate(e.keyCode - 38)
    }
})

const loadPage = async () => {
    await getUser(getCookie("username"), getCookie("password"))
    await getGreeting()
    const labels = document.querySelectorAll("label[data-date]");
    let thisDay = new Date()
    thisDay.setDate(thisDay.getDate() - 1)
    let todayLabel = labels[thisDay.getDay()];
    todayLabel.previousSibling.click()
    await fetchLessons(currentWeekStartDate)
    const checkedRadio = document.querySelector("input[type=radio]:checked")
    if (!checkedRadio) return
    changePlacer(checkedRadio.parentElement)
}

loadPage()