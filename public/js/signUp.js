/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

/**
 * "name": "Test User",
    "email": "Test124@gmail.com",
    "password": "Test1234",
    "passwordConfirm": "Test1234"
 * 
 */

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Welcome to Natours😃 ! Your Account has been created successfully!'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('err', err.response.data.message);
  }
};
