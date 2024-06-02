//assigning name to form data
let name = document.getElementsByName('fullname');
let email = document.getElementsByName('email');
let phone = document.getElementsByName('phone');
let subject = document.getElementsByName('subject');
let message = document.getElementsByName('message');

//form input submission
var form = document.getElementById('contactForm');
form.addEventListener('submit', function(event) {
    event.preventDefault();
    alert('This form has been successfully submitted! I seek your kind assitance to wait up to 5 business days for a reply through your submitted email. Thank you.');
});
