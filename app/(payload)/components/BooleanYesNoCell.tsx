import React from "react";

type BooleanYesNoCellProps = {
  cellData?: boolean | string | null;
};

function normalizeBoolean(value: BooleanYesNoCellProps["cellData"]) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

export function BooleanYesNoCell({ cellData }: BooleanYesNoCellProps) {
  const enabled = normalizeBoolean(cellData);

  return (
    <span className={enabled ? "bp-boolean-cell bp-boolean-cell--yes" : "bp-boolean-cell bp-boolean-cell--no"}>
      {enabled ? "Yes" : "No"}
    </span>
  );
}

export default BooleanYesNoCell;
