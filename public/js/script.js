
let datamodel; //Global variable that any class can access
// let CofDeath = new CausesOfDeath();
// let weekdays = new DaysOfWeek();
// let USMap = new USmap();
let CofDeath;
let weekdays;
let USMap;
let race;
let gender;
let current_year;
let current_state = "all";

d3.json("data/ProjectData.json", (d)=>{
  // console.log(d)



   datamodel = new DataModel(d);
   CofDeath = new CausesOfDeath();
   weekdays = new DaysOfWeek();
   USMap = new USmap();
   race = new Race();
   gender = new Gender();
   var initial_year = '1999';
   current_year = initial_year
   weekdays.update(initial_year, "all");
   USMap.update(initial_year);
   race.update(initial_year, "all");
   gender.update(initial_year, "all");
   CofDeath.update(initial_year);
    // beginTest()
});



function changeYear(year) {
  current_year = year;
  weekdays.update(year, current_state);
  USMap.update(year);
  race.update(year, current_state);
  gender.update(year, current_state);
  CofDeath.update(year);
}

function updateCurrentState(state){
    current_state = state;
}

function update(year, state) {
  current_year = year;
  weekdays.update(year, state);
  USMap.update(year);
  race.update(year, state);
  gender.update(year, state);
  CofDeath.update(year);
}

// https://stackoverflow.com/questions/34934577/html-range-slider-with-play-pause-loop
var myTimer;
var timerBool;

function play() {
  clearInterval (myTimer);
  timerBool = false;
  var state = "all";
  if(d3.select('.activeState')['_groups'][0][0]) {
    state = d3.select('.activeState')['_groups'][0][0]['__data__'].State;
  }
  console.log(state)
  myTimer = setInterval (function() {
       var b= d3.select("#rangeSlider");
       var t = (+b.property("value") + 1) % (+b.property("max") + 1);
       if (t == 0) { t = +b.property("min"); }
       b.property("value", t);
       update(t, state);
     }, 1000);
  timerBool = true;
}

function pause() {
  clearInterval (myTimer);
  timerBool = false;
}

function allStates() {
  var tempbool = timerBool;
  updateCurrentState("all");
  pause();
  var year = current_year;
  d3.selectAll('.activeState').classed("activeState", false);
  console.log(year);
  weekdays.update(year, "all");
  race.update(year, "all");
  gender.update(year, "all");
  if(tempbool==true) {
    play();
  }
}


// d3.csv("data/Cause_of_Death_2000.csv", function(error, codData){
//     //CofDeath.update(codData);
// });
