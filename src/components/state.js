import { atom } from 'recoil';

// eslint-disable-next-line import/prefer-default-export
export const profilePageState = atom({
  key: 'profilePage', // Unique ID
  default: false,
});
