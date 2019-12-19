function validate(params) {
  return params.trim().match(/newline(\s?)/);
}

function render(tokens, idx) {
  if (tokens[idx].nesting === 1) {
    return (`<br />`);
  } else {
    return "";
  }
}

function marker() {
  return ':::'
}

let newline = {validate: validate, render: render, marker: marker};

module.exports = newline;