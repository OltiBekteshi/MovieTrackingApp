import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import facts from "../../facts.json";

const MovieFacts = () => {
  return (
    <div
      className="p-10 flex flex-col items-center justify-center bg-linear-to-r from-blue-500  to-green-900 shadow-md "
      style={{
        color: "#e0e0e0",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-white drop-shadow-lg tracking-wide">
        Fakte rreth disa filmave
      </h1>

      <div className="w-full max-w-6xl space-y-4">
        {facts.map((fact, index) => (
          <Accordion
            key={index}
            sx={{
              backgroundColor: "rgba(20, 20, 20, 0.9)",
              color: "#e0e0e0",
              borderRadius: "4px",
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.05)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                {fact.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                {fact.text}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default MovieFacts;
