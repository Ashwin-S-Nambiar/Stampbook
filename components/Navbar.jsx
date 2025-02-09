import React from "react"
import { Globe, Search } from 'lucide-react'

export default function Navbar({ searchTerm, setSearchTerm }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Globe className="globe-icon" size={24} />
                <h1>my travel journal.</h1>
            </div>
            <div className="search-container">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
        </nav>
    )
}