console.log("Hello world");

document.onload = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    // Set the value of the date input to today's date
    document.getElementById('date').value = formattedDate;
};

function getTemp() {
    console.log("Clicked");
    let longitude = document.getElementById('Longitude').value;
    let latitude = document.getElementById('Latitude').value;
    let date = document.getElementById('date').value.split('-');

    let year = date[0];
    let month = date[1];
    let day = date[2];

    console.log(longitude);
    console.log(latitude);
    console.log(date);
    console.log(date.value);

    const url = 'https://1za65lmqib.execute-api.us-east-2.amazonaws.com/dev/temp' 
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({body: {
            year,
            month,
            day,
            latitude,
            longitude
        }
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            displayText(parseFloat(JSON.parse(data.body).prediction).toFixed(2));
        })
        .catch(error => console.error('Error:', error));
}

function displayText(value) {
    document.getElementById('temp-out').innerText = value;
}
