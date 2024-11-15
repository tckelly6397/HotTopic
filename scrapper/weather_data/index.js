const axios = require('axios');
const fs = require('fs');  // File system module to write data to CSV

const cities = JSON.parse(fs.readFileSync('../cities/file_modified.json', 'utf8'));

writeCities(77, 79);

async function writeCities(start, end) {
    for(let i = start; i <= end; i++) {
        console.log(i);
        const city = cities[i];
        await writeWeatherData(city.latitude, city.longitude)
    }
}

async function writeWeatherData(lat, long) {
    const params = {
        latitude: lat,
        longitude: long,
        start_date: "2014-10-18",
        end_date: "2024-10-16",
        daily: "temperature_2m_mean",
        temperature_unit: "fahrenheit",
        wind_speed_unit: "mph",
        precipitation_unit: "inch"
    };

    const url = "https://archive-api.open-meteo.com/v1/archive";

    await (async () => {
        try {
            const response = await axios.get(url, { params });
            const data = response.data;

            // Timezone and location attributes
            const utcOffsetSeconds = data.utc_offset_seconds;
            const daily = data.daily;

            // Create the weather data structure for CSV output
            const weatherData = daily.time.map((t, index) => {
                const date = new Date((new Date(t).getTime() + utcOffsetSeconds * 1000));
                return {
                    "mean temp": daily.temperature_2m_mean[index],  // Mean temperature
                    "date": date.toISOString().split('T')[0],       // Only the date
                };
            });

            // Create CSV header
            //let csvContent = "latitude,longitude,date,mean temp\n";
            let csvContent = "";

            // Append each weather data record to CSV content
            weatherData.forEach(entry => {
                csvContent += `${params.latitude},${params.longitude},${entry.date},${entry['mean temp']}\n`;
            });

            // Write the CSV data to a file
            // fs.writeFileSync('./weather_data3.csv', csvContent);
            fs.appendFileSync('./weather_data3.csv', csvContent);


            console.log(`City ${lat} ${long} written to weather_data3.csv`);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    })();
}

