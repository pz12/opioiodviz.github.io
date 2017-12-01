/**
 * Created by maxtaggart on 11/10/17.
 */

/********************************************************
 * This class is meant to serve as a wrapper for the raw JSON data object, facilitating data querying and manipulation.
 * The main method of this class is `getData()` which takes three arguments specifying the data category (Race, Gender,
 * Totals, DayOfTheWeek, etc.), the geographical granularity (state name, or "all" for all states), and the time
 * granularity (year, or "all" for all years). This method returns a list of objects that match the arguments.
 *
 * Additionally the class contains some convenience methods for categorizing a list of objects that are not all of the
 * same category. See DataModel.CategorizeItems() for more info.
 * It contains a second convenience method for pretty-printing the first n objects in a list, which is slightly faster
 * than inspecting an object in the debugger.
 *
 * */

class DataModel{
    constructor(dataObj){
        this.data = dataObj;
        //Get list of possible years
        this.possibleStates = Object.keys(dataObj.States);
        this.possibleYears = Object.keys(dataObj.States[this.possibleStates[0]].Years);
        this.possibleCategories= ["CauseOfDeath", "DayOfTheWeek", "Gender", "PlaceOfDeath", "Race", "Totals"]

    }

    //The following method will extract the requested data from the data model and return a list of objects that meet
    // the query criteria. For example to obtain the gender data for Alabama for 1999 the call would be
    // `getData("Gender", "Alabama", 1999)`. To get all years, all states, or all categories, simply enter "all", e.g.
    // to get race data for all years for all states the call would be `getData("Race", "all", "all")`. Year may
    // specified as a number or a string.
    getData(categorySpecifier, stateSpecifier, yearSpecifier){
        stateSpecifier = stateSpecifier.toString();
        yearSpecifier = yearSpecifier.toString();
        if (this.possibleCategories.indexOf(categorySpecifier) == -1 && categorySpecifier != "all"){
            let list = this.possibleCategories.slice(0);
            list.push("all");
            throw Error(`Invalid Argument: ${categorySpecifier} is not a valid data category. 
            The following is a list of valid data categories: ${list.toString()}`)
        }
        if (this.possibleStates.indexOf(stateSpecifier) == -1 && stateSpecifier != "all"){
            throw Error(`Invalid Argument: ${stateSpecifier} is not a valid state name.`)
        }
        if (this.possibleYears.indexOf(yearSpecifier) == -1 && yearSpecifier != "all"){
            const yearsAsNums = this.possibleYears.map((y)=>{return +y});
            throw Error(`Invalid Argument: ${yearSpecifier} is not a valid year. The max year is ${Math.max(yearsAsNums)} and the min year is ${Math.min(yearsAsNums)} in case that's helpful...`)
        }

        const outputObjects = [];
        if (categorySpecifier == "CauseOfDeath"){
            if (yearSpecifier == "all"){
                outputObjects.push(...this.data[categorySpecifier + "Rates"])
            }
            else {
                outputObjects.push(...this.data.Years[yearSpecifier][categorySpecifier + "Rates"])
            }
            return outputObjects
        }
        if (yearSpecifier == "all"){
            if (stateSpecifier == "all"){
                if (categorySpecifier == "all"){
                    //Year, state, and category are all "all"
                    // Push all top-level ("AllYearAllState") objects to the output list.
                    for (let key of Object.keys(this.data)){
                        if (key == "States" || key == "Years"){
                            continue;
                        }
                        outputObjects.push(...this.data[key]);
                    }
                }
                else{
                    // Pull the by-state all-year totals and add a "state" field to each object.
                    if (categorySpecifier == "Totals"){
                        Object.keys(this.data.States).forEach((stateName, index)=>{
                            let stateObj = this.data.States[stateName];
                            let requestedObjs = stateObj[categorySpecifier + "Rates"];
                            for (let indivObj of requestedObjs){
                                indivObj.State = stateName;
                            }
                            outputObjects.push(...requestedObjs)
                        });
                    }
                    else {
                        outputObjects.push(...this.data[categorySpecifier + "Rates"])
                    }
                }
            }
            else {
                //Year is "all"
                const stateObj = this.data.States[stateSpecifier];
                if (categorySpecifier == "all"){
                    //Push all state-level time-aggregate objects to the output list for this state.
                    for (let key of Object.keys(stateObj)) {
                        if (key == "Years" || key == "StateName") {
                            continue;
                        }
                        outputObjects.push(...stateObj[key]);
                    }
                }
                else {
                    // Year is "all", state and category have been specified
                    outputObjects.push(...stateObj[categorySpecifier + "Rates"])
                }

            }
        }
        else {
            //Year was specified
            if (stateSpecifier == "all"){
                const yearObj = this.data["Years"][yearSpecifier];
                if (categorySpecifier == "all"){
                    //Years was specified, state and category are "all"
                    //Push all year-level geographically aggregated objects to the output list
                    for (let key of Object.keys(yearObj)) {
                        if (key == "Year") {
                            continue;
                        }
                        outputObjects.push(...yearObj[key]);
                    }

                }
                else {
                    //Year and category were specified, state was "all"
                    //Push all year-level objects to the output list that match the requested category
                    if (categorySpecifier == "Totals"){
                        Object.keys(this.data.States).forEach((stateName, index)=>{
                            let stateObj = this.data.States[stateName].Years[yearSpecifier];
                            let requestedObjs = stateObj[categorySpecifier + "Rates"];
                            for (let indivObj of requestedObjs){
                                indivObj.State = stateName;
                                indivObj.Year = yearSpecifier;
                            }
                            outputObjects.push(...requestedObjs)
                        });
                    }
                    else {
                        outputObjects.push(...yearObj[categorySpecifier + "Rates"])
                    }
                }
            }
            else {
                //Year and state were specified
                const stateYearObj = this.data["States"][stateSpecifier]["Years"][yearSpecifier];
                if (categorySpecifier == "all"){
                    // Year and state were specified, category was "all"
                    for (let key of Object.keys(stateYearObj)) {
                        if (key == "Years"){
                            continue;
                        }
                        outputObjects.push(...stateYearObj[key]);
                    }
                }
                else {
                    //Year, state, and category were specified
                    outputObjects.push(...stateYearObj[categorySpecifier + "Rates"])
                }
            }

        }
        return outputObjects;
    }

    //The following convenience method takes a list of data objects that are of mixed category and sorts them into a dictionary
    // keyed by category type. e.g. it coult take a list returned by `getData("all", "Alabama", 2001)` and returns a dictionary
    // like {"Race" : [{raceObj1}, {raceObj2}], "Gender" : [{genderObj1}, {genderObj2}], ...} this is useful because
    // individual data objects do not contain an explicit "Data Category" field.
    static CategorizeItems(items){
        const categorizedItems = {
            "DayOfTheWeek": [],
            "Gender": [],
            "Race": [],
            "PlaceOfDeath": [],
            "Totals" : []
        };
        for (let item of items){
            const itemKeys = Object.keys(item);
            if (itemKeys.indexOf("Place of Death") != -1){
                categorizedItems.PlaceOfDeath.push(item)
            }
            else if (itemKeys.indexOf("Weekday") != -1){
                categorizedItems.DayOfTheWeek.push(item)
            }
            else if (itemKeys.indexOf("Race") != -1){
                categorizedItems.Race.push(item)
            }
            else if (itemKeys.indexOf("Gender") != -1){
                categorizedItems.Gender.push(item)
            }
            else if (itemKeys.length == 3){
                categorizedItems.Totals.push(item)
            }
            else {
                throw Error(`Runtime Error: The following object could not be matched to a
                category type: ${JSON.stringify(item, null, 2)} `)
            }
        }
        return categorizedItems;
    }

    // The following convenience method takes a list of data items and pretty prints the first three by default. This is to
    // expedite the inspection of data objects when they are being used in visualizations. Ofter it is nice to
    // have a reminder of object property names, data types, capitalization, etc.
    static PrintSample(items, numItems=3){
        let count = 0;
        for (let item of items){
            if (++count < numItems){
                console.log(JSON.stringify(item, null, 2))
            }
            else {
                break;
            }
        }
    }
}


// The following is an abridged version of the raw JSON dataObj
dataObjSummary = {
    "CauseOfDeathRates": [
        {
            "Cause_of_Death": "Accidental poisoning by and exposure to other and unspecified drugs, medicaments and biological substances",
            "ICD_Code": "X44",
            "Num_Deaths": "204908"
        },
        {
            "Cause_of_Death": "Accidental poisoning by and exposure to other drugs acting on the autonomic nervous system",
            "ICD_Code": "X43",
            "Num_Deaths": "358"
        }
    ],
    "DayOfTheWeekRates": [
        {
            "Deaths": "85463",
            "Weekday": "Sunday",
            "Weekday Code": "1"
        },
        {
            "Deaths": "74719",
            "Weekday": "Monday",
            "Weekday Code": "2"
        }
    ],
    "GenderRates": [
        {
            "Crude Rate": "8.1",
            "Deaths": "210255",
            "Gender": "Female",
            "Gender Code": "F",
            "Population": "2599795280"
        },
        {
            "Crude Rate": "13.9",
            "Deaths": "350441",
            "Gender": "Male",
            "Gender Code": "M",
            "Population": "2512823596"
        }
    ],
    "PlaceOfDeathRates": [
        {
            "Crude Rate": "Not Applicable",
            "Deaths": "55632",
            "Place of Death": "Medical Facility - Inpatient",
            "Place of Death Code": "1",
            "Population": "Not Applicable"
        },
        {
            "Crude Rate": "Not Applicable",
            "Deaths": "84687",
            "Place of Death": "Medical Facility - Outpatient or ER",
            "Place of Death Code": "2",
            "Population": "Not Applicable"
        }
    ],
    "RaceRates": [
        {
            "Crude Rate": "9.6",
            "Deaths": "6227",
            "Population": "64619414",
            "Race": "American Indian or Alaska Native",
            "Race Code": "1002-5"
        },
        {
            "Crude Rate": "1.9",
            "Deaths": "5044",
            "Population": "264386329",
            "Race": "Asian or Pacific Islander",
            "Race Code": "A-PI"
        }
    ],
    "States": {
        "Alabama": {
            "DayOfTheWeekRates": [
                {
                    "Deaths": "1144",
                    "Weekday": "Sunday",
                    "Weekday Code": "1"
                },
                {
                    "Deaths": "901",
                    "Weekday": "Monday",
                    "Weekday Code": "2"
                }
            ],
            "GenderRates": [
                {
                    "Crude Rate": "7.7",
                    "Deaths": "3127",
                    "Gender": "Female",
                    "Gender Code": "F",
                    "Population": "40817084"
                },
                {
                    "Crude Rate": "10.9",
                    "Deaths": "4173",
                    "Gender": "Male",
                    "Gender Code": "M",
                    "Population": "38336447"
                }
            ],
            "PlaceOfDeathRates": [
                {
                    "Crude Rate": "Not Applicable",
                    "Deaths": "842",
                    "Place of Death": "Medical Facility - Inpatient",
                    "Place of Death Code": "1",
                    "Population": "Not Applicable"
                },
                {
                    "Crude Rate": "Not Applicable",
                    "Deaths": "938",
                    "Place of Death": "Medical Facility - Outpatient or ER",
                    "Place of Death Code": "2",
                    "Population": "Not Applicable"
                }
            ],
            "RaceRates": [
                {
                    "Crude Rate": "Unreliable",
                    "Deaths": "18",
                    "Population": "539696",
                    "Race": "American Indian or Alaska Native",
                    "Race Code": "1002-5"
                },
                {
                    "Crude Rate": "Unreliable",
                    "Deaths": "11",
                    "Population": "945413",
                    "Race": "Asian or Pacific Islander",
                    "Race Code": "A-PI"
                }
            ],
            "StateName": "Alabama",
            "TotalsRates": [
                {
                    "Crude Rate": "1021.3",
                    "Deaths": "808363",
                    "Population": "79153531"
                }
            ],
            "Years": {
                "1999": {
                    "CauseOfDeathRates": [
                        {
                            "Cause_of_Death": "Accidental poisoning by and exposure to antiepileptic, sedative-hypnotic, antiparkinsonism and psychotropic drugs, not elsewhere classified",
                            "ICD_Code": "X41",
                            "Num_Deaths": "671"
                        },
                        {
                            "Cause_of_Death": "Accidental poisoning by and exposure to narcotics and psychodysleptics [hallucinogens], not elsewhere classified",
                            "ICD_Code": "X42",
                            "Num_Deaths": "6009"
                        }
                    ],
                    "DayOfTheWeekRates": [
                        {
                            "Deaths": "30",
                            "Weekday": "Sunday",
                            "Weekday Code": "1"
                        },
                        {
                            "Deaths": "22",
                            "Weekday": "Monday",
                            "Weekday Code": "2"
                        }
                    ],
                    "GenderRates": [
                        {
                            "Crude Rate": "3.3",
                            "Deaths": "75",
                            "Gender": "Female",
                            "Gender Code": "F",
                            "Population": "2293259"
                        },
                        {
                            "Crude Rate": "4.2",
                            "Deaths": "89",
                            "Gender": "Male",
                            "Gender Code": "M",
                            "Population": "2136882"
                        }
                    ],
                    "PlaceOfDeathRates": [
                        {
                            "Crude Rate": "Not Applicable",
                            "Deaths": "37",
                            "Place of Death": "Medical Facility - Inpatient",
                            "Place of Death Code": "1",
                            "Population": "Not Applicable"
                        },
                        {
                            "Crude Rate": "Not Applicable",
                            "Deaths": "23",
                            "Place of Death": "Medical Facility - Outpatient or ER",
                            "Place of Death Code": "2",
                            "Population": "Not Applicable"
                        }
                    ],
                    "RaceRates": [
                        {
                            "Crude Rate": "Suppressed",
                            "Deaths": "Suppressed",
                            "Population": "22666",
                            "Race": "American Indian or Alaska Native",
                            "Race Code": "1002-5"
                        },
                        {
                            "Crude Rate": "Suppressed",
                            "Deaths": "Suppressed",
                            "Population": "33494",
                            "Race": "Asian or Pacific Islander",
                            "Race Code": "A-PI"
                        }
                    ],
                    "TotalsRates": [
                        {
                            "Crude Rate": "3.7",
                            "Deaths": "164",
                            "Population": "4430141"
                        }
                    ],
                    "Year": "1999"
                },
                "2000": {
                    "DayOfTheWeekRates": [
                    ],
                    "GenderRates": [
                    ],
                    "PlaceOfDeathRates": [
                    ],
                    "RaceRates": [
                    ],
                    "TotalsRates": [
                    ],
                    "Year": "2000"
                },

            }

        }
    },
    "Years": {
        "1999": {
            "DayOfTheWeekRates": [
                {
                    "Deaths": "2523",
                    "Weekday": "Sunday",
                    "Weekday Code": "1"
                },
                {
                    "Deaths": "2181",
                    "Weekday": "Monday",
                    "Weekday Code": "2"
                }
            ],
            "GenderRates": [
                {
                    "Crude Rate": "3.8",
                    "Deaths": "5373",
                    "Gender": "Female",
                    "Gender Code": "F",
                    "Population": "142237295"
                },
                {
                    "Crude Rate": "8.1",
                    "Deaths": "11097",
                    "Gender": "Male",
                    "Gender Code": "M",
                    "Population": "136802873"
                }
            ],
            "PlaceOfDeathRates": [
                {
                    "Crude Rate": "Not Applicable",
                    "Deaths": "1935",
                    "Place of Death": "Medical Facility - Inpatient",
                    "Place of Death Code": "1",
                    "Population": "Not Applicable"
                },
                {
                    "Crude Rate": "Not Applicable",
                    "Deaths": "2673",
                    "Place of Death": "Medical Facility - Outpatient or ER",
                    "Place of Death Code": "2",
                    "Population": "Not Applicable"
                }
            ],
            "RaceRates": [
                {
                    "Crude Rate": "4.7",
                    "Deaths": "132",
                    "Population": "2832761",
                    "Race": "American Indian or Alaska Native",
                    "Race Code": "1002-5"
                },
                {
                    "Crude Rate": "1.1",
                    "Deaths": "130",
                    "Population": "11346496",
                    "Race": "Asian or Pacific Islander",
                    "Race Code": "A-PI"
                }
            ],
            "TotalsRates": [
                {
                    "Crude Rate": "857.0",
                    "Deaths": "2391399",
                    "Population": "279040168"
                }
            ],
            "Year": "1999"
        },
        "2000": {
            "DayOfTheWeekRates": [
                {
                    "Deaths": "2544",
                    "Weekday": "Sunday",
                    "Weekday Code": "1"
                },
                {
                    "Deaths": "2294",
                    "Weekday": "Monday",
                    "Weekday Code": "2"
                }
            ],
            "GenderRates": [
                {
                    "Crude Rate": "3.9",
                    "Deaths": "5618",
                    "Gender": "Female",
                    "Gender Code": "F",
                    "Population": "143368343"
                },
                {
                    "Crude Rate": "8.2",
                    "Deaths": "11371",
                    "Gender": "Male",
                    "Gender Code": "M",
                    "Population": "138053563"
                }
            ],
            "PlaceOfDeathRates": [
                {
                    "Crude Rate": "Not Applicable",
                    "Deaths": "1917",
                    "Place of Death": "Medical Facility - Inpatient",
                    "Place of Death Code": "1",
                    "Population": "Not Applicable"
                },
                {
                    "Crude Rate": "Not Applicable",
                    "Deaths": "2756",
                    "Place of Death": "Medical Facility - Outpatient or ER",
                    "Place of Death Code": "2",
                    "Population": "Not Applicable"
                }
            ],
            "RaceRates": [
                {
                    "Crude Rate": "4.6",
                    "Deaths": "137",
                    "Population": "2984150",
                    "Race": "American Indian or Alaska Native",
                    "Race Code": "1002-5"
                },
                {
                    "Crude Rate": "1.0",
                    "Deaths": "123",
                    "Population": "11757685",
                    "Race": "Asian or Pacific Islander",
                    "Race Code": "A-PI"
                }
            ],
            "TotalsRates": [
                {
                    "Crude Rate": "854.0",
                    "Deaths": "2403351",
                    "Population": "281421906"
                }
            ],
            "Year": "2000"
        }
    }
};
