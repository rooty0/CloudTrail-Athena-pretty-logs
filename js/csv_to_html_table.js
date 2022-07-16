if (!library)
    var library = {};
library.json = {
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
            // let json_obj = JSON.parse(obj);
            struct_data = parseStruct(obj)
            console.log(struct_data);

        }
        return "<pre>" + JSON.stringify(struct_data, null, 3)
            .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(jsonLine, library.json.replacer) + "</pre>";
    }
};

function arrayMove(arr, fromIndex, toIndex) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

$(document).ready(function () {
    var CsvToHtmlTable = CsvToHtmlTable || {};
});

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        let csv_path = options.csv_path || "";
        let el = options.element || "table-container";
        let allow_download = options.allow_download || false;
        let csv_options = options.csv_options || {};
        let datatables_options = options.datatables_options || {};
        let custom_formatting = options.custom_formatting || [];
        let customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            let colIdx = v[0];
            let func = v[1];
            customTemplates[colIdx] = func;
        });

        let table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        let $containerElement = $("#" + el);
        $containerElement.empty().append(table);

        let reorder_columns = options.reorder_columns_simple || [];

        $.when($.get(csv_path)).then(
            function (data) {
                let csvData = $.csv.toArrays(data, csv_options);
                let tableHead = $("<thead></thead>");
                let csvHeaderRow = csvData[0];
                let tableHeadRow = $("<tr></tr>");

                // reorder by header
                for(let i = 0; i < reorder_columns.length; i++) {
                    let headNamePos = csvHeaderRow.indexOf(reorder_columns[i]);
                    if (headNamePos === -1) continue;
                    for(let j = 0; j < csvData.length; j++) {
                        arrayMove(csvData[j], headNamePos, i);
                    }
                }

                // header render
                for (let headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                    tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
                    $("div#toggle-vis").append("<a class=\"toggle-vis btn btn-primary\" style='margin: 5px;' data-column=\""+headerIdx+"\">"+csvHeaderRow[headerIdx]+"</a>");
                }
                tableHead.append(tableHeadRow);

                table.append(tableHead);
                let tableBody = $("<tbody></tbody>");

                for (let rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    let $tableBodyRow = $("<tr></tr>");
                    for (let colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                        let tableBodyRowTd = $("<td></td>");
                        let cellTemplateFunc = customTemplates[colIdx];
                        if (cellTemplateFunc) {
                            tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                        } else {
                            tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                        }
                        $tableBodyRow.append(tableBodyRowTd);
                        tableBody.append($tableBodyRow);
                    }
                }
                table.append(tableBody);

                let ref_table = table.DataTable(datatables_options);
                $('div.dataTables_filter input').addClass('form-control');

                $('a.toggle-vis').on('click', function (e) {
                    e.preventDefault();

                    // Get the column API object
                    let column = ref_table.column($(this).attr('data-column'));

                    // Toggle the visibility
                    column.visible(!column.visible());

                    // grayout
                    $( this ).toggleClass( "btn-primary" ).toggleClass( "btn-secondary" );
                });


                if (allow_download) {
                    $containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }
            });
    }
};
