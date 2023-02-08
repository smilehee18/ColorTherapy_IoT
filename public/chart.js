var temp = new Array();
var humid = new Array();
var discom = new Array();
var level = new Array();
var tmin; var tmax; var tavg;
var hmin; var hmax; var havg;
var dismax; var dismin; var disavg;
var tsum = 0; var hsum = 0; var dissum = 0;

function dataChart(x)
{
  var chart = document.getElementById("dataChart");
  var rlength = document.getElementById("table").rows.length-1;

    for(var i = 0; i < rlength; i++)
    {
      temp[i] = parseInt(document.getElementById("temp"+i).innerHTML);
      humid[i] = parseInt(document.getElementById("humid"+i).innerHTML);
      discom[i] = parseInt((document.getElementById("discom"+i)).innerHTML);
      parseInt(temp[i]);
      parseInt(humid[i]);
      parseInt(discom[i]);
    }

    tmin = temp[0];
    hmin = humid[0];
    dismin = discom[0];

    tmax = temp[0];
    hmax = humid[0];
    dismax = discom[0];

    for(var j = 0; j < rlength; j++)
    {
      tsum = tsum + temp[j];
      hsum += humid[j];
      dissum += discom[j];

      tmin = (tmin >= temp[j]) ? temp[j] : tmin;
      if(tmax <= temp[j]) tmax = temp[j];
      if(hmin >= humid[j]) hmin = humid[j];
      if(hmax <= humid[j]) hmax = humid[j];
      if(dismin >= discom[j]) dismin = discom[j];
      if(dismax <= discom[j]) dismax = discom[j];
    
    }
    tavg = tsum/rlength;
    havg = hsum/rlength;
    disavg = dissum/rlength;

  // var ctx = document.getElementById('dataChart');

    const data = {
      labels : [
        '최솟값',
        '평균',
        '최댓값'
      ],
      datasets: [{
        type : 'bar',
        label : '온도',
        data : [tmin, tavg, tmax],
        borderColor : 'rgb(255, 99, 132)',
        backgroundColor : 'rgba(102, 255, 204, 0.8)'
      }, {
        type : 'bar',
        label : '습도',
        data : [hmin, havg, hmax],
        borderColor : 'rgb(255,99,132)',
        backgroundColor : 'rgba(204,255,153,0.8)'
      },
      {
        type : 'line',
        label : '불쾌지수',
        data : [dismin, disavg, dismax],
        borderColor : 'rgb(255,99,132)',
        backgroundColor : 'rgba(255, 80, 80, 0.8)'
      }]
    };

  new Chart(chart, {
    data : data,
    options: {
      scales : {
        y : {
          beginAtZero : true
        }
      }
    }
 })

  //차트 보이기 & 숨기기 구현
  var btn = document.getElementById("cbutton");

  if(btn.innerHTML == '그래프로 보기')
  {
    chart.style.display = '';
    //btn.innerHTML = "차트 숨기기";
    btn.style.display = 'none';

  }
  // if(btn.ineerHTML == '차트 숨기기')// 차트 보여졌는데 버튼을 눌렀을 때
  // {
  //   chart.style.display = 'none';
  //   btn.innerHTML = "차트 보기";
  // }
  

}

function handleChart(x)
{
  var table = document.getElementById("table");
  var btn = document.getElementById("rbutton");
  if(table.style.display == "none")
  {
    table.style.display = '';
    btn.innerHTML = "표 숨기기";
  }
  else  // 표가 보여졌는데 버튼을 눌렀을 때
  {
    table.style.display = 'none';
    btn.innerHTML = "기록 보기";
  }
}

function lcdset(x)
{ 
  var btn = document.getElementById("lcd");
  if(btn.innerHTML == "LCD 끄기")
  {
    btn.innerHTML = "ffffff";
  } 
  else //버튼의 문자열이 LCD 켜기라면,
  {
    btn.innerHTML = "LCD 끄기";
  }
}




