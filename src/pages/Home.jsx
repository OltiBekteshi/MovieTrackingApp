import Swipper from "../components/Swipper";
import OscarsWinners from "../components/OscarsWinners";
import MovieFacts from "../components/MovieFacts";
import TopRated from "../components/TopRated";

const Home = ({ watchlist, setWatchlist }) => {
  return (
    <>
      <Swipper watchlist={watchlist} setWatchlist={setWatchlist} />

      <TopRated />
      <OscarsWinners />
      <MovieFacts />
    </>
  );
};

export default Home;
