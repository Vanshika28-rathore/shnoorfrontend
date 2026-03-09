import React from "react";
import { useNavigate } from "react-router-dom";
import MockTestView from "./view";

const MockTest = () => {
  const navigate = useNavigate();
  return <MockTestView navigate={navigate} />;
};

export default MockTest;