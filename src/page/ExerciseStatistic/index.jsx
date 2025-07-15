import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Table from "./Table";
import Filter from "./Filter";
import "../Exercise/exercise.css";

export default function ExerciseStatistic() {
  const { t, i18n } = useTranslation(["exercise", "common"]);
  const [exercises, setExercises] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [countExercises, setCountExercises] = useState("");
  const [nextPageToken, setNextPageToken] = useState("");

  return (
    <div>
      <h1 className="container-title">{t("exercise_statistic")}</h1>
      <div className="containers-content">
        <Filter
          selectedLesson={selectedLesson}
          setSelectedLesson={setSelectedLesson}
          setExercises={setExercises}
          setCountExercises={setCountExercises}
          setNextPageToken={setNextPageToken}
        />
        <Table          
          selectedLesson={selectedLesson}
          exercises={exercises}
          setExercises={setExercises}
          countExercises={countExercises}
          nextPageToken={nextPageToken}
          setNextPageToken={setNextPageToken}
        />
        {/* <MoreButton /> */}
      </div>
    </div>
  );
}
