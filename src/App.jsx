import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import Card from "../components/Card"
import Footer from "../components/Footer"
import Loading from "../components/Loading"
import data from './data.js'

export default function App() {
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTags, setSelectedTags] = useState([])
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        // Set initial theme
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setDarkMode(isDark)
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
        
        setTimeout(() => setLoading(false), 1500)
    }, [])

    const toggleTheme = () => {
        setDarkMode(!darkMode)
        document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light')
    }

    const filteredData = data.filter(item => {
        const matchesSearch = item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTags = selectedTags.length === 0 || 
                           selectedTags.some(tag => item.tags.includes(tag))
        return matchesSearch && matchesTags
    })

    const cardData = filteredData.map((item, index) => (
        <Card
            key={item.id}
            {...item}
            animationDelay={index * 100}
        />    
    ))

    const toggleTag = (tag) => {
        setSelectedTags(prevTags => 
            prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
        )
    }

    return (
        <>
            <Navbar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
            />
            <div className="main-container">
                <div className="tags-container">
                    {!loading && (
                        <div className="tags-container">
                            {getAllUniqueTags(data).map(tag => (
                                <button 
                                    key={tag}
                                    className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="card-container">
                    {loading ? (
                        <Loading />
                    ) : (
                        <div className="card-container">
                            {cardData.length > 0 ? cardData : (
                                <div className="no-results">
                                    No destinations found matching &qout;{searchTerm}&qout;
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

function getAllUniqueTags(data) {
    return [...new Set(data.flatMap(item => item.tags))]
}