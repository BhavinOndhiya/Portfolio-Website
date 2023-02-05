const form = document.querySelector('.contact-form'),
    function sendMsg(e) {
        e.preventDefault();
        const name = document.querySelector('.name'),
            email = document.querySelector('.form-item'),
            message = document.querySelector('.msg'),

            Email.send({
                SecureToken: " 90bc9d35-290a-42aa-b1fc-de2535542ba4",
                To: 'cminati826@gmail.com',
                From: email.value,
                Subject: "Message",
                Body: message.value,
            }).then(
                message => alert(message),
            );
    }
form.addEventListener('submit', sendMsg)