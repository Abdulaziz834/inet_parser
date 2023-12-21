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

function getRequest(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
 }


function getGreeting() {
      const currentHour = new Date().getHours(),
          salutationElem = document.querySelector("header span.salutation");
    let salutation = "Day";

      if (currentHour >= 5 && currentHour < 9) {
        salutation = "Morning";
      } else if (currentHour >= 9 && currentHour < 13) {
        salutation = "Day";
      } else if (currentHour >= 13 && currentHour < 17) {
        salutation = "Afternoon";
      } else {
        salutation = "Evening";
      }
    salutationElem.textContent = salutation;
    }

function getUser(username, password) {
    if (!(username && password)) {
        location.replace("/login.html?redirect_url=" + location.pathname)
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
            location.replace("/login.html?redirect_url=" + location.pathname)
        }
    }).then(text => {
        localStorage.setItem("access_token", `Bearer ${text.access_token}`)
        document.querySelector("header span.bold").textContent = text.user.fullName.split(" ")[0].toLowerCase()
        document.querySelector(".avatar > img").setAttribute("src", `https://inet.mdis.uz${text.user.avatar}`)
    })
}