import React from "react";
import Container from "./Container";
import WeatherIcon from "./WeatherIcon";
import { WeatherDetailProps } from "./WeatherDetails";

export interface ForecastWeatherDetailProps extends WeatherDetailProps {
  weatherIcon: string;
  date: string;
  day: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
}

export default function ForecastWeatherDetail(
  props: ForecastWeatherDetailProps
) {
  const {
    weatherIcon = "02d",
    date = "19.09",
    day = "Tuesday",
    temp,
    feels_like,
    temp_min,
    temp_max,
    description,
  } = props;

const tempConverter = (temp: number) => {
    const celsius = temp - 273.15;
    return Math.floor(celsius);
  };
  return (
    <Container className="gap-4">
      <section className="flex gap-4 items-center px-4">
        <div>
          <WeatherIcon iconName={weatherIcon} />
          <p>{date}</p>
          <p className="text-sm">{day}</p>
        </div>

        <div className="flex flex-col px-4">
            <span className="text-5xl">{tempConverter(temp)}°</span>
            <p className="text-xs space-x-1 whitespace-nowrap">
                <span> Feels like</span>
                <span>{tempConverter(feels_like)}°</span>
            </p>
            <p className="capitalize">{description}</p>
        </div>
      </section>

      <section>
        
      </section>
    </Container>
  );
}
