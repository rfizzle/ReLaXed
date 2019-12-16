exports.constructor = async function (params) {
    return {
        htmlModifiers: [
            function (html) {
                function nth(d) {
                    if (d > 3 && d < 21) return 'th';
                    switch (d % 10) {
                        case 1:  return "st";
                        case 2:  return "nd";
                        case 3:  return "rd";
                        default: return "th";
                    }
                }

                const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                let today = new Date();
                let dd = today.getDate();
                let day = nth(dd);
                let mm = today.getMonth(); //January is 0!
                let month = monthNames[mm];
                let yyyy = today.getFullYear();

                return html.replace('{{CURRENT_DATE}}', ( dd + day + ' ' + month + ' ' + yyyy))
            }
        ]
    }
};