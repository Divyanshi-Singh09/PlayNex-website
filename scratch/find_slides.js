const fs = require('fs');
const html = fs.readFileSync('scratch/folotoy_page.html', 'utf8');

const regex = /class="product__media[^"]*"[\s\S]*?<img[^>]+src="([^">]+)"/g;
let m;
const slides = [];
while ((m = regex.exec(html)) !== null) {
  slides.push(m[1]);
}
console.log('Slides found:', slides);

const imgTags = html.match(/<img[^>]+>/g) || [];
console.log('Total img tags:', imgTags.length);
imgTags.forEach(t => {
  if (t.includes('products/') || t.includes('files/')) {
    console.log(t);
  }
});

