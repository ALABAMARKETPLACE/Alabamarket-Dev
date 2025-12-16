export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY || process.env.REACT_APP_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN || process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID || process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID || process.env.REACT_APP_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID || process.env.REACT_APP_MEASUREMENT_ID,
};
// alaba-3836b.firebaseapp.com"