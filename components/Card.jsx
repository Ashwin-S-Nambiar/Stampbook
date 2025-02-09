import React from "react"
import { MapPin, Calendar, ExternalLink } from 'lucide-react'

export default function Card({ 
    imageUrl, 
    location, 
    googleMapsUrl, 
    title, 
    startDate, 
    endDate, 
    description,
    animationDelay 
}) {
    return (
        <div 
            className="card"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="card-image-container">
                <img 
                    src={imageUrl} 
                    className="card-image"
                    alt={title}
                    loading="lazy"
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
            </div>
        </div>
    )
}