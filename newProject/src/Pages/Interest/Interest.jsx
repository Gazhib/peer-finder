import { useEffect, useState } from "react";
import style from "./Interest.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { userActions } from "../../../store";

export default function InterestPage() {
  const CAREERS = [
    "None",
    "Math",
    "IT",
    "Finance",
    "Arts",
    "Biol",
    "Sports",
    "Politics",
    "Literature",
    "Physics",
    "Chem",
    "Robotics",
    "Engineer",
    "Soci.",
    "Languages",
  ];
  const SPORTS = [
    "None",
    "Basketball",
    "Swimming",
    "Cycling",
    "Running",
    "Table tennis",
    "Football",
    "Dance",
    "Wrestling",
    "Boxing",
    "Volleyball",
    "Kickboxing",
  ];

  const [choosenCareers, setChoosenCareers] = useState([]);
  const [choosenSports, setChoosenSports] = useState([]);
  const [choosenYear, setChoosenYear] = useState(null);
  const [telegramTag, setTelegramTag] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCareersOpen, setIsCareersOpen] = useState(false);
  const [isSportsOpen, setIsSportsOpen] = useState(false);
  const [mutualLikes, setMutualLikes] = useState([]);

  const dispatch = useDispatch();
  const email = useSelector((state) => state.user.email);
  const { user } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (email !== user) {
      navigate("/", { replace: true });
    }
  }, [email, user, navigate]);

  const toggleCareersDropdown = () => setIsCareersOpen(!isCareersOpen);
  const toggleSportsDropdown = () => setIsSportsOpen(!isSportsOpen);

  function handleCareerClick(career) {
    setChoosenCareers((prev) =>
      prev.includes(career)
        ? prev.filter((item) => item !== career)
        : [...prev, career]
    );
  }

  function handleSportClick(sport) {
    setChoosenSports((prev) =>
      prev.includes(sport)
        ? prev.filter((item) => item !== sport)
        : [...prev, sport]
    );
  }

  function handleLeaveAccount() {
    dispatch(userActions.clearInfo());
    navigate("/", { replace: true });
  }

  function handleYearClick(year) {
    setChoosenYear(year);
  }

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch(
          `http://localhost:3000/profile-info?email=${email}`
        );
        const data = await response.json();

        if (response.ok) {
          setChoosenCareers(data.career || []);
          setChoosenSports(data.interests || []);
          setChoosenYear(data.yearOfStudy || null);
          setTelegramTag(data.telegram || "");
        } else {
          setErrorText("Failed to load profile data.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setErrorText("An error occurred while fetching profile data.");
      }
    }

    fetchUserProfile();
  }, [email]);

  useEffect(() => {
    async function fetchMutualLikes() {
      try {
        const response = await fetch(
          `http://localhost:3000/mutual-likes?email=${email}`
        );
        const mutualLikesData = await response.json();

        if (response.ok) {
          setMutualLikes(mutualLikesData);
        } else {
          setErrorText("Failed to load mutual likes.");
        }
      } catch (error) {
        console.error("Error fetching mutual likes:", error);
        setErrorText("An error occurred while fetching mutual likes.");
      }
    }

    if (email) {
      fetchMutualLikes();
    }
  }, [email]);

  async function handleSubmit() {
    setIsSubmitting(true);
    if (choosenCareers.length === 0) {
      setIsSubmitting(false);
      setErrorText("Please choose at least one career option.");
      return;
    }
    if (choosenSports.length === 0) {
      setIsSubmitting(false);
      setErrorText("Please choose at least one sport option.");
      return;
    }
    if (choosenYear === null) {
      setIsSubmitting(false);
      setErrorText("Please select your year of study.");
      return;
    }
    if (telegramTag.trim() === "") {
      setIsSubmitting(false);
      setErrorText("Please enter your Telegram tag.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          interests: choosenSports,
          career: choosenCareers,
          yearOfStudy: choosenYear,
          telegram: telegramTag,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorText(result);
        setIsSubmitting(false);
        return;
      }

      setErrorText("Profile updated successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorText("An error occurred while updating your profile.");
    }

    setErrorText("");
    setIsSubmitting(false);
  }

  return (
    <div className={style.InterestPage}>
      <div className={style.container}>
        <div className={style.section}>
          <h2>Mutual Likes</h2>
          {mutualLikes.length > 0 ? (
            <ul className={style.mutualLikes}>
              {mutualLikes.map((user, index) => (
                <li key={index}>
                  <h4>{user.username}</h4>
                  <p>Year of Study: {user.yearOfStudy}</p>
                  <p>Career Interests: {user.career.join(", ")}</p>
                  <p>Hobbies: {user.interests.join(", ")}</p>
                  <p>
                    Telegram:{" "}
                    {user.telegram.startsWith("@")
                      ? user.telegram
                      : `@${user.telegram}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No mutual likes found.</p>
          )}
        </div>

        <div className={style.section}>
          <h2>Choose your hobbies and interests</h2>
          <div className={style.card}>
            <span
              className={style.dropdown_arrow}
              onClick={toggleCareersDropdown}
            >
              Career following &#9662;
            </span>
            {isCareersOpen && (
              <div className={style.dropdown_content}>
                {CAREERS.map((value, id) => (
                  <button
                    key={id}
                    className={`${style.button} ${
                      choosenCareers.includes(value) ? style.selected : ""
                    }`}
                    onClick={() => handleCareerClick(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={style.section}>
          <h2>Year of study</h2>
          <div className={style.card}>
            {[1, 2, 3, 4].map((year) => (
              <button
                key={year}
                className={`${style.button} ${
                  choosenYear === year ? style.selected : ""
                }`}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className={style.section}>
          <h2>Sports</h2>
          <div className={style.card}>
            <span
              className={style.dropdown_arrow}
              onClick={toggleSportsDropdown}
            >
              Sports &#9662;
            </span>
            {isSportsOpen && (
              <div className={style.dropdown_content}>
                {SPORTS.map((value, id) => (
                  <button
                    key={id}
                    className={`${style.button} ${
                      choosenSports.includes(value) ? style.selected : ""
                    }`}
                    onClick={() => handleSportClick(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={style.section}>
          <h2>Telegram Tag</h2>
          <input
            type="text"
            value={telegramTag}
            onChange={(e) => setTelegramTag(e.target.value)}
            className={style.input}
            placeholder="Enter your Telegram tag"
          />
        </div>

        {errorText && <div className={style.errorText}>{errorText}</div>}

        <div className={style.submitSection}>
          <button
            disabled={isSubmitting}
            className={style.submitButton}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button className={style.leaveButton} onClick={handleLeaveAccount}>
            Leave Account
          </button>
        </div>
      </div>
    </div>
  );
}
