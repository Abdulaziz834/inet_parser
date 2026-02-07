const template = document.querySelector("template#attendances"),
    absentsContainer = document.querySelector(".absents-container");


function fetchStudent() {
    fetchData("https://inet.mdis.uz/api/v1/education/view/students")?.then(data => {
        const student = data.data[0]
        document.querySelector(".student-info p.faculty > span").textContent = student.programmeName
        document.querySelector(".student-info p.group > span").textContent = student.groupName
    })
}



function fetchAttendances(semesterId) {
    fetchData(`https://inet.mdis.uz/api/v1/education/students/attendances?direction=DESC&sortBy=id&semesterId=${semesterId}`)?.then(data => {
        absentsContainer.innerHTML = ""
        if (data.totalElements) {
            data.content.forEach(absent => {
                const content = template.content.cloneNode(true);
                content.querySelector(".heading-info > h4.name").textContent = absent.name;
                content.querySelector(".heading-info > h5.count").textContent = `${absent.absenseCount} (${absent.attendancePercent}%)`;
                let absentColor = "green";
                if (absent.attendancePercent > 7) {
                    absentColor = "yellow";
                }
                else if (absent.attendancePercent > 14) {
                    absentColor = "red"
                }
                content.querySelector(".heading-info > h5.count").classList.add(absentColor)
                content.querySelector("ul.detailed-info > li[data-cell='module code']").textContent = absent.code
                content.querySelector("ul.detailed-info > li[data-cell='total lessons']").textContent = absent.lessonCount
                content.querySelector("ul.detailed-info > li[data-cell='total hours']").textContent = absent.totalHours
                content.querySelector("ul.detailed-info > li[data-cell='seminar hours']").textContent = absent.seminarHours
                content.querySelector("ul.detailed-info > li[data-cell='lecture hours']").textContent = absent.lectureHours
                content.querySelector("button[data-module-id]").dataset.moduleId = absent.moduleId
                content.querySelector("button.show-info[data-module-id]").onclick = e => {
                    const btn = e.target
                    if (!btn.classList.toggle("more")) {
                        btn.textContent = "show less"
                    }
                    else {
                        btn.textContent = "show more"
                    }
                    btn.parentElement.classList.toggle("detailed")
                }
                absentsContainer.appendChild(content)
            });
        }
        else {
            absentsContainer.innerHTML = "<h3 class='alert-h3'>No data is available for this semester</h3><p class='text-center'>Sorry pal, but there is no data is provided for this semester.</p>"
        }
    })
}

const customSelects = document.querySelectorAll(".custom-select")
customSelects.forEach(customSelect => {
    const list = customSelect.querySelector("ul");
    customSelect.onclick = e => {
        const lis = Object.values(list.querySelectorAll("*")),
            displayingValue = customSelect.querySelector("h5.selected-value");
        if (list.classList.contains("selecting")) {
            let selectedValue = e.target
            displayingValue.classList.remove("choosing-semester")
            list.querySelector("li.selected").classList.remove("selected")
            selectedValue.classList.add("selected")
            list.style.top = (`${lis.indexOf(selectedValue) * selectedValue.offsetHeight * -1}px`)
            displayingValue.textContent = selectedValue.textContent
            list.classList.remove("selecting")
            if (list.id == "academic-year") {
                document.querySelectorAll("ul#semester > li").forEach((semester, index) => {
                    semester.setAttribute("value", JSON.parse(selectedValue.dataset.semesters)[index])
                })
                document.querySelector("ul#semester").previousElementSibling.textContent = "Choose semester"
                document.querySelector("ul#semester").previousElementSibling.classList.add("choosing-semester")
                return
            }
            fetchAttendances(document.querySelector("ul#semester > li.selected").getAttribute("value"))
        }
        else {
            list.classList.add("selecting")
            list.animate([{ opacity: "0" }, { opacity: "1" }], { duration: 100, fill: "both" })
        }
    }
    window.addEventListener("click", e => {
        if (!e.target.contains(list)) return;
        list.classList.remove("selecting")
    })
})


const loadPage = async () => {
    await getGreeting()
    await getUser(getCookie("username"), getCookie("password"))
    fetchAttendances("281")
    fetchStudent()
}

loadPage()
