function validate(params) {
  return params.trim().match(/newline(\s?)/);
}

function render(tokens, idx) {
  return (`<br />`);
}

function marker() {
  return ':::'
}

let newline = {validate: validate, render: render, marker: marker};

module.exports = newline;