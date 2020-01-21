const ct = require('./ct');
const pagebreak = require('./pagebreak');
const newline = require('./newline');
const boxsummary = require('./boxsummary');
const mdContainer = require('markdown-it-container');
const mdFootnote = require('markdown-it-footnote');
const mdImplicitFigures = require('markdown-it-implicit-figures');
const mdKatex = require('@iktakahiro/markdown-it-katex');

var hljs = require('highlight.js'); // https://highlightjs.org/

exports.constructor = async function (params) {
  var href = "https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css"
  return {
    pugFilters: { markdown: MarkdownPugFilter },
    headElements: `<link rel="stylesheet" href="${href}"></link>`
  }
};

function MarkdownPugFilter (text, options) {
  var md = require('markdown-it')({
    ...options,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' +
                 hljs.highlight(lang, str, true).value +
                 '</code></pre>';
        } catch (__) {}
      }
      return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
    }
  });

  md.use(mdFootnote);
  md.use(mdImplicitFigures, {
    dataType: false,
    figcaption: true,
    tabindex: false,
    link: false
  });
  md.use(mdContainer, 'ct', {validate: ct.validate, render: ct.render});
  md.use(mdContainer, 'pagebreak', {validate: pagebreak.validate, render: pagebreak.render});
  md.use(mdContainer, 'newline', {validate: newline.validate, render: newline.render});
  md.use(mdContainer, 'boxsummary', {render: boxsummary.render});
  md.use(mdKatex);

  return md.render(text)
}
