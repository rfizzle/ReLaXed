const pug = require('pug');
const fs = require('fs');
const path = require('path');

let apexchartjsHandler = async function (chartjsPath, page) {
  let chartSpec = fs.readFileSync(chartjsPath, 'utf8');
  let html = pug.renderFile(path.join(__dirname, 'template.pug'), {chartSpec});
  let tempHTML = chartjsPath + '.htm';

  fs.writeFileSync(tempHTML, html);
  await page.setContent(html);
  await page.waitForFunction(() => (window.svgData || window.svgDataError));

  const svgData = await page.evaluate(() => window.svgData);
  const svgDataError = await page.evaluate(() => window.svgDataError);

  if (svgData) {
    const svgPath = chartjsPath.substr(0, chartjsPath.length - '.apexchart.js'.length) + '.svg';
    fs.writeFileSync(svgPath, svgData);
  } else {
    console.log("Error: " + svgDataError)
  }
};

exports.constructor = async function (params) {
  return {
    watchers: [
      {
        extensions: ['.apexchart.js'],
        handler: apexchartjsHandler
      }
    ]
  }
};


