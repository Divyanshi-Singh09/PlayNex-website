const fs = require('fs');

const html = fs.readFileSync('scratch/folotoy_page.html', 'utf8');

// Find all elements under main
const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
if (mainMatch) {
  const main = mainMatch[0];
  console.log('Main section length:', main.length);
  // find classes of sections
  const sections = [...main.matchAll(/<section[^>]+class="([^">]+)"/g)].map(m => m[1]);
  console.log('Sections:', sections);

  // find product form / price / title
  const title = main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log('Title:', title ? title[1].trim() : 'none');

  const price = main.match(/class="[^"]*price[^"]*"[\s\S]*?<\/div>/i);
  console.log('Price snippet:', price ? price[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'none');

  // Let's inspect the product description block
  const desc = main.match(/<div class="product__description rte quick-add-hidden">([\s\S]*?)<\/div>/i);
  if (desc) {
    fs.writeFileSync('scratch/folotoy_description.html', desc[1], 'utf8');
    console.log('Description HTML saved to scratch/folotoy_description.html (length: ' + desc[1].length + ')');
  } else {
    console.log('No product__description match found');
    // try finding any rich text / rte
    const rtes = [...main.matchAll(/class="[^"]*rte[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];
    rtes.forEach((r, idx) => {
      console.log(`RTE ${idx}:`, r[1].replace(/<[^>]+>/g, ' ').slice(0, 200));
    });
  }
}

