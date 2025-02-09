import React, { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import Card from "../components/Card"
import Footer from "../components/Footer"
import Loading from "../components/Loading"
import data from './data.js'

export default function App() {
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    
    useEffect(() => {
        // Simulate loading time
        setTimeout(() => setLoading(false), 1500)
    }, [])

    const filteredData = data.filter(item => 
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const cardData = filteredData.map((item, index) => (
        <Card
            key={item.id}
            {...item}
            animationDelay={index * 100}
        />    
    ))

    return (
        <div className="app">
            <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {loading ? (
                <Loading />
            ) : (
                <div className="card-container">
                    {cardData.length > 0 ? cardData : (
                        <div className="no-results">
                            No destinations found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
            <Footer />
        </div>
    )
}