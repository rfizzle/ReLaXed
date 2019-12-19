function validate(params) {
  return params.trim().match(/pagebreak(\s?)/);
}

function render(tokens, idx) {
  return (`<div style="page-break-before:always" />`);
}

function marker() {
  return ':::'
}

let pagebreak = {validate: validate, render: render, marker: marker};

module.exports = pagebreak;