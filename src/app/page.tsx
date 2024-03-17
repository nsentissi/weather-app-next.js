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
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import { unique } from "next/dist/build/utils";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";

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
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);
  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const tempConverter = (temp: number) => {
    const celsius = temp - 273.15;
    return Math.floor(celsius);
  };

  const firstData = data?.list[1];

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end">
                  <p>
                    {firstData?.dt_txt
                      ? format(parseISO(firstData?.dt_txt ?? ""), "EEEE")
                      : "unavailable"}
                  </p>
                  <p className="text-lg">
                    (
                    {firstData?.dt_txt
                      ? format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")
                      : "unavailable"}
                    )
                  </p>
                </h2>
                <Container className="gap-10 px-6 items-center">
                  <div className="flex flex-col px-4">
                    <span className="text-5xl text-center">
                      {tempConverter(firstData?.main.temp ?? 0)}°
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span>Feels like</span>
                      <span>
                        {tempConverter(firstData?.main.feels_like ?? 0)}°
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {tempConverter(firstData?.main.temp_min ?? 0)}°↓
                      </span>
                      <span>
                        {tempConverter(firstData?.main.temp_max ?? 0)}°↑
                      </span>
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
                    visibility={metersToKilometers(
                      firstData?.visibility ?? 10000
                    )}
                    airPressure={`${firstData?.main.pressure} hpa`}
                    humidity={`${firstData?.main.humidity}%`}
                    sunrise={
                      data?.city?.sunrise
                        ? format(fromUnixTime(data.city.sunrise), "H:mm")
                        : "Unavailable"
                    }
                    sunset={
                      data?.city?.sunset
                        ? format(fromUnixTime(data.city.sunrise), "H:mm")
                        : "Unavailable"
                    }
                    windSpeed={
                      firstData?.wind?.speed
                        ? convertWindSpeed(firstData?.wind.speed)
                        : "Unavailable"
                    }
                  />
                </Container>
              </div>
            </section>
            <section className="flex w-full flex-col gap-4">
              <p className="text-2xl">Forecast (7 days)</p>
              {firstDataForEachDate.map((listItem, index) => (
                <ForecastWeatherDetail
                  key={index}
                  description={listItem?.weather[0].description ?? ""}
                  weatherIcon={listItem?.weather[0].icon ?? ""}
                  date={
                    listItem?.dt_txt
                      ? format(parseISO(listItem?.dt_txt), "dd.MM")
                      : ""
                  }
                  day={
                    listItem?.dt_txt
                      ? format(parseISO(listItem?.dt_txt), "EEEE")
                      : ""
                  }
                  feels_like={listItem?.main.feels_like ?? 0}
                  temp={listItem?.main.temp ?? 0}
                  temp_max={listItem?.main.temp_max ?? 0}
                  temp_min={listItem?.main.temp_min ?? 0}
                  airPressure={`${listItem?.main.pressure} hPa`}
                  humidity={`${listItem?.main.humidity}%`}
                  sunrise={
                    data?.city
                      ? format(fromUnixTime(data.city.sunrise), "H:mm")
                      : "Unavailable"
                  }
                  sunset={
                    data?.city
                      ? format(fromUnixTime(data.city.sunset), "H:mm")
                      : "Unavailable"
                  }
                  visibility={`${metersToKilometers(
                    listItem?.visibility ?? 0
                  )} km`}
                  windSpeed={`${convertWindSpeed(
                    listItem?.wind.speed ?? 0
                  )} km/h`}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      <div className="space-y-2 animate-pulse">
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>

        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
