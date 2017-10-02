"use strict";
$(document).ready(function() {
    var IP, ID, REG_START, REG_COUNT, MACHINE_CODE, SPM_VALUE;

    $('#DATA_COUNT').html('0');
    $('#STATE_NOW').html('Ready').css('color', 'green');

    socket.on('Status', function(data){
        if(data){
            $('#STATE_NOW').html('Connected.').css('color', 'green');
        }else{
            $('#STATE_NOW').html('Connection Error.').css('color', 'red');
        }
    });

    socket.on('Data_Count', function (data) {
        $('#DATA_COUNT').html(data);
    });

    socket.on('Stopped', function () {
        $('#STATE_NOW').html('Stopped.').css('color', 'red');
    });

    $('#BTN_START').click(function(){
        var data = {
            IP : $('#IP_IN').val(),
            ID : $('#ID_IN').val(),
            REG_START : $('#RST_SIN').val(),
            REG_COUNT : $('#RST_CIN').val(),
            MACHINE_CODE : $('#CODE_IN').val(),
            SPM_VALUE : $('#SPM_IN').val()
        };
        $('#STATE_NOW').html('Connecting...').css('color', 'green');
        socket.emit('START', data);
    });
    $('#BTN_STOP').click(function(){
        $('#STATE_NOW').html('STOP').css('color', 'red');
        socket.emit('STOP', 0);
    });
    $('#CODE_IN').keyup(function () {
        socket.emit('UpdateCode', $('#CODE_IN').val());
    });
    $('#SPM_IN').keyup(function () {
        socket.emit('UpdateSPM', $('#SPM_IN').val());
    });


});