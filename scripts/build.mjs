import {cpSync,mkdirSync,rmSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});
mkdirSync('dist',{recursive:true});
cpSync('web','dist',{recursive:true});
console.log('Dapi static game built. No sign-in or password gate.');
