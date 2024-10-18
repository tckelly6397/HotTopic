const fs = require('fs');

// Read and parse the JSON file
let jsonData = JSON.parse(fs.readFileSync('file.json', 'utf-8'));

let text = "";

// Function to calculate the difference between latitudes and longitudes
function isWithinRange(lat1, lon1, lat2, lon2) {
    return Math.abs(lat1 - lat2) <= 2 && Math.abs(lon1 - lon2) <= 2;
}

// Array to hold filtered data
let filteredData = [];

// Loop through the array of objects to filter data
for (let i = 0; i < jsonData.length; i++) {
    let isUnique = true;
    for (let j = 0; j < filteredData.length; j++) {
        if (isWithinRange(jsonData[i].latitude, jsonData[i].longitude, filteredData[j].latitude, filteredData[j].longitude)) {
            isUnique = false;
            break;
        }
    }

    if (isUnique) {
        filteredData.push(jsonData[i]);
    }
}

// Generate text output for filtered data
for (let data of filteredData) {
    text += `${data.latitude},${data.longitude},,,\n`;
}

for (let data of filteredData) {
    delete data.growth_from_2000_to_2013;
    delete data.population;
    delete data.rank;
    delete data.state;
    delete data.city;
}

// Output the generated text
console.log(text);

fs.writeFileSync("plotter_output.txt", text, 'utf-8');

fs.writeFileSync('file_modified.json', JSON.stringify(filteredData, null, 2), 'utf-8');

