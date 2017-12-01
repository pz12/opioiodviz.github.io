/**
 * Created by maxtaggart on 11/10/17.
 */

d3.json("/app/data/ProjectData.json", (d)=>{
   this.model = new DataModel(d);
   beginTest()
});

function beginTest(){
    // const items = this.model.getData("DayOfTheWeek", "all", 2003);
    // for (let item of items){
    //     console.log(JSON.stringify(item, null, 2))
    // }
    // //console.log(JSON.stringify(DataModel.CategorizeItems(items), null, 2))

    let highestRate = {Male: {state: "", rate: 0., year: ""},
        Female: {state: "", rate: 0., year: ""}};
    let states = Object.keys(this.model.data.States);
    states.push("all");
    let years = Object.keys(this.model.data.Years);
    years.push("all");

    for (let stateName of states){
        for (let year of years){
            let data = this.model.getData("Gender", stateName, year);
            for (let datum of data){
                console.log(datum["Crude Rate"]);
                if (highestRate[datum.Gender].rate < +datum["Crude Rate"]){
                    highestRate[datum.Gender].state = stateName;
                    highestRate[datum.Gender].rate = +datum["Crude Rate"];
                    highestRate[datum.Gender].year = year;
                }
            }
        }
    }
    console.log(JSON.stringify(highestRate))
}
