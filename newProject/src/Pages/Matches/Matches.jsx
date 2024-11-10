import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import style from "./Matches.module.css";

export default function Matches() {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMatches, setLikedMatches] = useState([]);
  const email = useSelector((state) => state.user.email);

  useEffect(() => {
    async function fetchProfileInfo() {
      try {
        const response = await fetch(
          `http://localhost:3000/profile-info?email=${email}`
        );
        const profileData = await response.json();

        if (response.ok) {
          setProfile(profileData);
        } else {
          console.error("Error fetching profile info:", profileData);
        }
      } catch (error) {
        console.error("Error fetching profile info:", error);
      }
    }

    if (email) {
      fetchProfileInfo();
    }
  }, [email]);

  useEffect(() => {
    async function fetchMatches() {
      if (!profile) return;

      try {
        const response = await fetch("http://localhost:3000/find-matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interests: profile.interests,
            career: profile.career,
            yearOfStudy: profile.yearOfStudy,
            email,
          }),
        });

        const matchData = await response.json();
        if (response.ok) {
          const orderedMatches = [
            ...matchData.oneMatch,
            ...matchData.twoMatches,
            ...matchData.threeOrMoreMatches,
          ];
          setMatches(orderedMatches);
        } else {
          console.error("Error fetching matches:", matchData);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    }

    if (profile) {
      fetchMatches();
    }
  }, [email, profile]);

  async function handleLike () {
    if (currentIndex >= matches.length) return;

    const likedMatch = matches[currentIndex];

    try {
      const response = await fetch("http://localhost:3000/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          likerEmail: email,
          likedEmail: likedMatch.email,
        }),
      });

      if (response.ok) {
        setLikedMatches((prev) => [...prev, likedMatch]);
      } else {
        console.error("Error liking user");
      }
    } catch (error) {
      console.error("Error liking user:", error);
    }

    setCurrentIndex(currentIndex + 1);
  };

  function handleSkip () {
    if (currentIndex < matches.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentMatch = matches[currentIndex];
  const isLiked = likedMatches.includes(currentMatch);

  return (
    <div className={style.pageContainer}>
      <div className={style.header}>
        <p>
          You have many friends who have similar interests. Swipe through to see
          their profiles and connect.
        </p>
      </div>

      {currentMatch ? (
        <div className={style.card}>
          <h3>{currentMatch.username}</h3>
          <p>Year of Study: {currentMatch.yearOfStudy}</p>
          <p>Career Interests: {currentMatch.career.join(", ")}</p>
          <p>Hobbies: {currentMatch.interests.join(", ")}</p>
          {isLiked && (
            <p>
              Telegram:{" "}
              {currentMatch.telegram.startsWith("@")
                ? currentMatch.telegram
                : `@${currentMatch.telegram}`}
            </p>
          )}

          <div className={style.buttons}>
            <button className={style.likeButton} onClick={handleLike}>
              Like
            </button>
            <button className={style.skipButton} onClick={handleSkip}>
              Skip
            </button>
          </div>
        </div>
      ) : (
        <p className={style.noMoreMatches}>No more matches or you did not add information about you. Add it in account(top-right button)</p>
      )}
    </div>
  );
}
