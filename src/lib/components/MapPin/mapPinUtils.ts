interface MultiplePinLocation {
    cx: number
    cy: number
    size: number
}

export function computeMultiplePinLocation(count: number, index: number): MultiplePinLocation {
    const angle = Math.PI / count
    const s = Math.sin(angle)
    let baseRadius = 33 / 2
    if (count === 5) baseRadius = 48 / 2
    if (count === 6) baseRadius = 48 / 2
    if (count === 7) baseRadius = 36
    const r = (baseRadius * s) / (1 - s)

    const startAngle = 0.0
    const phi = (Math.PI * startAngle) / 180 + angle * index * 2
    let cx = (baseRadius + r) * Math.cos(phi)
    let cy = (baseRadius + r) * Math.sin(phi)
    const size = Math.min(r * 2, 60)

    if (count === 2) {
        if (index == 0) {
            cx = 25
            cy = -30
        }
        if (index == 1) {
            cx = -85
            cy = -30
        }
    }
    if (count === 3) {
        if (index == 0) {
            cx = 25
            cy = -30
        }
        if (index == 1) {
            cx = -56
            cy = 19
        }
        // translate(-35.641px, 33.282px)
        // translate(-34.641px, 23.282px)
        if (index == 2) {
            cx = -53
            cy = -80
        }
    }
    if (count === 4) {
        cx -= 30
        cy -= 30
    }
    if (count === 5) {
        cx -= 30
        cy -= 30
    }
    if (count === 6) {
        cx -= 25
        cy -= 25
    }
    if (count === 7) {
        cx -= 25
        cy -= 25
    }

    return { cx, cy, size }
}
