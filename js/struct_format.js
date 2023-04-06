const struct_format = {};
struct_format.json = {
    replacer: function(match, pIndent, pKey, pVal, pEnd) {
        let key = '<span class=json-key>';
        let val = '<span class=json-value>';
        let str = '<span class=json-string>';
        let r = pIndent || '';
        if (pKey)
            r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal)
            r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
    },
    prettyPrint: function(obj) {
        let jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        let struct_data;
        if (typeof obj === 'string') {
            struct_data = parseStruct(obj)
        }
        return "<pre>" + JSON.stringify(struct_data, null, 3)
            .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(jsonLine, struct_format.json.replacer) + "</pre>";
    },
    prettyDate: function (obj) {
        let main_text = moment(obj).format('MMM D YY, HH:mm')
        let text_title = moment(obj).format('MM/DD/YYYY, HH:mm:ss') + " >>> " + moment(obj).calendar();
        return "<span title=\"" + text_title + "\" class=\"badge badge-primary badge-pill badge-light\">" +  main_text + "</span>"
    },
};
