const express = require('express');          //express 프레임워크
const router = express.Router();             //router 상수 선언 (라우터 역할)
const mongoose = require('mongoose');        //mongoose db연결하기 위해 include
const Record = require('../models/record');  //db경로 가져옴

const db = "mongodb://127.0.0.1/dhtDB";
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true});  //올바른 db연결위해 쓰는 코드
mongoose.set('strictQuery', true);

const  { SerialPort, ReadlineParser } = require('serialport');
const parser = new ReadlineParser();
var temp = null;
var humi = null;
var discom = null;
var level = null;
var bright = 100;

var port = 3030;          //사용자가 웹페이지 접속시 이용하는 포트번호
var arduinoPort = "COM3"; //아두이노 포트는 COM3

var arduinoSerialPort = new SerialPort(  
    {
        path:"COM3",       //경로설정
        baudRate: 9600,    //9600 속도
        dataBits : 8,      //8비트씩
        parser: SerialPort.parsers
    });
    
    //포트 여는 라우터 
    arduinoSerialPort.on('open',function() {
    console.log('Serial Port ' + arduinoPort + ' is opened.');
   
        arduinoSerialPort.pipe(parser);  //시리얼포트를 열어서 파싱한다
    
        parser.on('data',function(data){ //값을 받으면 data로 읽을게요
            console.log('data ='+data);   
            data = data.split(' ');      //토큰으로 분리
            console.log(data[0]);        //0번째 값
            console.log(data[1]);        //1번째 값
            temp = data[0];              //0번째 값은 온도
            humi = data[1];              //1번째 값은 습도
            discom = data[2];            //2번째 값은 불쾌지수 
            level = data[3];             //3번째 값은 벨레벨

            const record = new Record(); //Record db 객체 record 선언
            record.humid = humi;         //각 값을 대입
            record.temp = temp;
            record.discom = discom;
            record.level = level;
            record.save((err) => { //record insert하는데 실패하면 에러 문구 표시
                if(err)
                {
                    console.status(500).send({error : 'database failure in inserting data!!'});
                    return;
                }
            })
        })
  });


//index 라우터 : 처음 웹페이지에 접속할 때 사용 
router.get('/', function (req, res) {
    var d = new Date();
    d = d.getHours();
    Record.find((err, records) => { //db에서 값들을 모두 꺼내와서 
        if(err) //에러시발생시
         {
           console.status(500).send({error : 'database failure~'});
           return;
         }
         record : records;
         //console.log(records);
         res.render('index', {record:records, bright:bright, temp:temp, humi:humi, discom:discom, level:level}); //각 값들을 index.pug로 렌더링할 때 함께 넘겨준다
    })
})

//LED 색상 제어시 필요한 라우터
router.post('/action', function (req, res) {
   //var id = req.query.id;
   var color = req.body.color    //POST방식으로 color값의 value를 읽어온다
   var bright = 100;

    if(color == "on"){
        arduinoSerialPort.write("o");
        console.log('Led light is on!');
    } 
    if(color == "off") {
        arduinoSerialPort.write("f"+","+0);
        console.log("Led light is off!");
    }
    if(color == "red") {
        arduinoSerialPort.write("r"+","+100);   
        console.log("RED");
        console.log("r"+","+bright);
    }
    if(color == "green") {
        arduinoSerialPort.write("g"+","+100);
        console.log("green");
    }
    if(color == "blue") {
        arduinoSerialPort.write("b"+","+100);
        console.log("g"+","+bright);
    }
    if(color == "purple") {
        arduinoSerialPort.write("p"+","+100);
        console.log("purple");
    }
    if(color == "yellow") {
        arduinoSerialPort.write("y"+","+100);
        console.log("yellow");
    }
    if(color == "skyblue") {
        arduinoSerialPort.write("s"+","+100);
        console.log("skyblue");
    }
    if(color == "white") {
        arduinoSerialPort.write("a"+","+100);
        console.log("white");
    }
    if(color == "random")
    {
       arduinoSerialPort.write("AAAAAA");
       console.log("random");
    }

    Record.find((err, records) => {
        if(err)
         {
           console.status(500).send({error : 'database failure~'});
           return;
         }
         //console.log(records);
         res.render('index', {record:records, bright:bright, temp:temp, humi:humi, discom:discom, level:level});
    })
});

//LCD ON/OFF 할 때 필요한 라우터
router.post('/set', (req, res) => {
    var val = req.body.lcdset;  //lcdset의 value값 읽어온다.

    if(val == "on")
    {
      arduinoSerialPort.write("c");
      console.log("LCD ON");
    }
    else if(val == "off")
    {
      arduinoSerialPort.write("n");
      console.log("LCD OFF");
    }
     
    Record.find((err, records) => {
        if(err)
         {
           console.status(500).send({error : 'database failure~'});
           return;
         }
         //console.log(records);
         res.render('index', {record:records, bright:bright, temp:temp, humi:humi, discom:discom, level:level});
    })
   
})

//온도, 습도, 불쾌지수, 레벨 기록 삭제시 필요한 라우터
router.post('/delete', (req, res) =>{

    var seq = req.body.seq;
    
    if(seq == "del")
    {
        Record.deleteMany({1:1}, (err) => { //모두 삭제하므로 1==1 논리상 True인 점을 이용
            if(err) 
            {
                res.status(500).json({ error: 'database failure'});
                console.log("error!");
            }
            console.log("deleted!");
         })
    }

    Record.find((err, records) => {
        if(err)
         {
           console.status(500).send({error : 'database failure~'});
           return;
         }
         //console.log(records);
         res.render('index', {record:records, bright:bright, temp:temp, humi:humi, discom:discom, level:level});
     })
})


module.exports = router; //반드시 라우터와 연결해줌
