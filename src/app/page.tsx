"use client";

import Navbar from "@/components/Navbar";
import axios from "axios";
import { format, fromUnixTime } from "date-fns";
import { parseISO } from "date-fns";
import Image from "next/image";
import Container from "@/components/Container";
import { useQuery } from "react-query";
import WeatherIcon from "@/components/WeatherIcon";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import WeatherDetails from "@/components/WeatherDetails";
import { metersToKilometers } from "@/utils/meterToKilometers";
import { convertWindSpeed } from "@/utils/convertWindSpeed";

type WeatherData = {
  cod: string;
  message: number;
  cnt: number;
  list: ListItem[];
  city: City;
};

type ListItem = {
  dt: number;
  main: Main;
  weather: WeatherItem[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  sys: Sys;
  dt_txt: string;
};

type Main = {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
};

type WeatherItem = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type Clouds = {
  all: number;
};

type Wind = {
  speed: number;
  deg: number;
  gust: number;
};

type Sys = {
  pod: string;
};

type City = {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
};

type Coord = {
  lat: number;
  lon: number;
};

export default function Home() {
  const { isLoading, error, data } = useQuery<WeatherData>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=Dakar&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    }
  );

  const tempConverter = (temp: number) => {
    const celsius = temp - 273.15;
    return Math.floor(celsius);
  };

  const firstData = data?.list[1];

  console.log(data);

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p>{format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}</p>
              <p className="text-lg">
                ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")})
              </p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl text-center">
                  {tempConverter(firstData?.main.temp ?? 0)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>{tempConverter(firstData?.main.feels_like ?? 0)}°</span>
                </p>
                <p className="text-xs space-x-2">
                  <span>{tempConverter(firstData?.main.temp_min ?? 0)}°↓</span>
                  <span>{tempConverter(firstData?.main.temp_max ?? 0)}°↑</span>
                </p>
              </div>
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                  >
                    <p className="whitespace-nowrap">
                      {format(parseISO(data.dt_txt), "h:mm a")}
                    </p>

                    <WeatherIcon
                      iconName={getDayOrNightIcon(
                        data.weather[0].icon,
                        data.dt_txt
                      )}
                    />
                    <p> {tempConverter(firstData?.main.temp ?? 0)}°</p>
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">
                {" "}
                {firstData?.weather[0].description}
              </p>
              <WeatherIcon
                iconName={getDayOrNightIcon(
                  firstData?.weather[0].icon ?? "",
                  firstData?.dt_txt ?? ""
                )}
              />
            </Container>
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
              <WeatherDetails
                visibility={metersToKilometers(firstData?.visibility ?? 10000)}
                airPressure={`${firstData?.main.pressure} hpa`}
                humidity={`${firstData?.main.humidity}%`}
                sunrise={data?.city?.sunrise ? format(fromUnixTime(data.city.sunrise), "H:mm") : 'Unavailable'}
                sunset={data?.city?.sunset ? format(fromUnixTime(data.city.sunrise), "H:mm") : 'Unavailable'}
                windSpeed={ firstData?.wind?.speed  ?  convertWindSpeed(firstData?.wind.speed) : 'Unavailable'}
              />
            </Container>
          </div>
        </section>
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7 days)</p>
        </section>
      </main>
    </div>
  );
}
