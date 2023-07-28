/*eslint-disable */
import '@babel/polyfill';
import { logOut, login } from './login';
import { displayMap } from './leaflet';
import { updateSettings } from './updateSettings';

//CHECKING DOM ELEMENTS
const leafLet = document.getElementById('map');
//DELEGATON
if (leafLet) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
console.log(logOutBtn);

if (loginForm) {
  //VALUES
  document.querySelector('.form--login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logOut);

if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //PROGRAMITICALLY RECREATING MULTIPART FORM DATA 
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email',document.getElementById('email').value);
    form.append('photo',document.getElementById('photo').files[0])
    
    console.log(form);

    //passing form(FORM IS AN OBJECT WITH NAME,EMAIL,USERDATA)
    updateSettings(form, 'data');
  });
}

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'updating...';
    const oldPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    console.log(oldPassword,password,passwordConfirm)
    await updateSettings(
      { oldPassword, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
