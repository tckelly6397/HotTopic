console.log("Hello world");

function getTemp() {
    console.log("Clicked");
    let longitude = document.getElementById('Longitude').value;
    let latitude = document.getElementById('Latitude').value;
    let date = document.getElementById('date');

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
            year: 'test',
            month: '5',
            day: '1',
            latitude,
            longitude
        }
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            displayText("hello world");
        })
        .catch(error => console.error('Error:', error));
}

function displayText(value) {
    document.getElementById('temp-out').innerText = value;
}
