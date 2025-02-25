import React, { useState } from "react"
import { MapPin, Calendar, ExternalLink } from 'lucide-react'

export default function Card({ 
    imageUrl, 
    location, 
    googleMapsUrl, 
    title, 
    startDate, 
    endDate, 
    description,
    animationDelay,
    tags 
}) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div 
            className="card"
            style={{ animationDelay: `${animationDelay}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="card-image-container">
                {!imageLoaded && (
                    <div className="image-skeleton">
                        <div className="loading-spinner" />
                    </div>
                )}
                <img 
                    src={imageUrl} 
                    className={`card-image ${imageLoaded ? 'loaded' : ''}`}
                    alt={title}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    style={{
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.3s ease'
                    }}
                />
            </div>
            <div className="card-desc">
                <div className="location">
                    <MapPin size={16} className="pin" color="#F55A5A"/>
                    <h2>{location}</h2>
                    <a 
                        href={googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        View on Google Maps <ExternalLink size={12} />
                    </a>
                </div>    
                <h2>{title}</h2>
                <h3>
                    <Calendar size={14} className="calendar-icon" />
                    {startDate} - {endDate}
                </h3>
                <p>{description}</p>
                <div className="tags">
                    {tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}