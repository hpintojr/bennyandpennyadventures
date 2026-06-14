import React from "react";

export function Logo() {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        textAlign: "center"
      }}
    >
      <div
        aria-hidden="true"
        style={{
          alignItems: "center",
          background: "#EB6373",
          borderRadius: "999px",
          boxShadow: "0 12px 28px rgba(235, 99, 115, 0.24)",
          color: "#FFFFFF",
          display: "flex",
          fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif",
          fontSize: "1.75rem",
          fontWeight: 950,
          height: "3.25rem",
          justifyContent: "center",
          width: "3.25rem"
        }}
      >
        ♥
      </div>
      <div>
        <div
          style={{
            color: "#043F49",
            fontFamily: "Playfair Display, Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1
          }}
        >
          Benny &amp; Penny&apos;s
        </div>
        <div
          style={{
            color: "#065766",
            fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif",
            fontSize: "1rem",
            fontWeight: 900,
            letterSpacing: "0.16em",
            marginTop: "0.45rem",
            textTransform: "uppercase"
          }}
        >
          Admin Panel
        </div>
      </div>
    </div>
  );
}
