const fs = require('fs');
const path = require('path');

let depth = 5;
let search_string = '';
let id_pre = 'table-of-contents-anchor-';
let anchors;

exports.constructor = async function (params) {

    if (params && params.depth) {
        depth = params.depth
    }

    for (let i = 1; i < depth; i++) {
        search_string += `h${i}, `
    }

    search_string += `h${depth}`;

    return {
        pugHeaders: [
            fs.readFileSync(path.join(__dirname, 'mixins.pug'), 'utf8')
        ],
        pageModifiers: [
            async (page, options) => {
                await generateToC(page, options)
            }
        ]
    }
};

function generateList(list, pageMap) {
    let i1 = 0, i2 = 0, i3 = 0, i4 = 0, i5 = 0;
    let currentIndex = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let dep = 1;
    let string = '<ul class="table-of-contents-list">';
    for (let item of list) {
        currentIndex[item.depth]++;

        while (item.depth > dep) {
            string += '<ul>';
            dep++;
        }

        while (item.depth < dep) {
            string += '</ul>';
            currentIndex[dep] = 0;
            dep--;
        }

        let numberPaddingStyle = `${pageMap[item.name] ? ('margin-left:8px;') : ('')}`;

        string += `
          <li class='table-of-contents-item'>
            <a href='#${item.id}'>
                <div class="table-of-contents-content">
                  <span class='table-of-contents-item-number'>${parseHeadingNumber(currentIndex)}</span>
                  <span class='table-of-contents-item-name'>${item.name}</span>
                  <span class='table-of-contents-item-dots'></span>
                  <span class='table-of-contents-item-number' style="${numberPaddingStyle}">${pageMap[item.name] ? (' ' + pageMap[item.name] + ' ') : ('')}</span>
                </div>
            </a>
          </li>
    `
    }
    return string + '</ul>'
}

async function generateToC(page) {
    let pageMapJson = await page.$eval('#table-of-contents', element => element.getAttribute("data-pages"));
    let pageMap = JSON.parse(pageMapJson) || {};

    let result = await page.$eval('#table-of-contents', element => element)
        .catch(error => false);

    if (!result) {
        return
    }

    let data = await page.$$eval(search_string, (elements, id) => {
        var list = [];
        var i = 1;
        for (var element of elements) {
            var el_id;
            if (/toc-ignore/.test(element.className)) {
                continue
            }
            if (element.id) {
                el_id = element.id
            } else {
                el_id = id + i;
                element.id = el_id;
                i++
            }
            list.push({
                name: element.innerText,
                id: el_id,
                depth: Number(element.tagName.match(/\d+/)[0])
            })
        }
        return list
    }, id_pre);

    let toc = generateList(data, pageMap);

    await page.$eval('#table-of-contents', (toc, list) => {
        toc.innerHTML = list
    }, toc);

    anchors = data
}

function parseHeadingNumber(indexHash) {
    let section = '';
    let found = false;
    for (let i = 5; i > 0; i--) {
        if (indexHash[i] !== 0 || found) {
            found = true;
            section = indexHash[i] + '.' + section;
        }
    }
    return section;
}