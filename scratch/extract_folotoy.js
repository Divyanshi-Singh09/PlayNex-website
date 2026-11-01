const fs = require('fs');

async function main() {
  const res = await fetch('https://store.folotoy.com/products/folotoy-ai-teddy');
  const html = await res.text();
  fs.writeFileSync('scratch/folotoy_page.html', html, 'utf8');

  console.log('Saved HTML to scratch/folotoy_page.html, length:', html.length);
  
  // Find product media / images
  const images = [];
  const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1].includes('cdn.shopify.com/s/files')) {
      images.push(match[1]);
    }
  }
  console.log('Unique shopify images:', [...new Set(images)].slice(0, 15));

  // Find structure elements
  const accordionRegex = /<details[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;
  while ((match = accordionRegex.exec(html)) !== null) {
    const title = match[1].replace(/<[^>]+>/g, '').trim();
    const content = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('\n--- ACCORDION:', title);
    console.log(content.slice(0, 300));
  }
}

main().catch(console.error);

