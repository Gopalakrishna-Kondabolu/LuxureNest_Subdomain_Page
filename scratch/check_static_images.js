const fs = require('fs');
const path = require('path');

const files = [
  'assets/logo/luxure-nest-logo.svg',
  'assets/images/brands/mooz.png',
  'assets/images/team/member-1.jpg',
  'assets/images/team/member-2.jpg',
  'assets/images/team/member-3.jpg',
  'assets/images/team/member-4.jpg',
  'assets/images/team/member-5.jpg',
  'assets/images/team/member-6.jpg',
  'assets/images/team/member-7.jpg',
  'assets/images/about/why-luxure-nest.png',
  'assets/images/about/why-luxure-nest.webp',
  'assets/images/workspace/coworking.png',
  'assets/images/workspace/coworking.webp',
  'assets/images/team/Manas.jpg',
  'assets/images/team/Manas.webp',
  'assets/images/team/Riya.jpg',
  'assets/images/team/Riya.webp',
  'assets/images/team/Simran.jpg',
  'assets/images/team/Simran.webp'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const stats = fs.statSync(f);
    console.log(`${f}: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.log(`${f}: NOT FOUND`);
  }
});
