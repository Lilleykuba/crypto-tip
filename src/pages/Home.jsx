import { Link } from "react-router-dom";

const Home = () => {
  const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

  return (
    <div className="container">
      <h1>Welcome to Crypto Tipping</h1>
      <p>Support your favorite creators with cryptocurrency tips!</p>
      <Link to="/register">Register as a Creator</Link>
      <ul>
        {profiles.map((profile, index) => (
          <li key={index}>
            <Link to={`/profile/${profile.username}`}>{profile.username}</Link>{" "}
            - {profile.bio}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
