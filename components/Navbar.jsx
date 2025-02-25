import React from "react"
import { Globe, Search, Moon, Sun } from 'lucide-react'

export default function Navbar({ searchTerm, setSearchTerm, darkMode, toggleTheme }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Globe className="globe-icon" size={24} strokeWidth={1.5} />
                <h1>travel journal</h1>
            </div>
            <div className="nav-controls">
                <div className="search-container">
                    <Search size={18} strokeWidth={1.5} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button 
                    className="theme-toggle" 
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {darkMode ? (
                        <Sun size={18} strokeWidth={1.5} />
                    ) : (
                        <Moon size={18} strokeWidth={1.5} />
                    )}
                </button>
            </div>
        </nav>
    )
}