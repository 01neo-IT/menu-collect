const QRCode = require('qrcode');

// const url = 'https://wa.me/+212772420012?text=menu' #this is the link to whatsapp ;
const url = 'https://google.com/';


const options = {
  width: 800
};

QRCode.toFile('google.png', url, options, (err) => {
  if (err) throw err;
});

// https://search.google.com/local/writereview?placeid=ChIJV2TT96Ttrw0R5xPrb6Q5AjE #this is the link of "le blokk" review on google
