import { Routes, Route } from "react-router-dom";

import ContestList from "./ContestList";
import CreateContest from "./CreateContext";
import EditContest from "./EditContext";
import AddContestQuestion from "./AddContestQuestion";
import AddDescriptiveContestQuestion from "./AddDescriptiveContestQuestion";
import AddCodingContestQuestion from "./AddCodingContestQuestion";

const ContestManagement = () => {
  return (
    <Routes>
      <Route index element={<ContestList />} />

      <Route path="create" element={<CreateContest />} />
      <Route path="edit/:id" element={<EditContest />} />

      {/* MCQ */}
      <Route
        path=":contestId/questions/add"
        element={<AddContestQuestion />}
      />

      {/* Descriptive */}
      <Route
        path=":contestId/questions/descriptive/add"
        element={<AddDescriptiveContestQuestion />}
      />

      {/* Coding */}
      <Route
        path=":contestId/questions/coding/add"
        element={<AddCodingContestQuestion />}
      />
    </Routes>
  );
};

export default ContestManagement;