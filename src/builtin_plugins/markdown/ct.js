let md = require('markdown-it')();

function validate(params) {
  return params.trim().match(/ct ([a-zA-Z0-9]*="([^"\n}{]+)"*)/);
}

function render(tokens, idx) {
  let params = tokens[idx].info.trim().match(/([a-zA-Z0-9]*="([^"\n}{]+)"*)/g);
  let options = {};
  let optionKeys = ['name', 'age'];

  if (params === null) {
    return;
  }

  for (p of params) {
    let pArr = p.split("=");
    let k = pArr[0].toLowerCase();
    let v = pArr[1].substring(1, pArr[1].length-1);
    if (optionKeys.includes(k)) { options[k] = v }
  }

  return (
    `<div>
        <div class="name">
          ${md.utils.escapeHtml(options['name'])}
        </div>
        <div class="age">
          ${md.utils.escapeHtml(options['age'])}
        </div>
      </div>
    `);
}

function marker() {
  return ':'
}

let ct = {validate: validate, render: render, marker: marker};

module.exports = ct;