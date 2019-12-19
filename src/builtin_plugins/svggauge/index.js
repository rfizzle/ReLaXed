const pug = require('pug');
const fs = require('fs');
const path = require('path');

let svgGaugeHandler = async function (gaugePath, page) {
  let gaugeSpec = fs.readFileSync(gaugePath, 'utf8');
  let html = pug.renderFile(path.join(__dirname, 'template.pug'), {gaugeSpec});
  let tempHTML = gaugePath + '.htm';

  fs.writeFileSync(tempHTML, html);
  await page.setContent(html);
  await page.waitForFunction(() => window.svgData);

  const svgData = await page.evaluate(() => window.svgData);
  const modSvgData = svgData.replace(/></g, '>\n\r<');

  const svgPath = gaugePath.substr(0, gaugePath.length - '.svggauge.js'.length) + '.svg';
  fs.writeFileSync(svgPath, modSvgData);
};

exports.constructor = async function (params) {
  return {
    watchers: [
      {
        extensions: ['.svggauge.js'],
        handler: svgGaugeHandler
      }
    ]
  }
};


