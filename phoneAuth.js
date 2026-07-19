// src/services/phoneAuth.js
//
// Wraps Firebase's phone auth calls and provides a custom ApplicationVerifier
// that satisfies signInWithPhoneNumber's third argument by pulling a token
// from RecaptchaModal instead of a real in-app DOM element.

import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

/**
 * Builds an object matching Firebase's ApplicationVerifier interface:
 *   { type: 'recaptcha', verify(): Promise<string> }
 *
 * `getToken` should be the `verify` method exposed by a RecaptchaModal ref
 * (i.e. recaptchaModalRef.current.verify).
 */
export function createWebviewRecaptchaVerifier(getToken) {
  return {
    type: 'recaptcha',
    verify: () => getToken(),
  };
}

/**
 * Basic E.164 check — Firebase requires phone numbers in this format,
 * e.g. +14155552671. This does not validate the number is real/reachable.
 */
export function isValidE164(phoneNumber) {
  return /^\+[1-9]\d{7,14}$/.test(phoneNumber);
}

/**
 * Sends the OTP SMS. Returns a Firebase ConfirmationResult — hold onto it
 * and pass it to confirmOtp() along with the code the user types in.
 */
export async function sendOtp(phoneNumber, appVerifier) {
  if (!isValidE164(phoneNumber)) {
    throw new Error('Enter your number in international format, e.g. +14155552671');
  }
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * Confirms the 6-digit code against the ConfirmationResult from sendOtp().
 * Resolves with a Firebase UserCredential on success.
 */
export async function confirmOtp(confirmationResult, code) {
  if (!confirmationResult) {
    throw new Error('No pending verification — request a new code first.');
  }
  if (!code || code.length < 6) {
    throw new Error('Enter the 6-digit code sent to your phone.');
  }
  return confirmationResult.confirm(code);
}
