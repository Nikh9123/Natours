/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
// import { loadStripe } from '@stripe/stripe-js';

// const stripe = Stripe('pk_test_51NZJSFSG43Uzg2zNM72NsFMuJnUom4LHt4TKyw9gMkjt3YJWBty2dtIlDVNQc0ObxuEs4evFCUoERGjgkBsTpBkl00aJtSgfoo')
export const bookTour = async (tourId) => {
  try {
    // 1) Get Checkout session
    const session = await axios({
      method: 'POST',
      url: `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    });
    console.log(session);
    const redirectUrl = session.data.session.url ;

    // 2) Redirect to checkout form
    if(redirectUrl)
    {
      window.location = redirectUrl ;
    }
    
    
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
