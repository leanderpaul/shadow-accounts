const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/;
const nameRegex = /^[a-zA-Z0-9 \-_\.']+$/;
const NotifyError = (message, opts) => Notiflix.Notify.failure(message, { position: 'center-top', timeout: 5000, clickToClose: true, width: '350px', ...opts });
const NotifySuccess = (message, opts) => Notiflix.Notify.success(message, { position: 'center-top', timeout: 5000, clickToClose: true, width: '350px', ...opts });
const emailColors = ['#0082f9', '#ff6641', '#795ff8', '#ffbe39', '#00bf9a'];
const deleteIcon = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

function getRandomColor() {
  const index = Math.floor(Math.random() * emailColors.length);
  const color = emailColors[index];
  emailColors.splice(index, 1);
  return color;
}

function showSelectedTab() {
  const tab = location.hash.slice(1) || 'profile';
  if (!tab) return;
  $('#sidenav a').removeClass('selected');
  $(`#sidenav a[data-tab=${tab}]`).addClass('selected');
}

function validationName(isFirst) {
  const selector = isFirst ? '#firstName' : '#lastName';
  const name = $(`${selector} input`).val().trim();
  let errorMessage = null;
  if (!name && !isFirst) return true;
  else if (!name) errorMessage = 'First name cannot be empty';
  else if (!nameRegex.test(name)) errorMessage = `Please enter a valid ${isFirst ? 'first' : 'last'} name`;
  if (errorMessage) return errorField(selector, errorMessage);
  return true;
}

function validateProfilePic() {
  try {
    const url = $('#imageUrl input').val().trim();
    if (!url) return true;
    new URL(url);
    return true;
  } catch (err) {
    return errorField('#imageUrl', 'Please enter a valid URL');
  }
}

function editProfile() {
  const firstName = $('#firstName span').text();
  $('#firstName span').addClass('hidden');
  $('#firstName input').removeClass('!hidden').val(firstName);
  const lastName = $('#lastName span').text();
  $('#lastName span').addClass('hidden');
  $('#lastName input')
    .removeClass('!hidden')
    .val(lastName === '-' ? '' : lastName);
  $('#imageUrl').removeClass('hidden');
  $('#imageUrl input').val($('#imageUrl span').text());
  $('#gender span').addClass('hidden');
  $('#gender input').removeClass('!hidden').data('value', $('#gender input').data('current-value'));
  $('#gender .select svg').removeClass('hidden');
  enableSelect('#gender');
  $('#dob span').addClass('hidden');
  $('#dob input').removeClass('!hidden');
  $('#edit-lg').addClass('!hidden');
  $('#edit').removeClass('md:hidden').text('Save');
  $('#cancel').removeClass('!hidden');
}

function getChangedValue(selector) {
  const input = $(`${selector} input`);
  const value = input.data('current-value') ?? $(`${selector} span`).text();
  const updatedValue = input.data('value') ?? input.val().trim();
  if (updatedValue === value) return null;
  return updatedValue;
}

function saveProfile() {
  let validCounter = 0;
  validCounter += validationName(true);
  validCounter += validationName(false);
  validCounter += validateProfilePic();
  if (validCounter !== 3) return;

  const update = {};
  const fields = ['firstName', 'lastName', 'imageUrl', 'dob', 'gender'];
  for (const field of fields) {
    const value = getChangedValue(`#${field}`);
    if (value !== null) update[field] = value || null;
  }
  if (update.gender) {
    const gender = parseInt(update.gender);
    update.gender = gender === -1 ? null : gender;
  }

  $('#edit').addClass('loading');
  return $.ajax({ method: 'PATCH', url: '/user', data: JSON.stringify(update), dataType: 'json', contentType: 'application/json' })
    .done(data => handleUpdateSuccess(data))
    .fail(err => NotifyError(err.responseJSON.message))
    .always(() => $('#edit').removeClass('loading'));
}

function resetProfile() {
  $('#firstName span').removeClass('hidden');
  $('#firstName input').addClass('!hidden');
  $('#lastName span').removeClass('hidden');
  $('#lastName input').addClass('!hidden');
  $('#imageUrl').addClass('hidden');
  $('#gender span').removeClass('hidden');
  $('#gender input').addClass('!hidden').data('value', $('#gender input').data('current-value'));
  $('#gender .select svg').addClass('hidden');
  $('#dob span').removeClass('hidden');
  $('#dob input').addClass('!hidden');
  $('#edit-lg').removeClass('!hidden');
  $('#edit').addClass('md:hidden').text('Edit');
  $('#cancel').addClass('!hidden');
}

function handleUpdateSuccess(data) {
  NotifySuccess('Profile updated successfully');
  $('#firstName span').text(data.firstName);
  $('#lastName span').text(data.lastName || '-');
  if (data.imageUrl) $('#imageUrl span').text(data.imageUrl);
  const gender = data.gender === 1 ? 'Male' : data.gender === 2 ? 'Female' : 'Prefer not to say';
  $('#gender span').text(gender);
  $('#gender input').data('current-value', data.gender);
  if (data.dob) {
    const dob = new Date(data.dob);
    const month = dob.toLocaleString('default', { month: 'long' });
    const day = dob.getDate();
    const year = dob.getFullYear();
    $('#dob span').text(`${month} ${day}, ${year}`);
    $('#dob input').data('current-value', data.dob);
  } else $('#dob span').text('-');
  resetProfile();
}

function toggleModal(selector) {
  $('#blur').toggleClass('modal-blur');
  $('body').toggleClass('overflow-hidden');
  $(selector).toggleClass('open');
  $(selector).find('input').val('');
  $('#blur').one('click', closeModal);
}

function closeModal() {
  $('body').removeClass('overflow-hidden');
  $('.modal').removeClass('open');
  $('#blur').removeClass('modal-blur');
}

function addEmailAddress() {
  const email = $('#new-email input').val().trim();
  let errorMessage = null;
  if (!email) errorMessage = 'Please enter your email address';
  else if (!emailRegex.test(email)) errorMessage = 'Please enter a valid email address';
  if (errorMessage) return errorField('#new-email', errorMessage);

  $('#add-email-modal button').addClass('loading');
  return $.post('/user/emails', { email })
    .done(() => {
      const emailElement = $('.email-addresses li').first().clone();
      emailElement.find('.email').text(email);
      emailElement.find('.icon').css('background-color', getRandomColor());
      emailElement.find('.badge').removeClass('bg-success').addClass('bg-warn').text('Unverified');
      emailElement.find('.actions').html(`<span class="verify">Resend verification email</span>`);
      const svg = $(deleteIcon).on('click', () => deleteEmailAddress(email));
      emailElement.find('.actions').append(svg);
      emailElement.on('click', e => toggleEmailOptionsModal(e.currentTarget));
      $('.email-addresses').append(emailElement);
      NotifySuccess('Email address added successfully');
      closeModal();
    })
    .fail(err => errorField('#new-email', err.responseJSON.message))
    .always(() => $('#add-email-modal button').removeClass('loading'));
}

function deleteEmailAddress(email) {
  return $.ajax({ method: 'DELETE', url: '/user/emails', dataType: 'json', data: JSON.stringify({ email }), contentType: 'application/json' })
    .done(() => {
      const emails = $('.email-addresses li').toArray();
      const index = emails.findIndex(el => $(el).find('.email').text() === email);
      $(emails[index]).remove();
      NotifySuccess('Email address deleted successfully');
      closeModal();
    })
    .fail(err => NotifyError(err.responseJSON.message));
}

function setAsPrimaryEmailAddress(email) {
  return $.post('/user/emails/primary', { email })
    .done(() => {
      $('.email-addresses li .badge.bg-success').remove();
      const emails = $('.email-addresses li').toArray();
      const index = emails.findIndex(el => $(el).find('.email').text() === email);
      $(emails[index]).find('.badges').html('<div class="badge bg-success">Primary</div>');
      NotifySuccess('Email address set as primary successfully');
      closeModal();
    })
    .fail(err => NotifyError(err.responseJSON.message));
}

function resendVerificationEmail(email) {
  alert('Resend verification email not yet implemented');
  closeModal();
}

function toggleEmailOptionsModal(element) {
  if (!isMobile()) return;
  const primary = $(element).find('.badge.bg-success').length > 0;
  if (primary) return;
  const email = $(element).find('.email').text();
  const unverified = $(element).find('.badge.bg-warn').length > 0;
  $('#email-options .header .title').text(email);
  if (unverified) {
    $('#email-options .options .set-primary').addClass('!hidden');
    $('#email-options .options .resend').removeClass('!hidden');
    $('#email-options .options .resend')
      .off('click')
      .on('click', () => resendVerificationEmail(email));
  } else {
    $('#email-options .options .resend').addClass('!hidden');
    $('#email-options .options .set-primary').removeClass('!hidden');
    $('#email-options .options .set-primary')
      .off('click')
      .on('click', () => setAsPrimaryEmailAddress(email));
  }
  $('#email-options .options .delete')
    .off('click')
    .on('click', () => deleteEmailAddress(email));
  toggleModal('#email-options');
}

$('ul.email-addresses li .icon').each((_, el) => $(el).css('background-color', getRandomColor()));

$('#menu-btn').on('click', () => ($('#sidenav').addClass('show'), $('#blur').addClass('nav-blur')));
const removeNavBlur = () => ($('#sidenav').removeClass('show'), $('#blur').removeClass('nav-blur'));
$('#blur').on('click', removeNavBlur);
$('#sidenav a').on('click', removeNavBlur);
$('.modal .close').on('click', closeModal);
$('#add-email').on('click', () => toggleModal('#add-email-modal'));
$('.email-addresses li').on('click', e => toggleEmailOptionsModal(e.currentTarget));

$('#edit').on('click', () => ($('#edit').text() === 'Edit' ? editProfile() : saveProfile()));
$('#edit-lg').on('click', editProfile);
$('#cancel').on('click', resetProfile);
$('#add-email-modal button').on('click', addEmailAddress);

$('#dropdown-btn').on('click', () => toggleWithMask('#dropdown', 'hidden'));
$(window).on('hashchange', showSelectedTab);
$(document).ready(showSelectedTab);
