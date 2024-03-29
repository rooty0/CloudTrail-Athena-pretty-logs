function arrayMove(arr, fromIndex, toIndex) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

$(document).ready(() => {
    let data_files_form = $('.basicAutoCompleteShowDropdown')
    data_files_form.autoComplete({
        events: {
            searchPost: function (resultFromServer) {
                let data = $.parseHTML(resultFromServer);
                let items = $(data).find('li a').map(function() {
                    return this.text;
                }).get();
                // console.log(items)
                return items;
            }
        },
        resolverSettings: {
            url: 'realdata/'
        },
        minLength: 0,
        noResultsText: '',
        select: function( event, ui ) {},
    });

    data_files_form.keyup(e => {
        if (e.which === 13) { // Enter
            let data_file = data_files_form.val();
            Cookies.set('data_file', data_file, { expires: 7 });
            window.location.reload();
        }
    });
    data_files_form.on('autocomplete.select', function () {
        let data_file = data_files_form.val();
        Cookies.set('data_file', data_file, { expires: 7 });
        window.location.reload();
    });

    $('.basicAutoCompleteShowBtn').on('click', function () {
        $('.basicAutoCompleteShowDropdown').autoComplete('show');
    });

})

const CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        let csv_path_manual = options.csv_path || "";
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
        let containerElement = $("#" + el);
        containerElement.empty().append(table);

        let reorder_columns = options.reorder_columns_simple || [];

        let hide_columns = options.hide_columns || [];
        if (Cookies.get('hide_columns') === undefined) Cookies.set('hide_columns', JSON.stringify(hide_columns), { expires: 365 });

        const csv_path = Object.keys(csv_path_manual).length === 0 ? "realdata/" + Cookies.get('data_file') : csv_path_manual;

        $.when($.get(csv_path)).then(
            function (data) {
                let csvData = $.csv.toArrays(data, csv_options);
                let tableHead = $("<thead></thead>");
                let csvHeaderRow = csvData[0];
                let tableHeadRow = $("<tr></tr>");
                let tableFilterHeadRow = $("<tr class='d-none'></tr>");

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

                    // filter
                    tableFilterHeadRow.append($("<th class='filters'>filter...</th>")
                    );
                }

                tableHead.append(tableFilterHeadRow);
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

                datatables_options['initComplete'] = function () {
                    let api = this.api();
                    let th_filters = $('th.filters');
                    api.columns().eq(0).each(function (colIdx) {
                        let cell = th_filters.eq(
                            $(api.column(colIdx).header()).index()
                        );
                        let title = $(cell).text();
                        let cursorPosition;
                        $(cell).html('<input type="text" placeholder="' + title + '" />');
                        $('input', th_filters.eq($(api.column(colIdx).header()).index()))
                            .off('keyup change')
                            .on('change', function (e) {
                                $(this).attr('title', $(this).val());
                                let regexr = '({search})';
                                cursorPosition = this.selectionStart;
                                api.column(colIdx).search(
                                    this.value !== ''
                                        ? regexr.replace('{search}', '(((' + this.value + ')))')
                                        : '',
                                    this.value !== '',
                                    this.value === ''
                                ).draw();
                            })
                            .on('keyup', function (e) {
                                e.stopPropagation();

                                $(this).trigger('change');
                                $(this)
                                    .focus()[0]
                                    .setSelectionRange(cursorPosition, cursorPosition);
                            });
                    });
                };
                let ref_table = table.DataTable(datatables_options);
                $('div.dataTables_filter input').addClass('form-control');

                $('a.toggle-vis').on('click', function (e) {
                    e.preventDefault();

                    // Get the column API object
                    let column = ref_table.column($(this).attr('data-column'));

                    // Toggle the visibility
                    column.visible(!column.visible());

                    // grayout
                    $(this).toggleClass("btn-primary").toggleClass("btn-secondary");

                    // grayout and set cookies // broken, fix later
                    // if ($(this).hasClass("btn-primary")) {
                    //     // TO HIDE
                    //     $(this).removeClass("btn-primary");
                    //     $(this).addClass("btn-secondary");
                    //
                    //     // Saving result to hide
                    //     hide_columns = JSON.parse(Cookies.get('hide_columns'))
                    //     let hide_column_index = hide_columns.indexOf($(this).text());
                    //     if (hide_column_index !== -1) {
                    //         hide_columns.splice(hide_column_index, 1);
                    //         // alert(JSON.stringify(hide_columns));
                    //         // Cookies.set('hide_columns', JSON.stringify(hide_columns), { expires: 365 });
                    //     }
                    // } else {
                    //     // TO SHOW
                    //     $(this).removeClass("btn-secondary");
                    //     $(this).addClass("btn-primary");
                    // }
                });

                let head_menu_visibility = Cookies.get('head_menu_visibility');
                if (head_menu_visibility === 'hide') {
                    $('#toggle-vis').hide('fast');
                }
                $('#close-toggle-menu').on('click', function (e) {
                    e.preventDefault();
                    head_menu_visibility = Cookies.get('head_menu_visibility');
                    if (head_menu_visibility === 'hide') {
                        Cookies.set('head_menu_visibility', 'show', { expires: 365 });
                        $('#toggle-vis').show('fast');
                    }
                    else {
                        Cookies.set('head_menu_visibility', 'hide', { expires: 365 });
                        $('#toggle-vis').hide('fast');
                    }

                });
                $('#show-advanced-search').on('click', function (e) {
                    e.preventDefault();
                    $('tr.d-none').removeClass('d-none');
                });

                // to hide column feature
                hide_columns = JSON.parse(Cookies.get('hide_columns'));
                for (let i = 0; i < hide_columns.length; i++) {
                    $("a.toggle-vis:contains("+hide_columns[i]+")").trigger("click");
                }

                if (allow_download) {
                    containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }

                let max_pre_scroll = Math.max.apply(
                    null, $("#table-container-table tbody tr td").map(function () { return $(this).height() }).get()
                );

                $("pre.json-pre").each(function (){
                    $(this).css("max-height", max_pre_scroll);
                    // console.log($(this));
                });
            });
    }
};
