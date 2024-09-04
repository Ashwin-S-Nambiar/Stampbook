import React from "react"

export default function Card(props) {
    return(
        <div className="card">
            <img src={props.imageUrl} className="card-image"/>
            <div className="card-desc">
                <div className="location">
                    <img src="../pin.png" className="pin"/>
                    <h2>{props.location}</h2>
                    <a href={props.googleMapsUrl} target="_blank">View on Google Maps</a>
                </div>    
                    <h2>{props.title}</h2>
                    <h3>{props.startDate} - {props.endDate}</h3>
                    <p>{props.description}</p>
            </div>
        </div>
    )
} 