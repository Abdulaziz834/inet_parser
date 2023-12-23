const template = document.querySelector("template#attendances"),
tbody = document.querySelector("table tbody")
function fetchAttendances() {
    fetch("https://inet.mdis.uz/api/v1/education/students/attendances?", {
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
            setTimeout(() => {
                fetchAttendances()
            }, 500)
        }
        throw new Error(result.status)
    }).then(data => {
        if (!data.totalCount) return
        data.data.forEach(attendance => {
            let content = template.content.cloneNode(true)
            content.querySelector("td[data-cell=module]").textContent = attendance.name
            content.querySelector("td[data-cell=lessons]").textContent = attendance.lessonCount
            content.querySelector("td[data-cell=absent]").textContent = attendance.absenseCount
            content.querySelector("td[data-cell=percent]").textContent = attendance.attendancePercent + "%"
            tbody.appendChild(content)
        });
    })
}




document.body.onload = () => {
    getGreeting()
    getUser(getCookie("username"), getCookie("password"))
    fetchAttendances()
}
