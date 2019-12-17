const pug = require('pug');
const fs = require('fs');
const path = require('path');

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


var apexchartjsHandler = async function (chartjsPath, page) {
  var chartSpec = fs.readFileSync(chartjsPath, 'utf8');
  var html = pug.renderFile(path.join(__dirname, 'template.pug'), { chartSpec });
  var tempHTML = chartjsPath + '.htm';

  fs.writeFileSync(tempHTML, html);
  await page.setContent(html);
  await page.waitForFunction(() => window.svgData);

  const svgData = await page.evaluate(() => window.svgData);

  var svgPath = chartjsPath.substr(0, chartjsPath.length - '.apexchart.js'.length) + '.svg';
  fs.writeFileSync(svgPath, svgData);
};
