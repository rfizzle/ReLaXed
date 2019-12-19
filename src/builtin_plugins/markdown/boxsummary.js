function render(tokens, idx, _options, env, self) {
  if (tokens[idx].nesting === 1) {
    return (`<div class="summary ui piled segment"><span>`);
  } else if (idx === (tokens.length - 1)) {
    return (`</span></div>`);
  } else {
    return self.renderToken(tokens, idx, _options, env, self);
  }
}

function marker() {
  return ':::'
}

let boxsummary = {render: render, marker: marker};

module.exports = boxsummary;