const ct = require('./ct');

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
      .use(require('markdown-it-container'), 'ct', {validate: ct.validate, render: ct.render});
  return md.render(text)
}
