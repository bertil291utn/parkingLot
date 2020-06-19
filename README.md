# Shayana - Park


> Android mobile application developed for searching parking Cayambe city



<img src="https://user-images.githubusercontent.com/24902525/76875113-1a7ecc80-683e-11ea-8764-a13ce690eb0d.png" alt="image" width="400" />

The application is still in development, developed in Ionic but is only available for android devices and online. It was written to help drivers find the nearest available parking space according to their position. 

## Live Demo

As it's just for Cayambe county in Ecuador to test you have to set your **geolocation** position phone (fake geolocation app) or browser near here `lat: 0.04065, long: -78.142787` and then you could see all available parking.

<a href="https://parkingappm.herokuapp.com/" target="_blank">Check it out</a>💻

## Built With

- Ionic 3.9.2
- SaSS 
- Oracle Apex

### Prerequisites

- Node JS v.9
- Java 
- Android Studio

### Install
Install Ionic 3.9.2
```
npm install -g ionic@3.9.2
```
Clone this repo

Install all npm dependencies
```
npm install
```
### Deploy

To deploy the application please write the localserver
```
ionic s
```
It will show in your browser

But if you want to try in your phone (Android)🤖
First, you have connected your device or have an emulated device in your machine.
```
ionic cordova run android
```

## Improvements 

- Adding WebSockets to update empty lots in real-time.
- Implement parking history showing the time, parking lot number and the person who printed the bill
- Write user authentication with social media (Google, Facebook, etc)
- Implement payment gateway with Stripe or others

## Authors

👤 **Bertil Tandayamo**

- Github: [@bertil291utn](https://github.com/bertil291utn)
- Twitter: [@btandayamo](https://twitter.com/batandayamo)
- LinkedIn: [Bertil Tandayamo](http://bit.ly/bertil_linkedin)

## Show your support

If you got until here, show your love hitting the ⭐️ button, I'd really appreciate it.
