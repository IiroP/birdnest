import axios from "axios"
import { useState, useEffect } from "react"

const baseUrl = "/api"

const Drone = ({drone}) => {
  const date = new Date(drone.lastSeen)
  let owner = "Unknown"
  if (drone.owner) {
    owner = `${drone.owner.name} (${drone.owner.phone}, ${drone.owner.email})`
  }
  return (
    <div>
      <h3>{drone.serialNumber}</h3>
      <ul>
        <li>Last seen: {date.toLocaleTimeString("fi-FI")}</li>
        <li>Distance: {Math.round(drone.distance / 1000)} m (closest: {Math.round(drone.closest / 1000)} m)</li>
        <li>Owner: {owner}</li>
      </ul>
    </div>
    
  )
}

const Drones = ({drones}) => {
  if (drones.length === 0) {
    return(
      <p>No sightings yet, waiting for data...</p>
    )
  } else {
    return (
      drones.map(drone => <Drone key={drone.serialNumber} drone={drone} />)
    )
  }
}

const App = () => {
  const [ drones, setDrones ] = useState([])

  const update = () => {
    //console.log("Updated")
    axios.get(baseUrl).then(response => setDrones(response.data))
  }

  const shortestDistance = () => {
    if (drones.length === 0) {
      return("-")
    } else {
      const closest = Math.min(...drones.map(drone => drone.closest))
      return(Math.round(closest / 1000) + " m")
    }
  }

  // Get initial data
  useEffect(() => {
    update()
  }, [])

  // Refresh data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      update()
    }, 5000)
    return () => clearInterval(interval)
  }, [drones])

  return (
    <div>
      <h1>Drone sightings</h1>
      <p>Closest sighting: {shortestDistance()}</p>
      <h2>All sightings:</h2>
      <Drones drones={drones} />
    </div>

  )
}

export default App;
