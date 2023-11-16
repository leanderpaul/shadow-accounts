/** @global import('@types/jquery') */

const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function errorField(selector, message) {
  $(selector).addClass('error');
  $(`${selector} .error`).text(message);
  $(`${selector} input`).one('keydown', () => $(selector).removeClass('error'));
}

function showForgotPassword() {
  alert('Forgot password not yet implemented');
}

function handleVerifyEmailSuccess(email) {
  $('.oauth').addClass('hidden');
  $('#email').addClass('hidden');
  $('#forgot-password').addClass('hidden');

  $('#login-id').removeClass('hidden');
  $('#password').removeClass('hidden');

  $('#login-id .value').text(email);
  $('#next-btn span').text('Verify');
}

function handleVerifyEmailError(data) {
  $('#email').addClass('error');
  let message = data.error.message;
  if (!data.userExists) message = 'This account cannot be found. Please use a different account or <a href="/auth/signup">sign up</a> for a new account.';
  else if (data.error.code === 'U006') message = 'Your account is not active. Please contact your organization admin.';
  else if (data.error.code === 'U008') message = 'Your account is closed. Please contact the support team.';
  $('#email .error').html(message);
  $('#email input').one('keydown', () => $('#email').removeClass('error'));
}

function verifyEmail() {
  const email = $('#email input').val();
  let errorMessage = null;
  if (!email) errorMessage = 'Please enter your email address';
  else if (!emailRegex.test(email)) errorMessage = 'Please enter a valid email address';
  if (errorMessage) return errorField('#email', errorMessage);

  $('#next-btn').addClass('loading');
  return $.post('/auth/lookup', { email })
    .then(data => (data.error ? handleVerifyEmailError(data) : handleVerifyEmailSuccess(email)))
    .done(() => $('#next-btn').removeClass('loading'));
}

function loginWithPassword() {
  const email = $('#email input').val();
  const password = $('#password input').val();
  if (!password) return errorField('#password', 'Please enter your password');

  $('#next-btn').addClass('loading');
  return $.post('/auth/signin', { email, password })
    .then(() => window.location.replace('/'))
    .catch(err => errorField('#password', err.responseJSON.message))
    .done(() => $('#next-btn').removeClass('loading'));
}

$('#forgot-password .link').on('click', showForgotPassword);
$('#password .link').on('click', showForgotPassword);

$('.toggle-password-view').on('click', function () {
  $(this).children('svg').toggleClass('hidden');
  $('#password input').attr('type', $('#password input').attr('type') === 'password' ? 'text' : 'password');
});

$('#next-btn').on('click', () => ($('#next-btn span').text() === 'Next' ? verifyEmail() : loginWithPassword()));
