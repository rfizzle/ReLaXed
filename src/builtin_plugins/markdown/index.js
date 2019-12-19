const ct = require('./ct');
const pagebreak = require('./pagebreak');
const newline = require('./newline');
const boxsummary = require('./boxsummary');

var hljs = require('highlight.js'); // https://highlightjs.org/

exports.constructor = async function (params) {
  return {
    pugFilters: {markdown: MarkdownPugFilter}
  }
};

function MarkdownPugFilter(text, options) {
  var md = require('markdown-it')({
    ...options,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' +
              hljs.highlight(lang, str, true).value +
              '</code></pre>';
        } catch (__) {
        }
      }
      return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
    }
  })
      .use(require('markdown-it-footnote'))
      .use(require('markdown-it-implicit-figures'), {
        dataType: false,
        figcaption: true,
        tabindex: false,
        link: false
      })
      .use(require('markdown-it-container'), 'ct', {validate: ct.validate, render: ct.render})
      .use(require('markdown-it-container'), 'pagebreak', {validate: pagebreak.validate, render: pagebreak.render})
      .use(require('markdown-it-container'), 'newline', {validate: newline.validate, render: newline.render})
      .use(require('markdown-it-container'), 'boxsummary', {render: boxsummary.render});
  return md.render(text)
}
