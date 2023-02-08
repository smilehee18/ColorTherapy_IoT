#include <LiquidCrystal_I2C.h>   //LCD이용하기 위해 필요한 라이브러리
#include <dht11.h>               //DHT11온습도 이용하기 위해 필요
#include <TimerOne.h>            //동시에 일을 하기위해(멀티테스킹) 필요

#define r_led 9
#define g_led 10
#define b_led 11
#define DHT11PIN 12

dht11 DHT11;
LiquidCrystal_I2C lcd(0x27, 16, 2);
int level = 0;
float temp, humid, discom;
char readchar;
int bright;
int state = 1;
volatile int isRandom = 0;

void checking()  //8초에 한번씩 온도, 습도, 불쾌지수, 레벨 값을 시리얼 포트에 쓴다.
{
    int chk = DHT11.read(DHT11PIN);
    char recv_data;
    switch(chk)
    {
      case DHTLIB_OK :
                     //Serial.write('yes');
      case DHTLIB_ERROR_CHECKSUM :
                     //Serial.write('no');
                     break;

      case DHTLIB_ERROR_TIMEOUT :
                    //Serial.write('no');
                    break;
    }

    temp = DHT11.temperature; //온도
    humid = DHT11.humidity;   //습도
    discom = 1.8*(temp)-0.55*(1-humid/100)*(1.8*(temp)-26)+32;   //온습도 값을 이용하여 불쾌지수 계산

    if(discom>=0&&discom<68) level = 1;            //불쾌지수 값에 따른 레벨 계산
    else if(discom>=68 && discom<75) level = 2;
    else if(discom>=75 && discom<80) level = 3;
    else if(discom>=80 && discom<=100) level = 4;
    else level = -1;
   
    Serial.print(temp);  //data를 공백으로 분리하여송전송
    Serial.print(' ');
    Serial.print(humid);
    Serial.print(' ');
    Serial.print(discom);
    Serial.print(' ');
    Serial.print(level);
    Serial.println();
} 

void convertState(char ch, int bright)  //LED색상을 변경하기 위한 함수 & LCD 온오프시에도 
{
  if(ch == 'f')
  {
    digitalWrite(r_led,LOW);
    digitalWrite(g_led,LOW);
    digitalWrite(b_led,LOW);
    delay(50);
  }
  if(ch == 'r')
  {
    analogWrite(r_led,255);
    analogWrite(g_led,LOW);
    analogWrite(b_led,LOW);
  }
  if(ch == 'g')
  {
    analogWrite(r_led,LOW);
    analogWrite(g_led,bright);
    analogWrite(b_led,LOW);
    delay(50);
  }
  if(ch == 'b')
  {
    analogWrite(r_led,LOW);
    analogWrite(g_led,LOW);
    analogWrite(b_led,bright);
  }
  if(ch == 'p')
  {
    analogWrite(r_led,bright);
    analogWrite(g_led,LOW);
    analogWrite(b_led,bright);
  }
  if(ch == 'y')
  {
    analogWrite(r_led,bright);
    analogWrite(g_led,bright);
    analogWrite(b_led,LOW);
    delay(500);
  }
  if(ch == 's')
  {
    analogWrite(r_led,LOW);
    analogWrite(g_led,bright);
    analogWrite(b_led,bright);
  }
  if(ch == 'a')
  {
    analogWrite(r_led,bright);
    analogWrite(g_led,bright);
    analogWrite(b_led,bright);
  }
  if(ch == 'v')
  {
    analogWrite(g_led,bright);
    analogWrite(b_led,bright);
    analogWrite(r_led,bright);
  }
  if(ch == 'c')    //LCD 켜주세요
  {
    state = 1;  
  }
  if(ch == 'n')   //LCD 꺼주세요
  {
    state = 2;
  }

}

void setup() {
   Serial.begin(9600);
   pinMode(r_led,OUTPUT);
   pinMode(g_led,OUTPUT);
   pinMode(b_led,OUTPUT);
   analogWrite(b_led, LOW);
   analogWrite(g_led, LOW);
   analogWrite(r_led, LOW);

  Timer1.initialize(8000000); //8초를 의미
  Timer1.attachInterrupt(checking); //8초에 한번씩 타이머 Interrupt(정해진 동작을 하고 다시 메인루프로 돌아옴)를 실행하여 해당 함수를 실행할게요
  
  lcd.init();   
  lcd.backlight();
  lcd.setCursor(0,0);
  //lcd.print("Hello World!!");
}

void loop() {
  int chk = DHT11.read(DHT11PIN);
  char recv_data;
   switch(chk)
  {
    case DHTLIB_OK :
                     //Serial.write('yes');
    case DHTLIB_ERROR_CHECKSUM :
                     //Serial.write('no');
                     break;

    case DHTLIB_ERROR_TIMEOUT :
                    //Serial.write('no');
                    break;
  }

   temp = DHT11.temperature; //온도
   humid = DHT11.humidity;   //습도
   discom = 1.8*(temp)-0.55*(1-humid/100)*(1.8*(temp)-26)+32;   //온습도 값을 이용하여 불쾌지수 계산

   if(discom>=0&&discom<68) level = 1; 
   else if(discom>=68 && discom<75) level = 2;
   else if(discom>=75 && discom<80) level = 3;
   else if(discom>=80 && discom<=100) level = 4;
   else level = -1;

  if((Serial.available()>0)) {
        String string = Serial.readString();
        int length = string.length();
        //Serial.print(length);
        if(length==6) //Random 버튼 클릭 시에 
        {
          isRandom = 1; //flag변수를 1로 전환
        }
        else if(length>=1 && length<=2)  //LCD ON/OFF 버튼 클릭시
        {
          readchar = string.charAt(0);
          String str = string.substring(2,length);
          bright = str.toInt();
          if(bright == 100) bright = 255;
          else bright = 0;
          convertState(readchar, bright);
        }
        else  //RANDOM 버튼을 제외한 색상 버튼 클릭시 행실행
        {
         isRandom = 0;
         readchar = string.charAt(0);
         String str = string.substring(2,length);
         bright = str.toInt();
         if(bright == 100) bright = 255;
         else bright = 0;
         convertState(readchar, bright);
        }
      }

   if(state == 1)
   {
     lcd.backlight();
     lcd.display();
     lcd.setCursor(0,0); lcd.print("temp : "); lcd.print(temp); lcd.print("^C");
     lcd.setCursor(0,1); lcd.print("humid : "); lcd.print(humid); lcd.print("%");
     delay(500);
   }
   else if (state == 2) //버튼을 눌렀을 때 
   {
     lcd.clear();
     lcd.noBacklight();
     delay(500);
   }

   if(isRandom == 1) //RANDOM 버튼 클릭시-> 2초마다 LED색상 변경(메인루프에서 실행)
   {
    digitalWrite(r_led,HIGH);
    digitalWrite(g_led,HIGH);
    digitalWrite(b_led,HIGH);
    delay(2000);
    digitalWrite(r_led,HIGH);
    digitalWrite(g_led,HIGH);
    digitalWrite(b_led,LOW);
    delay(2000);
    digitalWrite(r_led,HIGH);
    digitalWrite(g_led,LOW);
    digitalWrite(b_led,HIGH);
    delay(2000);
    digitalWrite(r_led,LOW);
    digitalWrite(g_led,HIGH);
    digitalWrite(b_led,HIGH);
    delay(2000);
    digitalWrite(r_led,LOW);
    digitalWrite(g_led,LOW);
    digitalWrite(b_led,HIGH);
    delay(2000);
    digitalWrite(r_led,LOW);
    digitalWrite(g_led,HIGH);
    digitalWrite(b_led,LOW);
    delay(2000);
    digitalWrite(r_led,HIGH);
    digitalWrite(g_led,LOW);
    digitalWrite(b_led,LOW);
    delay(2000);
   }
   delay(500);
 }
