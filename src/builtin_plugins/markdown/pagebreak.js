function validate(params) {
  return params.trim().match(/pagebreak(\s?)/);
}

function render(tokens, idx) {
  if (tokens[idx].nesting === 1) {
    return (`<div style="page-break-before:always" />'`);
  } else {
    return "";
  }
}

function marker() {
  return ':::'
}

let pagebreak = {validate: validate, render: render, marker: marker};

module.exports = pagebreak;