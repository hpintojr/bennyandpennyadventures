"use client";

type Props = {
  cellData?: unknown;
};

export function YesNoCell({ cellData }: Props) {
  const value = cellData === true || cellData === "true" || cellData === 1;
  return <span>{value ? "Yes" : "No"}</span>;
}
