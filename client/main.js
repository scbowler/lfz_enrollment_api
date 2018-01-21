const $form = $('form#class_registration');
//const URL = 'https://script.google.com/macros/u/0/s/AKfycby7ujpl0RPRLoUXA6qEJthwrAEOhrENzPyzBR4H30WeHSqqSBTb/exec';
const URL = '/send-data';

$('#register').on('click', e => {
    e.preventDefault();

    console.log('Register Clicked');

    $.ajax({
        url: URL,
        method: 'POST',
        dataType: 'JSON',
        data: $form.serializeArray(),
        success: resp => {
            console.log('Resp:', resp);
        },
        error: err => {
            console.log('Error:', err);
        }
    });
});

const $getForm = $('form#class_view');
const getUrl = '/get-data';

$('#find_class').on('click', e => {
    e.preventDefault();

    console.log('Find Class Clicked');

    $.ajax({
        url: getUrl,
        method: 'POST',
        dataType: 'JSON',
        data: $getForm.serializeArray(),
        success: resp => {
            console.log('Resp:', resp);

            if(resp.success){
                buildTable(resp.rows);
            }
        },
        error: err => {
            console.log('Error:', err);
        }
    });
});

function buildTable(data){
    const $table = $('#roster');

    $table.html('');

    const $thead = $('<thead>');
    const $tbody = $('<tbody>');

    for(let i = 0; i < data.length; i++){
        const $row = $('<tr>');
        for(let j = 0; j < data[i].length; j++){
            if(i === 0){
                $row.append(`<th>${data[i][j]}</th>`);
            } else {
                $row.append(`<td>${data[i][j]}</td>`);
            }
        }
        if(i === 0){
            $thead.append($row);
        } else {
            $tbody.append($row);
        }
    }

    $table.append([$thead, $tbody]);
}
