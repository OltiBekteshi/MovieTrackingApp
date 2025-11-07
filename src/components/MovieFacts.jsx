import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const MovieFacts = () => {
  return (
    <div
      className="p-10 flex flex-col items-center justify-center "
      style={{
        background: "black",
        color: "#e0e0e0",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
   <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-white drop-shadow-lg tracking-wide">
         Fakte rreth disa filmave
      </h1>

      <div className="w-full max-w-6xl space-y-4">
        {[
          {
            title: "Titanic",
            text: "Titaniku kishte një iceberg të vërtetë… pak a shumë - Skena me iceberg-un në Titanic nuk ishte vetëm CGI; James Cameron ndërtoi një kopje të vërtetë 15-tonëshe për aktorët të ndërvepronin me të.",
          },
          {
            title: "Harry Potter and the Chamber of Secrets",
            text: "Zëri i Dobby në Harry Potter ishte një problem - Aktori që e jepte zërin e Dobby-t në fillim kishte vetëm disa linja për të lexuar, por regjistrimet e tij ishin shumë të shpejta dhe me tonalitet të lartë, kështu që duhej muaj për ta bërë të kuptueshëm.",
          },
          {
            title: "The Lord of the Rings: The Fellowship of the Ring",
            text: "Peter Jackson përdori truke perspektive për të bërë që Hobbitët të dukeshin më të vegjël pa CGI — një iluzion kinematik klasik!",
          },
          {
            title: "The Lion King",
            text: "The Lion King është në thelb një adaptim i Hamlet nga Shakespeare - madje edhe Scar është Claudius i botës së kafshëve.",
          },
          {
            title: "Gladiator",
            text: "Një makinë moderne shfaqet në sfond të një skene në Gladiator - një nga 'gabimet' më të famshme që fansat e duan.",
          },
          {
            title: "Mission Impossible",
            text: "Tom Cruise ka bërë aktrime aq të rrezikshme sa ka thyer kocka dhe dislokuar shpatulla gjatë xhirimeve. Superhero i vërtetë.",
          },
          {
            title: "Star Wars: Episode IV - A New Hope",
            text: "David Prowse luajti fizikisht Darth Vader, por zëri ishte i James Earl Jones - Prowse nuk e dëgjoi zërin e tij deri në premierë!",
          },
          {
            title: "Psycho",
            text: "Skena e famshme e dushit në Psycho u xhirua për 7 ditë me 70 kënde kamerash — gjaku ishte shurup çokollate.",
          },
        ].map((fact, index) => (
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
              expandIcon={<ExpandMoreIcon sx={{ color: "red" }} />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#ffffff",
                  textShadow: "0 0 8px rgba(250, 204, 21, 0.5)",
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