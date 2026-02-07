async function getWeather(){
    const city = document.getElementById("cityInput").value
    const Weather = document.getElementById("weatherResult")

    if (!city) {
        alert("กรุณาใส่ชื่อเมืองที่จะดูสภาพอากาศ เช่น Bangkok ")
        return
    }

    try {
        Weather.innerHTML = "กำลังโหลดข้อมูลสภาพอากาศ .... "

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
    const geoRes = await fetch(geoUrl)
    const geoData = await geoRes.json()

    if(!geoData.results){
        Weather.innerHTML = "❌ ไม่พบเมืองนี้ครับ"
        return
    }

    const {latitude,longitude,name,country} = geoData.results[0]

    const WeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    const WeatherRes = await fetch(WeatherUrl)
    const WeatherData = await WeatherRes.json()

    const temp = WeatherData.current_weather.temperature
    const wind = WeatherData.current_weather.windspeed

    Weather.innerHTML = `
        <h3>📍 ${name}, ${country}</h3>
        <p> 🌡️ อุณหภูมิ: <b>${temp} °C</b></p>
        <p> 💨 แรงลม: <b>${wind} km/h</b></p>
    `;

    } catch (error) {
        console.log("Error:", error);
        Weather.innerHTML = "❌ เกิดข้อผิดพลาดบางอย่าง"
    }
}
