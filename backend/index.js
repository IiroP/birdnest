const express = require("express")
const xml2js = require("xml2js")

const parser = new xml2js.Parser({ explicitArray: false, attrkey: "ATTR" })
const app = express()

const positionUrl = "https://assignments.reaktor.com/birdnest/drones"
const personInfoUrl = "https://assignments.reaktor.com/birdnest/pilots"

app.use(express.static("build"))

// Fetch data from url and parse it
const fetchPositions = () => {
	fetch(positionUrl)
		.then(response => response.text())
		.then(data => parser.parseString(data, (err, result) => {
			if (data.includes("report")) {
				const newData = parseDrones(result)
				Promise.all(newData).then(res => {
					updatePositions(res)
				})
			} else {
				console.err("Unable to parse: ", data)
			}
		}))
}

// Fetch data every 2 seconds
const interval = setInterval(() => {
	fetchPositions()
}, 2000)

// Update positions array
const updatePositions = (newData) => {
	const lessThan10MinOld = drone => {
		const now = Date.now()
		return (now - drone.lastSeen <= 10 * 60 * 1000)
	}

	const newSerials = newData.map(drone => drone.serialNumber)
	const freshOld = positions.filter(drone => lessThan10MinOld(drone))
	const filteredOld = freshOld.filter(drone => !newSerials.includes(drone.serialNumber))
	positions = filteredOld.concat(newData)
}

// Returns an array of drones (only necessary information) in restricted area
const parseDrones = (data) => {
	//console.log(data)
	const allDrones = Object.values(data.report.capture)[1]
	const time = Date.parse(data.report.capture.ATTR.snapshotTimestamp)
	const violating = allDrones.filter(drone => droneInsideCircle(drone))
	const result = violating.map(async drone => {
		const owner = await getOwnerInfo(drone.serialNumber)
		const droneInfo = {
			serialNumber: drone.serialNumber,
			lastSeen: time,
			position: [drone.positionX, drone.positionY],
			distance: droneDistance(drone),
			owner: owner
		}
		return droneInfo
	})
	return result
}

// Calculate drone's distance to nest
const droneDistance = (drone) => {
	const distance = Math.sqrt(Math.pow(drone.positionX - 150000, 2) + Math.pow(drone.positionY - 150000, 2))
	if (distance < 100000 && distance < closestSighting) {
		closestSighting = distance
	}
	return distance
}

// Return boolean value whether the drone was in restricted zone
const droneInsideCircle = (drone) => {
	return (droneDistance(drone) <= 100000)
}

// Get owner info by serial number
const getOwnerInfo = async (serialNumber) => {
	try {
		const response = await fetch(`${personInfoUrl}/${serialNumber}`)
		const data = await response.json()
		const personInfo = {
			name: `${data.firstName} ${data.lastName}`,
			phone: data.phoneNumber,
			email: data.email
		}
		return personInfo
	} catch {
		console.log("Unknown person")
		return undefined
	}
}

let positions = []
let closestSighting = 100000 //distance to closest sighting (since server restart)

// Serve the data at /api
app.get("/api", (req, res) => {
	res.json(positions)
})

// Return the shortest comfirmed distance to the nest
app.get("/api/closest", (req, res) => {
	let distance = -1
	if (closestSighting < 100000) {
		distance = closestSighting
	}
	res.json({
		distance: distance
	})
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
	console.log(`Running on port ${PORT}`)
})