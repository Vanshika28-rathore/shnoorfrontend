import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@auth/useAuth";
import { auth } from "../../../auth/firebase";
import AddPracticeView from "./view";

const AddPractice = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    starter_code: "function solution() {\n  // Write your code here\n}",
    test_cases: [{ input: "", output: "", isPublic: true }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [activeTab, setActiveTab] = useState("manual");
  const [csvFile, setCsvFile] = useState(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadResults, setBulkUploadResults] = useState(null);

  const handleCodeChange = (value) => {
    setFormData({ ...formData, starter_code: value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.test_cases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value,
    };
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      test_cases: [
        ...formData.test_cases,
        { input: "", output: "", isPublic: true },
      ],
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.test_cases.filter((_, i) => i !== index);
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const toggleTestCaseVisibility = (index) => {
    const newTestCases = [...formData.test_cases];
    newTestCases[index].isPublic = !newTestCases[index].isPublic;
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      toast.error("Authentication lost. Please refresh.");
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();

      await api.post(
        "/api/practice",
        { ...formData, type: "code" },
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ SAME AS ADDCOURSE
        },
      );

      toast.success("Challenge published!");
      navigate("/instructor/practice");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setBulkUploadResults(null); // Reset previous results
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile || !auth.currentUser) {
      toast.error("Please select a file and ensure you're logged in");
      return;
    }

    setBulkUploadLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const formDataObj = new FormData();
      formDataObj.append("csvFile", csvFile);

      const response = await api.post(
        "/api/practice/bulk-upload",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setBulkUploadResults(response.data);

      if (response.data.summary.successful > 0) {
        toast.success(
          `Successfully uploaded ${response.data.summary.successful} challenge(s)!`,
        );
      }

      if (response.data.summary.failed > 0) {
        toast.error(
          `${response.data.summary.failed} challenge(s) failed to upload. Check errors below.`,
        );
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload CSV");
    } finally {
      setBulkUploadLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template with example data
    const csvContent = `title,description,difficulty,starter_code,test_cases
"Two Sum","Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",Easy,"function twoSum(nums, target) {
  // Write your solution here
}","[{""input"":""[2,7,11,15], 9"",""output"":""[0,1]"",""isPublic"":true},{""input"":""[3,2,4], 6"",""output"":""[1,2]"",""isPublic"":false}]"
"Reverse String","Write a function that reverses a string. The input string is given as an array of characters.",Medium,"function reverseString(s) {
  // Write your solution here
}","[{""input"":""['h','e','l','l','o']"",""output"":""['o','l','l','e','h']"",""isPublic"":true}]"`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "practice_challenges_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Template downloaded!");
  };

  return (
    <AddPracticeView
      formData={formData}
      handleChange={handleChange}
      handleCodeChange={handleCodeChange}
      handleTestCaseChange={handleTestCaseChange}
      addTestCase={addTestCase}
      removeTestCase={removeTestCase}
      toggleTestCaseVisibility={toggleTestCaseVisibility}
      handleSubmit={handleSubmit}
      navigate={navigate}
      loading={loading}
       activeTab={activeTab}
      setActiveTab={setActiveTab}
      csvFile={csvFile}
      handleFileChange={handleFileChange}
      handleBulkUpload={handleBulkUpload}
      bulkUploadLoading={bulkUploadLoading}
      bulkUploadResults={bulkUploadResults}
      downloadTemplate={downloadTemplate}
    />
  );
};

export default AddPractice;
