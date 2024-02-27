import localFont from 'next/font/local';

// const inter = localFont({
//   src: [
//     {
//       path: '../assets/fonts/Inter-Thin.ttf',
//       weight: '100',
//       style: 'normal'
//     },
//     {
//       path: '../assets/fonts/Inter-ExtraLight.ttf',
//       weight: '200',
//       style: 'normal'
//     },
//   ],
//   variable: '--font-inter'
// });

const inter = localFont({
  src: '../assets/fonts/Inter-Variable.ttf',
  variable: '--font-inter',
});

export { inter };
