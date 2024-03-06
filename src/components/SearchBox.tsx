import React from "react";
import { CiSearch } from "react-icons/ci";
import { cn } from "@/utils/cn";

type Props = {
  className?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  onSubmit: React.FormEventHandler<HTMLFormElement> | undefined;
};

export default function SearchBox(props: Props) {
  return (
    <form
      onSubmit={props.onSubmit}
      className={cn("flex relative items-center justify-center h-10", props.className)}
    >
      <input
        onChange={props.onChange}
        value={props.value}
        type="text"
        placeholder="Search location"
        className="border border-gray-300 px-4 py-2 w-[230px] rounded-l-md focus:outline-none focus:border-blue-500 h-full "
      />
      <button className="bg-blue-500 px-4 py-2 h-full text-white rounded-r-md hover:bg-blue-600">
        <CiSearch className="text-xl " />
      </button>
    </form>
  );
}
