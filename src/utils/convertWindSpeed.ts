/** format */

export function convertWindSpeed(speedInMetersPerSecond : number) {
    const speedInKilometeresPerHour = speedInMetersPerSecond * 3.6;
    return `${speedInKilometeresPerHour.toFixed(0)}km/h`
}