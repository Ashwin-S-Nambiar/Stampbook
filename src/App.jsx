import React from "react"
import Navbar from "../components/Navbar.jsx" 
import Card from "../components/Card.jsx"
import Footer from "../components/Footer.jsx"
import data from './data.js'
// console.log(data)

export default function App() {
    const cardData = data.map(item => {
        return(
            <Card
                key={item.id}
                {...item}
            />    
        )
    })
    return(
        <div>
            <Navbar />
            <div className="card-container">
                {cardData}
            </div>
            <Footer />
        </div>
    )
}