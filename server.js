var express = require('express');
var app = express();
var port = 8080;
var cors = require('cors');
var date = require('date-and-time');
var fs = require('fs');
var modbus = require('jsmodbus');

var client;

app.use(cors());
var route = express.Router();

var Now_Data = {};

var first;
var fileName;
var count;
var oldInterval = null;


function writeFile(){
    count++;
    var now = new Date();
    var Format = date.format(now, 'YYYY-MM-DD HH:mm:ss');
    if (!first) {
        fileName = 'Log/' + date.format(now, 'YYYYMMDD-HHmmss') + '.log';
        fs.writeFile(fileName, '--------------------Start Line--------------------');
        first = true;
    }
    fs.appendFile(fileName, '\r\n[' + Format + '],' + Now_Data['IP'] + ',' + Now_Data['ID'] + ',' + Now_Data['MACHINE_CODE'] + ',' +
        Now_Data['SPM_VALUE'] + ',' + Now_Data['REG_START'] + ',' + Now_Data['REG_COUNT'], function (err) {
        if (err) console.log(err);
    });
    client.readInputRegisters(Now_Data['REG_START'], Now_Data['REG_COUNT']).then(function (resp) {
        var str = '';
        for(var i=0;i<resp.register.length;i++){
            str += ', '+resp.register[i];
        }
        fs.appendFile(fileName, str, function (err) {
            if(err) console.log(err);
        });
    }, function (err) {
        console.log(err);
        socket.emit('Status', false);
    });
    socket.emit('Data_Count', count);
    socket.emit('Status', true);
}


app.use('/', route);
app.listen(port);

var io = require('socket.io');
var socket = io.listen(10000);

socket.sockets.on('connection', function (socket) {
    console.log('Socket Client Connected.');
    socket.on('START', function (data) {
        count = 0;
        Now_Data = data;
        first = false;
        // create a modbus client
        client = modbus.client.tcp.complete({
            'host'              : data['IP'],
            'port'              : 502,
            'autoReconnect'     : true,
            'reconnectTimeout'  : 1000,
            'timeout'           : 5000,
            'unitId'            : data['ID']
        });
        if(!oldInterval) {
            client.connect(); //建立連線
            client.on('connect', function () {  //連線啟動
                console.log('Modbus TCP Connected.'); //列印連線成功
                oldInterval = setInterval(writeFile, 1000);
            });
        }
    });
    socket.on('STOP', function(){
        clearInterval(oldInterval);
        oldInterval = null;
        Now_Data = null;
        socket.emit('Stopped', true);
    });
    socket.on('UpdateCode', function (data) {
        Now_Data['MACHINE_CODE'] = data;
        console.log(data);
    });
    socket.on('UpdateSPM', function (data) {
        Now_Data['SPM_VALUE'] = data;
        console.log(data);
    });
});