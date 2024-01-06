const NotifyError = (message, opts) => Notiflix.Notify.failure(message, { position: 'center-top', timeout: 5000, clickToClose: true, width: '350px', ...opts });
const NotifySuccess = (message, opts) => Notiflix.Notify.success(message, { position: 'center-top', timeout: 5000, clickToClose: true, width: '350px', ...opts });
const backgroundColors = ['#0082f9', '#ff6641', '#795ff8', '#ffbe39', '#00bf9a'];
const deleteIcon = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

const removeNavBlur = () => ($('#sidenav').removeClass('show'), $('#blur').removeClass('nav-blur'));

$.patch = (url, data) => $.ajax({ method: 'PATCH', url, dataType: 'json', data: JSON.stringify(data ?? {}), contentType: 'application/json' });
$.delete = (url, data) => $.ajax({ method: 'DELETE', url, dataType: 'json', data: JSON.stringify(data ?? {}), contentType: 'application/json' });
$.fn.onlyOn = function (event, callback) {
  return this.off(event).on(event, callback);
};

async function loadPage(event, element) {
  event.preventDefault();
  const headers = new Headers();
  headers.append('X-Requested-With', 'XMLHttpRequest');

  const url = $(element).attr('href');
  const response = await fetch(url, { headers });
  const html = await response.text();

  $('#app').html(html);
  $('#sidenav a.item.selected').removeClass('selected');
  $(`#sidenav a.item[href="${url}"]`).addClass('selected');
  window.history.pushState({}, '', url);
}

function setPageMetadata(title, description) {
  $('head title').html(`${title} - Shadow Accounts`);
  $('head meta[name="description"]').attr('content', description ?? '');
}

function errorField(selector, message) {
  $(selector).addClass('error');
  $(`${selector} .error`).html(message);
  $(`${selector} input`).one('input', () => $(selector).removeClass('error'));
  return false;
}

function toggleWithMask(selector, className, addClass = true) {
  $(selector).toggleClass(className);
  const hasClass = $(selector).hasClass(className);
  if (!hasClass && addClass) setTimeout(() => $(document).one('click', () => $(selector).addClass(className)), 10);
  else if (hasClass && !addClass) setTimeout(() => $(document).one('click', () => $(selector).removeClass(className)), 10);
}

function enableSelect(selector) {
  const input = $(`${selector} input`);
  const value = $(`${selector} .select li[data-value="${input.data('value')}"]`)
    .addClass('selected')
    .text();
  input.val(value);

  $(`${selector} input`).onlyOn('click', () => toggleWithMask(`${selector} .select`, 'open', false));

  $(`${selector} .select li`).onlyOn('click', function () {
    const value = $(this).text();
    input.data('value', $(this).data('value'));
    input.val(value);
    $(`${selector} .select li`).removeClass('selected');
    $(this).addClass('selected');
  });
}

function getRandomColor() {
  const colors = backgroundColors;
  const index = Math.floor(Math.random() * colors.length);
  const color = colors[index];
  colors.splice(index, 1);
  return color;
}

function getChangedValue(selector) {
  const input = $(`${selector} input`);
  const value = input.data('current-value') ?? $(`${selector} span`).text();
  const updatedValue = input.data('value') ?? input.val().trim();
  if (updatedValue === value) return null;
  return updatedValue;
}

function toggleModal(selector) {
  if (!$(selector).hasClass('modal')) return;

  $('#blur').toggleClass('modal-blur');
  $('body').toggleClass('overflow-hidden');
  $('#blur').one('click', closeModal);

  $(selector).toggleClass('open');
  $(selector).find('input').val('');
  $(`${selector} .close`).onlyOn('click', closeModal);
}

function closeModal() {
  $('body').removeClass('overflow-hidden');
  $('.modal').removeClass('open');
  $('#blur').removeClass('modal-blur');
}

$(window).on('load', () => {
  $('#blur').on('click', removeNavBlur);
  $('#sidenav a').on('click', removeNavBlur);
  $('#dropdown-btn').on('click', () => toggleWithMask('#dropdown', 'hidden'));
  $(`#sidenav a.item[href="${window.location.pathname}"]`).addClass('selected');
});
